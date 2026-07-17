# LIS Server API

## What it does

NestJS server that simultaneously acts as an MLLP/TCP server for Zybio EXR-110 POCT analyzers (HL7 v2.3.1 protocol) and a REST API for external systems. Devices connect over TCP, upload test results and QC data, query work orders — the server parses HL7 messages, persists everything to SQLite, and replies with proper ACKs. External systems (dashboards, HIS) use the REST API to query results, manage work orders, and monitor devices.

## Entry points

1. `src/hl7/mllp.service.ts` — TCP server, MLLP framing, connection pool. Start here for device communication.
2. `src/hl7/hl7-router.service.ts` — Message dispatch. After MLLP extracts a frame, the router parses MSH-9 and delegates.
3. `src/app.module.ts` — Module wiring. Shows how all 10 modules connect.

## How it works — the important parts

### MLLP Frame Extraction (the TCP byte-stream problem)

Devices send HL7 messages over raw TCP wrapped in MLLP framing (`0x0B` + body + `0x1C 0x0D`). TCP delivers bytes in arbitrary chunks — one `data` event might contain half a message, two complete messages, or 1.5 messages. The frame extractor must handle all cases.

`MllpService` maintains a per-connection `Buffer` that accumulates bytes. On each `data` event, it appends the chunk, then calls `extractFrames()` which scans for the `EB+CR` end marker, backtracks to find the `SB` start marker, and extracts the body between them. Remaining bytes stay in the buffer for the next event. The static method supports multiple frames in one buffer pass (loop until no more `EB+CR` found).

The service extends `EventEmitter` and emits `'frame'` events with `(deviceId, messageBody)`. This decouples transport from protocol logic.

### HL7 Message Routing (handler registry pattern)

The router subscribes to `MllpService` 'frame' events in `onModuleInit()`. For each frame:
1. Parse via `Hl7ParserService.parse(raw)` → get `Hl7Message` with typed MSH header
2. Look up handler in `Map<string, Hl7MessageHandler>` by `msh.messageType`
3. Call `handler.handle(message, deviceId)` → get response string(s)
4. Send response(s) back via `MllpService.sendToDevice()`

Handlers self-register during their `onModuleInit()` — e.g. `OruHandlerService` registers for `'ORU^R01'`, `QryHandlerService` for `'QRY^Q02'`. This is open-closed: add new message types by creating a new handler service, no router changes needed.

Error handling is comprehensive: parse failures → `MSA|AE`, unknown types → `MSA|AR`, handler exceptions → `MSA|AE` with code 207. The router **never throws** — all errors produce an ACK response.

### ORU^R01 Processing (the core data ingestion path)

`OruHandlerService.handle()` processes both sample results (MSH-11=P) and QC results (MSH-11=Q) from the same message type.

For **sample results**: parses PID (patient), PV1 (visit/department), OBR (order/sample metadata), and OBX segments (test item values). Filters OBX by a hardcoded `METADATA_ITEM_IDS` set (03001-03011, 31525-0, 09001) — these carry instrument metadata, not actual test values. Upserts patient by `medical_record_no` using `INSERT...ON CONFLICT DO UPDATE`, inserts `test_result` + `test_result_items`, returns ACK.

For **QC results**: parses OBR for solution/lot info, extracts QC level from the special `03006` metadata OBX, parses target/SD from OBX-4 (component-separated `target^sd`), inserts `qc_result` + `qc_result_items`, then immediately calls `evaluateQcResult()`.

### QC Pass/Fail Evaluation

`QcService.evaluateQcResult()` implements a ±15% tolerance rule: for each item where `measured_value` is numeric and `target_value` exists, check `target * 0.85 ≤ measured ≤ target * 1.15`. Overall status: 'fail' if ANY item fails, 'pass' if all evaluable items pass, 'pending' if nothing can be evaluated (non-numeric measured values like `<0.01` or `***`).

### Work Order Query/Push (bidirectional communication)

**Query flow** (device → server): Device sends `QRY^Q02` with barcode in `QRD-8`. `QryHandlerService` looks up the pending work order, maps it to `DsrWorkOrder`, returns two MLLP frames: `QCK^Q02` (immediate ack with OK/NF) + `DSR^Q03` (data in DSP segments with set IDs 1-21).

**Push flow** (server → device): REST `POST /work-orders` with `pushToDevice=true` → `WorkOrdersService.create()` calls `OrmSenderService.pushWorkOrder()` → builds `ORM^O01` via `Hl7BuilderService.buildOrm()` → sends via `MllpService.sendToDevice()` → updates `push_status` in DB.

### Database Driver Abstraction

`DatabaseService` exposes `run/get/all` and delegates to a `DatabaseAdapter` interface. Currently only `SqliteAdapter` (better-sqlite3, synchronous) is implemented. All SQL is written in PostgreSQL-compatible subset (no AUTOINCREMENT, standard types, `ON CONFLICT DO UPDATE`). To migrate: create `pg.adapter.ts`, set `DATABASE_DRIVER=postgres` in env.

Migrations are idempotent SQL files (`CREATE TABLE IF NOT EXISTS`) executed in sort order on `onModuleInit()` via `adapter.exec()`.

## Core Implementation

##### MLLP Frame Extraction

The core algorithm that turns a raw TCP byte stream into discrete HL7 messages.

```typescript
// source: src/hl7/mllp.service.ts
static extractFrames(buffer: Buffer): { messages: string[]; remaining: Buffer } {
  const messages: string[] = [];
  let offset = 0;

  while (offset < buffer.length) {
    // Scan forward for EB (0x1C) followed by CR (0x0D) — the frame end marker
    let ebPos = -1;
    for (let i = offset; i < buffer.length - 1; i++) {
      if (buffer[i] === 0x1c && buffer[i + 1] === 0x0d) { ebPos = i; break; }
    }
    if (ebPos === -1) break; // ← no complete frame yet, keep remainder

    // Backtrack to find SB (0x0B) — the frame start marker
    let sbPos = offset;
    while (sbPos <= ebPos && buffer[sbPos] !== 0x0b) sbPos++;
    if (sbPos > ebPos) { offset = ebPos + 2; continue; } // ← garbage before EB, discard

    // Extract body between SB and EB
    messages.push(buffer.subarray(sbPos + 1, ebPos).toString('utf-8'));
    offset = ebPos + 2; // ← advance past EB+CR, continue scanning for more frames
  }

  return { messages, remaining: buffer.subarray(offset) };
}
```

Handles partial frames (returns remainder), multiple frames in one chunk (loop), and garbage bytes (discards data between non-SB and EB). Called on every TCP `data` event after concatenating with the connection's buffer.

**Used by:**
- `MllpService.handleConnection()` socket `data` event handler — the only caller at runtime
- `mllp.service.spec.ts` and `mllp.property.spec.ts` — tested directly as a static method

##### HL7 Router Dispatch

The central dispatch loop that never crashes — always produces an ACK response.

```typescript
// source: src/hl7/hl7-router.service.ts
async processFrame(deviceId: string, raw: string): Promise<void> {
  let controlId = 'unknown';
  try {
    const message = this.parser.parse(raw);
    controlId = message.msh.controlId;
    const handler = this.handlers.get(message.msh.messageType);

    if (!handler) {
      if (message.msh.messageType === 'ACK^R03') return; // ← device ack, ignore
      this.mllp.sendToDevice(deviceId, this.builder.buildAck(controlId, 'AR', 200));
      return;
    }

    const response = await handler.handle(message, deviceId);
    for (const msg of Array.isArray(response) ? response : [response]) {
      this.mllp.sendToDevice(deviceId, msg);
    }
  } catch (err) {
    const code = err instanceof Hl7ParseError ? err.statusCode : 207;
    this.mllp.sendToDevice(deviceId, this.builder.buildAck(controlId, 'AE', code));
  }
}
```

Key design: handlers return `string | string[]` — QryHandler returns two messages (QCK + DSR), OruHandler returns one (ACK). The router handles both cases uniformly.

**Used by:**
- `MllpService` 'frame' event (fire-and-forget via `void this.processFrame(...)`)

##### OBX Metadata Filtering

Distinguishes real test result items from instrument metadata in ORU^R01 messages.

```typescript
// source: src/hl7/oru-handler.service.ts
const METADATA_ITEM_IDS = new Set([
  '03001', '03003', '03004', '03005', '03006',
  '03008', '03009', '03010', '03011', '31525-0', '09001',
]);

private isMetadataObx(obx: Hl7Segment): boolean {
  const itemId = (obx.fields[2] ?? '').split('^')[0]; // ← OBX-3 first component
  return METADATA_ITEM_IDS.has(itemId);
}
```

Without this filter, instrument workflow data (take mode, tube position, worklist sequence) would pollute `test_result_items`. The set covers all known Zybio EXR metadata OBX types. If a new metadata ID appears from a firmware update, add it here.

**Used by:**
- `OruHandlerService.handleSampleResult()` — filters before inserting items
- `OruHandlerService.handleQcResult()` — same filtering for QC items

##### QC Evaluation Logic

Implements the ±15% tolerance rule for quality control pass/fail determination.

```typescript
// source: src/qc/qc.service.ts
evaluateQcResult(qcResultId: number): void {
  const items = this.db.all<QcResultItem>(
    'SELECT * FROM qc_result_items WHERE qc_result_id = ?', [qcResultId]
  );

  let hasFail = false, hasPass = false;
  for (const item of items) {
    if (item.target_value == null || item.measured_value == null) continue;
    const measured = parseFloat(item.measured_value);
    if (isNaN(measured)) continue; // ← "<0.01", "***" can't be evaluated

    const lower = item.target_value * 0.85;
    const upper = item.target_value * 1.15;
    if (measured >= lower && measured <= upper) hasPass = true;
    else hasFail = true;
  }

  const status = hasFail ? 'fail' : hasPass ? 'pass' : 'pending';
  this.db.run('UPDATE qc_results SET status = ? WHERE id = ?', [status, qcResultId]);
}
```

"Any fail → overall fail" is the key rule. Non-numeric measured values (instrument reports `<0.01` when below detection limit) are skipped. If ALL items are non-numeric, result stays 'pending'.

**Used by:**
- `OruHandlerService.handleQcResult()` — called immediately after inserting QC items

##### Work Order Push (ORM^O01)

Builds and sends work orders to connected devices over the existing TCP socket.

```typescript
// source: src/hl7/orm-sender.service.ts
pushWorkOrder(workOrder: WorkOrder, targetDeviceId: string): boolean {
  const ormWorkOrder: OrmWorkOrder = {
    barcode: workOrder.barcode,
    sampleNo: workOrder.barcode, // ← reuse barcode as sample number
    patientName: workOrder.patient_name ?? '',
    patientNo: workOrder.patient_no ?? '',
    sex: workOrder.sex ?? '',
    sampleType: workOrder.sample_type,
    items: workOrder.items.split(','),
    samplingTime: workOrder.sampling_time,
  };

  const ormMessage = this.hl7Builder.buildOrm(ormWorkOrder);
  const sent = this.mllp.sendToDevice(targetDeviceId, ormMessage);

  // Update push_status: 'sent' on success, 'failed' if device not connected
  const now = new Date().toISOString();
  const status = sent ? 'sent' : 'failed';
  this.db.run(
    `UPDATE work_orders SET push_status = ?, pushed_at = ?, updated_at = ? WHERE id = ?`,
    [status, sent ? now : null, now, workOrder.id],
  );
  return sent;
}
```

ponytail: marks as 'sent' on successful TCP write without waiting for device ACK. ACK timeout/retry is the upgrade path.

**Used by:**
- `WorkOrdersService.create()` — when `dto.pushToDevice === true`

## Data flow

### Device uploads a sample result

```
EXR Device → TCP bytes → MllpService (buffer + extractFrames) → emit 'frame'
→ Hl7RouterService.processFrame() → Hl7ParserService.parse() → Hl7Message
→ OruHandlerService.handle():
  1. MessagesService.logMessage() ← raw message to message_log (audit)
  2. DevicesService.updateLastMessage() ← timestamp
  3. DevicesService.updateDeviceInfo() ← from SFT segment
  4. ResultsService.upsertPatient() ← INSERT ON CONFLICT on medical_record_no
  5. ResultsService.createResult() ← test_results row
  6. ResultsService.createResultItems() ← test_result_items (metadata filtered out)
  7. return ACK string
→ MllpService.sendToDevice() → TCP write MLLP-framed ACK → Device
```

**On failure**: If parse fails → error ACK (AE). If DB write fails → handler throws → router catches → error ACK (AE, code 207). Raw message is already logged before processing (step 1), so no data loss.

### Device queries a work order

```
EXR Device → QRY^Q02 (barcode in QRD-8) → MLLP → Router
→ QryHandlerService.handle():
  1. Extract barcode from QRD.fields[7]
  2. WorkOrdersService.findByBarcode() ← only pending orders
  3. If found: build [QCK(OK), DSR(data)] — TWO response messages
     If not: build QCK(NF) — ONE response
→ Router sends each response via MllpService.sendToDevice()
→ Device receives QCK first, then DSR (two separate MLLP frames)
→ Device sends ACK^R03 back (router ignores it — no response needed)
```

## Key files

| File | Role |
|---|---|
| `src/main.ts` | Bootstrap: NestJS app + Swagger + CORS + ValidationPipe |
| `src/app.module.ts` | Root module wiring all 10 feature modules |
| `src/common/api-key.guard.ts` | Global API key guard (X-API-Key header, permissive if unset) |
| `src/common/public.decorator.ts` | @Public() decorator to skip auth |
| `src/database/database.service.ts` | Unified DB interface (run/get/all) + migration runner |
| `src/database/sqlite.adapter.ts` | SQLite driver (better-sqlite3, WAL mode, FK enforcement) |
| `src/database/migrations/001-initial.sql` | All 10 tables DDL (PostgreSQL-compatible subset) |
| `src/hl7/hl7.module.ts` | HL7 module: imports domain modules, provides all HL7 services |
| `src/hl7/mllp.service.ts` | TCP server, MLLP framing, connection pool, EventEmitter |
| `src/hl7/hl7-parser.service.ts` | Parse raw HL7 → Hl7Message (segments + MSH header) |
| `src/hl7/hl7-builder.service.ts` | Build ACK, QCK, DSR, ORM messages |
| `src/hl7/hl7-router.service.ts` | Route parsed messages to handlers by MSH-9 type |
| `src/hl7/hl7.types.ts` | Hl7Message, Hl7Segment, MshSegment, DsrWorkOrder, OrmWorkOrder |
| `src/hl7/oru-handler.service.ts` | Process ORU^R01 (sample + QC results) |
| `src/hl7/qry-handler.service.ts` | Process QRY^Q02 (work order lookup → QCK+DSR) |
| `src/hl7/orm-sender.service.ts` | Push ORM^O01 to connected devices |
| `src/results/results.service.ts` | Test results: create, query, review, void, CSV export |
| `src/results/results.controller.ts` | REST: GET/PUT/DELETE /results |
| `src/qc/qc.service.ts` | QC results: create, evaluate pass/fail, query |
| `src/qc/qc.controller.ts` | REST: GET /qc |
| `src/work-orders/work-orders.service.ts` | Work orders: create (+ auto-push), query, cancel, batch |
| `src/work-orders/work-orders.controller.ts` | REST: POST/GET/DELETE /work-orders |
| `src/devices/devices.service.ts` | Device registry: upsert on connect, track events |
| `src/devices/devices.controller.ts` | REST: GET /devices, GET /devices/:id/history |
| `src/messages/messages.service.ts` | Raw HL7 message audit log |
| `src/messages/messages.controller.ts` | REST: GET /messages |
| `src/patients/patients.service.ts` | Patient CRUD + search + result history |
| `src/patients/patients.controller.ts` | REST: GET/POST/PUT /patients |
| `src/stats/stats.service.ts` | Aggregate queries: daily summary, throughput, device utilization |
| `src/stats/stats.controller.ts` | REST: GET /stats/daily, /stats/throughput, /stats/devices |
| `src/config-items/config-items.service.ts` | Test item reference range config (upsert by name) |
| `src/config-items/config-items.controller.ts` | REST: GET/PUT /config/items |

## API contracts

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Health check (public, no auth) |
| GET | `/results` | Paginated results (filters: date, patient, item, device, status, flag) |
| GET | `/results/export` | CSV export |
| GET | `/results/:id` | Single result with items |
| PUT | `/results/:id/review` | Mark reviewed |
| PUT | `/results/:id/unreview` | Revert review |
| DELETE | `/results/:id` | Soft-delete (void) |
| GET | `/qc` | Paginated QC results (filters: date, item, level, lotNo, status) |
| GET | `/qc/:id` | Single QC result with items |
| POST | `/work-orders` | Create work order (optional push to device) |
| GET | `/work-orders` | Paginated work orders |
| GET | `/work-orders/:id` | Single work order |
| DELETE | `/work-orders/:id` | Cancel work order |
| POST | `/work-orders/batch` | Batch create |
| GET | `/devices` | All devices with status |
| GET | `/devices/:id/history` | Device event timeline |
| GET | `/messages` | Raw HL7 message log (filters: direction, type, device, date) |
| GET | `/messages/:id` | Single message with hex |
| GET | `/patients` | Patient search (name/MRN partial match) |
| GET | `/patients/:id` | Patient detail |
| POST | `/patients` | Create patient |
| PUT | `/patients/:id` | Update patient |
| GET | `/patients/:id/results` | Patient's result history |
| GET | `/stats/daily` | Daily summary (tests, items, abnormal, QC) |
| GET | `/stats/throughput` | Time-series test counts |
| GET | `/stats/devices` | Per-device utilization |
| GET | `/config/items` | All test item configs |
| PUT | `/config/items/:name` | Upsert test item config |
| GET | `/api-docs` | Swagger UI |

## Gotchas & constraints

- **MSH field numbering quirk**: MSH-1 IS the field separator (`|`), so in the parsed `fields[]` array, `fields[0]` = encoding chars (MSH-2), `fields[1]` = sending app (MSH-3). Off by one vs other segments where `fields[0]` = first field after segment name.
- **Circular dependencies**: `Hl7Module ↔ DevicesModule` and `Hl7Module ↔ WorkOrdersModule` use `forwardRef()`. Adding new cross-module dependencies between HL7 handlers and domain modules will likely need the same pattern.
- **Connection ID format**: Device ID is `remoteAddress:remotePort` (e.g. `::ffff:10.0.0.1:5000`). If the device reconnects from the same IP but different port, it gets a NEW device entry. The `updateDeviceInfo()` from SFT helps identify it, but the ID remains IP:port.
- **SQLite single-writer**: Under concurrent load, SQLite's WAL mode helps readers, but writes are still serialized. For >10 concurrent devices writing simultaneously, this could bottleneck. Upgrade path: switch to PostgreSQL (the adapter interface is ready).
- **No ACK timeout on ORM push**: When pushing work orders to devices, the server marks `push_status='sent'` on TCP write success without waiting for the device's ORR^O02 ACK. A dropped connection after write could leave a work order marked 'sent' that the device never received.
- **`export` route before `:id`**: In `ResultsController`, the `@Get('export')` decorator MUST appear before `@Get(':id')` — otherwise NestJS matches "export" as an `id` parameter.
- **Items stored as CSV**: Work order `items` field stores test item names as comma-separated text (`"PCT,CRP"`). The QryHandler also handles JSON array format as a fallback. If item names ever contain commas, this breaks.
- **Date filtering uses string comparison**: All date columns are ISO 8601 TEXT. Filters use `>=` / `<=` string comparison which works for ISO dates but won't handle timezone-aware queries. All times are UTC.

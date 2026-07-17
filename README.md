# Zybio EXR-110 LIS Server

> LIS (Laboratory Information System) backend for Zybio EXR-110/120 POCT analyzers. Receives HL7 v2.3.1 test results over TCP/MLLP, manages work orders, and exposes a REST API for result review, device monitoring, and statistics.

## Table of Contents

- [About](#about)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [HL7 Protocol](#hl7-protocol)
- [Development](#development)
- [Project Structure](#project-structure)

---

## About

This server bridges Zybio EXR-series POCT instruments with hospital workflows. It:

- **Receives** test results (sample + QC) from connected instruments via HL7 ORU^R01
- **Responds** to instrument work order queries (QRY^Q02 → DSR^Q03)
- **Pushes** work orders proactively to instruments (ORM^O01)
- **Tracks** device connectivity and health
- **Exposes** a REST API for UI clients to review results, manage patients, and monitor operations

### Built With

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | NestJS 11 |
| Language | TypeScript 5.7+ |
| Database | SQLite (better-sqlite3, WAL mode) |
| Protocol | HL7 v2.3.1 over MLLP (TCP) |
| Docs | Swagger/OpenAPI at `/api-docs` |

---

## Architecture

```
┌──────────────┐       TCP :10001 (MLLP)       ┌──────────────────┐
│  EXR-110/120 │ ◄──────────────────────────────► │   MLLP Service   │
│  Instrument  │   HL7 frames (SB...EB CR)      │   (net.Server)   │
└──────────────┘                                 └────────┬─────────┘
                                                          │ 'frame' event
                                                 ┌────────▼─────────┐
                                                 │   HL7 Router      │
                                                 │  (dispatch by     │
                                                 │   MSH-9 type)     │
                                                 └──┬─────┬─────┬───┘
                                                    │     │     │
                                          ORU^R01   │ QRY^Q02   │ ACK^R03
                                                    │     │     │ (ignored)
                                          ┌─────────▼┐  ┌─▼────────┐
                                          │ORU Handler│  │QRY Handler│
                                          │(results + │  │(work order│
                                          │ QC store) │  │  lookup)  │
                                          └─────┬─────┘  └──────────┘
                                                │
                                    ┌───────────┼───────────┐
                                    ▼           ▼           ▼
                              ┌──────────┐┌──────────┐┌──────────┐
                              │ Results  ││   QC     ││ Patients │
                              │ Service  ││ Service  ││ Service  │
                              └────┬─────┘└────┬─────┘└────┬─────┘
                                   │           │           │
                                   └───────────┼───────────┘
                                               ▼
                                      ┌─────────────────┐
                                      │  SQLite (WAL)   │
                                      │  ./data/exr110  │
                                      └─────────────────┘

                    HTTP :3000 (REST)
┌──────────┐  ◄──────────────────────────────►  NestJS Controllers
│ UI Client│     JSON + X-API-Key header        (results, devices,
└──────────┘                                     work-orders, stats...)
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (tested with 20.x)
- **pnpm** (package manager)

### Installation

```bash
# Clone
git clone <repo-url>
cd zybio-exr110-server

# Install dependencies
pnpm install

# Start in development mode (watch)
pnpm run start:dev
```

The server starts two listeners:
- **HTTP API** on `http://localhost:3000` (configurable via `PORT` env)
- **MLLP/TCP** on `0.0.0.0:10001` (configurable via `EXR_PORT` env)

Swagger docs available at `http://localhost:3000/api-docs`.

---

## Configuration

Create a `.env` file in the project root:

```env
# TCP port for instrument connections (MLLP)
EXR_PORT=10001

# REST API port (optional, defaults to 3000)
PORT=3000

# API key for REST endpoints (omit for permissive/dev mode)
API_KEY=your-secret-key

# Database (defaults to SQLite at ./data/exr110.db)
DATABASE_DRIVER=sqlite
DATABASE_URL=./data/exr110.db
```

| Variable | Default | Description |
|---|---|---|
| `EXR_PORT` | `10001` | TCP port for MLLP instrument connections |
| `PORT` | `3000` | HTTP REST API port |
| `API_KEY` | _(none)_ | If set, all REST endpoints require `X-API-Key` header. If unset, all requests pass (dev mode). |
| `DATABASE_DRIVER` | `sqlite` | Only `sqlite` is currently supported |
| `DATABASE_URL` | `./data/exr110.db` | SQLite file path |

---

## API Reference

All endpoints require `X-API-Key` header (when `API_KEY` is configured). Interactive docs at `/api-docs`.

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check (public, no auth) |

### Results

| Method | Path | Description |
|---|---|---|
| GET | `/results` | Paginated list (filters: dateFrom, dateTo, patient, item, device, status, flag) |
| GET | `/results/export` | CSV download |
| GET | `/results/:id` | Single result with test items |
| PUT | `/results/:id/review` | Mark as reviewed |
| PUT | `/results/:id/unreview` | Revert review |
| DELETE | `/results/:id` | Soft-delete (void) |

### Work Orders

| Method | Path | Description |
|---|---|---|
| POST | `/work-orders` | Create (optionally push to device) |
| GET | `/work-orders` | Paginated list |
| GET | `/work-orders/:id` | Single work order |
| DELETE | `/work-orders/:id` | Cancel |
| POST | `/work-orders/batch` | Batch create |

### Devices

| Method | Path | Description |
|---|---|---|
| GET | `/devices` | All connected/known devices |
| POST | `/devices/check-all` | TCP-probe all devices, update status |
| POST | `/devices/:id/ping` | Probe single device |
| GET | `/devices/:id/history` | Connection event history |

### QC

| Method | Path | Description |
|---|---|---|
| GET | `/qc` | Paginated QC results |
| GET | `/qc/:id` | Single QC result with items |

### Stats

| Method | Path | Description |
|---|---|---|
| GET | `/stats/daily` | Daily summary (tests, abnormals, QC pass/fail) |
| GET | `/stats/throughput` | Time-series volume (group by day/month) |
| GET | `/stats/devices` | Per-device stats |

### Patients

| Method | Path | Description |
|---|---|---|
| GET | `/patients` | Search by name/MRN |
| GET | `/patients/:id` | Single patient |
| POST | `/patients` | Create |
| PUT | `/patients/:id` | Update |
| GET | `/patients/:id/results` | Patient's test history |

### Messages

| Method | Path | Description |
|---|---|---|
| GET | `/messages` | Raw HL7 message log |
| GET | `/messages/:id` | Single message (hex + decoded) |

### Config

| Method | Path | Description |
|---|---|---|
| GET | `/config/items` | All test item configurations |
| PUT | `/config/items/:name` | Upsert item config (display name, unit, reference range) |

---

## HL7 Protocol

The server implements bidirectional HL7 v2.3.1 communication over MLLP framing.

### Supported Message Types

| Type | Direction | Purpose |
|---|---|---|
| `ORU^R01` | Instrument → Server | Upload test/QC results |
| `ACK^R01` | Server → Instrument | Acknowledge ORU |
| `QRY^Q02` | Instrument → Server | Query work order by barcode |
| `QCK^Q02` | Server → Instrument | Immediate ack for query |
| `DSR^Q03` | Server → Instrument | Work order data response |
| `ORM^O01` | Server → Instrument | Push work order |

### MLLP Framing

```
<SB>message_body<EB><CR>
```
- `<SB>` = `0x0B`, `<EB>` = `0x1C`, `<CR>` = `0x0D`

### Instrument Configuration

On the EXR-110/120 instrument, configure LIS settings:
- **Server IP**: IP address of this server
- **Port**: `10001` (or whatever `EXR_PORT` is set to)
- **Enable LIS**: On

---

## Development

```bash
pnpm run start:dev      # Watch mode
pnpm run start:debug    # With debugger
pnpm run test           # Unit tests
pnpm run test:cov       # Coverage
pnpm run test:e2e       # End-to-end
pnpm run lint           # ESLint fix
pnpm run build          # Compile to dist/
```

### Database

SQLite with WAL mode. Database file at `./data/exr110.db` (auto-created on first run). Migrations run automatically on startup from `src/database/migrations/`.

### Adding a New Module

Always use NestJS CLI:

```bash
pnpm nest g res <name>   # Full CRUD resource
pnpm nest g s <name>     # Service only
pnpm nest g co <name>    # Controller only
```

---

## Project Structure

```
src/
├── main.ts                     # Bootstrap (HTTP + Swagger)
├── app.module.ts               # Root module
├── app.controller.ts           # /health endpoint
├── common/
│   ├── api-key.guard.ts        # Global X-API-Key auth
│   └── public.decorator.ts     # @Public() bypass
├── database/
│   ├── database.service.ts     # Adapter loader + migration runner
│   ├── sqlite.adapter.ts       # better-sqlite3 wrapper
│   └── migrations/             # SQL files (auto-run on start)
├── hl7/
│   ├── mllp.service.ts         # TCP server, MLLP frame extraction
│   ├── hl7-parser.service.ts   # HL7 string → structured message
│   ├── hl7-builder.service.ts  # Build ACK, QCK, DSR, ORM messages
│   ├── hl7-router.service.ts   # Dispatch by message type
│   ├── oru-handler.service.ts  # Process ORU^R01 (results + QC)
│   ├── qry-handler.service.ts  # Process QRY^Q02 (work order query)
│   ├── orm-sender.service.ts   # Push ORM^O01 to device
│   └── hl7.types.ts            # Protocol types & interfaces
├── results/                    # Test result CRUD + review + export
├── qc/                         # QC results + ±15% evaluation
├── devices/                    # Device registry + TCP probe
├── work-orders/                # Work order management + push
├── messages/                   # Raw HL7 message audit log
├── patients/                   # Patient CRUD
├── stats/                      # Aggregation queries
└── config-items/               # Test item configuration
```

---

## License

Private / Unlicensed.

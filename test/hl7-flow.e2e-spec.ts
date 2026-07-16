import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as net from 'net';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

const SB = 0x0b;
const EB = 0x1c;
const CR = 0x0d;

/** Wrap an HL7 message body in MLLP framing. */
function mllpWrap(body: string): Buffer {
  const bodyBuf = Buffer.from(body, 'utf-8');
  const frame = Buffer.alloc(bodyBuf.length + 3);
  frame[0] = SB;
  bodyBuf.copy(frame, 1);
  frame[bodyBuf.length + 1] = EB;
  frame[bodyBuf.length + 2] = CR;
  return frame;
}

/** Extract MLLP frame bodies from a buffer. */
function mllpExtract(buffer: Buffer): string[] {
  const messages: string[] = [];
  let offset = 0;
  while (offset < buffer.length) {
    let ebPos = -1;
    for (let i = offset; i < buffer.length - 1; i++) {
      if (buffer[i] === EB && buffer[i + 1] === CR) {
        ebPos = i;
        break;
      }
    }
    if (ebPos === -1) break;
    let sbPos = offset;
    while (sbPos <= ebPos && buffer[sbPos] !== SB) sbPos++;
    if (sbPos > ebPos) { offset = ebPos + 2; continue; }
    messages.push(buffer.subarray(sbPos + 1, ebPos).toString('utf-8'));
    offset = ebPos + 2;
  }
  return messages;
}

/**
 * Connect a TCP client, send data, and collect all response frames
 * until a timeout (no more data for `waitMs`).
 */
function sendAndReceive(
  port: number,
  data: Buffer,
  waitMs = 1500,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const client = net.createConnection({ port, host: '127.0.0.1' }, () => {
      client.write(data);
    });

    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        client.end();
        const full = Buffer.concat(chunks);
        resolve(mllpExtract(full));
      }, waitMs);
    };

    client.on('data', (chunk) => {
      chunks.push(chunk);
      resetTimer();
    });
    client.on('error', reject);
    // If server closes before we get data, resolve with what we have
    client.on('close', () => {
      clearTimeout(timer);
      const full = Buffer.concat(chunks);
      resolve(mllpExtract(full));
    });
    // Initial timer — in case no response comes at all
    resetTimer();
  });
}

describe('HL7 Full Flow Integration (e2e)', () => {
  let app: INestApplication;
  let db: DatabaseService;
  const testPort = 10099 + Math.floor(Math.random() * 900); // random port to avoid conflicts
  const testDbPath = path.join(__dirname, `test-hl7-flow-${Date.now()}.db`);

  beforeAll(async () => {
    // Override env for test isolation
    process.env.EXR_PORT = String(testPort);
    process.env.DATABASE_DRIVER = 'sqlite';
    process.env.DATABASE_URL = testDbPath;
    process.env.API_KEY = 'test-key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    db = app.get(DatabaseService);

    // Give the TCP server a moment to bind
    await new Promise((r) => setTimeout(r, 200));
  });

  afterAll(async () => {
    // Give pending socket close events time to fire while DB is still open
    await new Promise((r) => setTimeout(r, 300));
    await app.close();
    // Cleanup test DB
    try { fs.unlinkSync(testDbPath); } catch { /* ignore */ }
  });

  describe('ORU^R01 flow — sample result upload', () => {
    const oruMessage = [
      'MSH|^~\\&|Q3|Zybio|||20220104192722||ORU^R01|202201041927229109|P|2.3.1||||||UNICODE',
      'SFT|Zybio|1.1|EXR100|q20-gc14||',
      'PID|1||binlihao^^^^MR||xingmin^|||M|N',
      'PV1|1|huanzheleixin|keshi^^chuanghao|zhuyuanhao||||||||||||||||',
      'OBR|3008||44rr|01001^Automated Count^99MRC||20211223165200|20211223165240|||songjianzhe|||zhenduan|20211223165200|PLASMA|jianYanzhe||||||||HM||||||||',
      'OBX|1|IS|03001^Take Mode^99MRC||O||||||F',
      'OBX|2|NM|31525-0^Age^LN||12|yr|||||F',
      'OBX|3|NM|6806-1^SAA^LN||125.00|μg/mL|<10|A~H|6806||F',
    ].join('\r');

    it('should respond with ACK^R01 containing MSA|AA and the original control ID', async () => {
      const responses = await sendAndReceive(testPort, mllpWrap(oruMessage));

      expect(responses.length).toBeGreaterThanOrEqual(1);
      const ack = responses[0];

      // MSH-9 should be ACK^R01
      expect(ack).toContain('ACK^R01');
      // MSA should be AA with original control ID
      expect(ack).toContain('MSA|AA|202201041927229109');
    });

    it('should persist test_result row with correct sample info', async () => {
      // OBR in test message: OBR|3008||44rr|... → OBR-2 (barcode) is empty, OBR-3 (sample_no) = "44rr"
      const result = db.get<{ sample_no: string; sample_type: string; diagnosis: string }>(
        `SELECT sample_no, sample_type, diagnosis FROM test_results WHERE sample_no = '44rr'`,
      );

      expect(result).toBeDefined();
      expect(result!.sample_no).toBe('44rr');
      expect(result!.sample_type).toBe('PLASMA');
      expect(result!.diagnosis).toBe('zhenduan');
    });

    it('should persist test_result_items (non-metadata OBX only)', async () => {
      const result = db.get<{ id: number }>(
        `SELECT id FROM test_results WHERE sample_no = '44rr'`,
      );
      expect(result).toBeDefined();

      const items = db.all<{ item_id: string; item_name: string; value: string; unit: string; flags: string }>(
        `SELECT item_id, item_name, value, unit, flags FROM test_result_items WHERE result_id = ?`,
        [result!.id],
      );

      // Only OBX|3 (SAA) should be stored — OBX|1 (Take Mode) and OBX|2 (Age) are metadata
      expect(items.length).toBe(1);
      expect(items[0].item_id).toBe('6806-1');
      expect(items[0].item_name).toBe('SAA');
      expect(items[0].value).toBe('125.00');
      expect(items[0].unit).toBe('μg/mL');
      expect(items[0].flags).toBe('A~H');
    });
  });

  describe('QRY^Q02 flow — work order query', () => {
    const qryMessage = [
      'MSH|^~\\&|Q3|Zybio|||20200915103050||QRY^Q02|20220528152659|P|2.3.1||||||ASCII',
      'QRD|20200915103050|R|D|258|||1|123456|OTH|IVD||T',
    ].join('\r');

    beforeAll(() => {
      // Pre-seed a work order with barcode "123456"
      db.run(
        `INSERT INTO work_orders (barcode, patient_name, sex, age, age_unit, sample_type, items, department, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['123456', 'Zhang San', 'F', 24, 'yr', 'WH_BLOOD', 'PCT,CRP', 'Cardiology', 'pending', new Date().toISOString(), new Date().toISOString()],
      );
    });

    it('should respond with QCK^Q02 (MSA|AA, QAK|SR|OK) and DSR^Q03 with DSP segments', async () => {
      const responses = await sendAndReceive(testPort, mllpWrap(qryMessage));

      // Should get 2 frames: QCK then DSR
      expect(responses.length).toBe(2);

      const qck = responses[0];
      const dsr = responses[1];

      // QCK verification
      expect(qck).toContain('QCK^Q02');
      expect(qck).toContain('MSA|AA|20220528152659');
      expect(qck).toContain('QAK|SR|OK');

      // DSR verification
      expect(dsr).toContain('DSR^Q03');
      expect(dsr).toContain('MSA|AA|20220528152659');

      // DSP segments with work order data
      expect(dsr).toContain('DSP|1||Zhang San||');
      expect(dsr).toContain('DSP|2||F||');
      expect(dsr).toContain('DSP|3||24||');
      expect(dsr).toContain('DSP|4||yr||');
      expect(dsr).toContain('DSP|5||WH_BLOOD||');
      expect(dsr).toContain('DSP|6||PCT^CRP||');
      expect(dsr).toContain('DSP|10||Cardiology||');
    });

    it('should respond with QCK NF when barcode not found', async () => {
      const qryNotFound = [
        'MSH|^~\\&|Q3|Zybio|||20200915103050||QRY^Q02|20220528999999|P|2.3.1||||||ASCII',
        'QRD|20200915103050|R|D|259|||1|NONEXISTENT|OTH|IVD||T',
      ].join('\r');

      const responses = await sendAndReceive(testPort, mllpWrap(qryNotFound));

      expect(responses.length).toBe(1);
      const qck = responses[0];
      expect(qck).toContain('QCK^Q02');
      expect(qck).toContain('MSA|AA|20220528999999');
      expect(qck).toContain('QAK|SR|NF');
    });
  });
});

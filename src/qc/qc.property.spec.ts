// Feature: lis-server-api, Property 8: QC Pass/Fail Evaluation
import * as fc from 'fast-check';
import { QcService } from './qc.service';
import { DatabaseService } from '../database/database.service';

/**
 * **Validates: Requirements FR-15, FR-16**
 *
 * Property: For any QC result item with target value T and measured value M:
 * - If T * 0.85 ≤ M ≤ T * 1.15 → overall status = 'pass'
 * - If M is outside that range → overall status = 'fail'
 * - If no evaluable items exist → status = 'pending'
 */
describe('QC Pass/Fail Evaluation (Property 8)', () => {
  // Positive floats in a reasonable range, excluding values too close to zero
  // where floating point issues arise
  const positiveTarget = fc.double({ min: 0.1, max: 10000, noNaN: true });
  const positiveMeasured = fc.double({ min: 0.001, max: 100000, noNaN: true });

  function createMockDb(items: Array<{ target_value: number | null; measured_value: string | null }>): DatabaseService {
    let capturedStatus: string | null = null;
    return {
      all: () => items.map((item, i) => ({
        id: i + 1,
        qc_result_id: 1,
        set_id: i + 1,
        item_id: `item-${i}`,
        item_name: `Item ${i}`,
        target_value: item.target_value,
        sd: 0.5,
        measured_value: item.measured_value,
        unit: 'ng/mL',
        reference_range: null,
        flags: null,
        channel_no: null,
      })),
      run: (_sql: string, params: unknown[]) => {
        capturedStatus = params[0] as string;
        return { changes: 1, lastInsertRowid: 1 };
      },
      get capturedStatus() { return capturedStatus; },
    } as unknown as DatabaseService & { capturedStatus: string | null };
  }

  it('item within ±15% of target → pass', () => {
    fc.assert(
      fc.property(positiveTarget, (target) => {
        // Generate measured within the passing range [T*0.85, T*1.15]
        const lower = target * 0.85;
        const upper = target * 1.15;
        const mid = (lower + upper) / 2;

        const db = createMockDb([{ target_value: target, measured_value: mid.toString() }]);
        const service = new QcService(db);
        service.evaluateQcResult(1);

        expect((db as any).capturedStatus).toBe('pass');
      }),
      { numRuns: 200 },
    );
  });

  it('item at exact lower boundary T*0.85 → pass', () => {
    fc.assert(
      fc.property(positiveTarget, (target) => {
        const lower = target * 0.85;

        const db = createMockDb([{ target_value: target, measured_value: lower.toString() }]);
        const service = new QcService(db);
        service.evaluateQcResult(1);

        expect((db as any).capturedStatus).toBe('pass');
      }),
      { numRuns: 200 },
    );
  });

  it('item at exact upper boundary T*1.15 → pass', () => {
    fc.assert(
      fc.property(positiveTarget, (target) => {
        const upper = target * 1.15;

        const db = createMockDb([{ target_value: target, measured_value: upper.toString() }]);
        const service = new QcService(db);
        service.evaluateQcResult(1);

        expect((db as any).capturedStatus).toBe('pass');
      }),
      { numRuns: 200 },
    );
  });

  it('item above T*1.15 → fail', () => {
    fc.assert(
      fc.property(
        positiveTarget,
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        (target, excess) => {
          const measured = target * 1.15 + excess;

          const db = createMockDb([{ target_value: target, measured_value: measured.toString() }]);
          const service = new QcService(db);
          service.evaluateQcResult(1);

          expect((db as any).capturedStatus).toBe('fail');
        },
      ),
      { numRuns: 200 },
    );
  });

  it('item below T*0.85 → fail', () => {
    fc.assert(
      fc.property(
        positiveTarget,
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        (target, deficit) => {
          const measured = target * 0.85 - deficit;

          const db = createMockDb([{ target_value: target, measured_value: measured.toString() }]);
          const service = new QcService(db);
          service.evaluateQcResult(1);

          expect((db as any).capturedStatus).toBe('fail');
        },
      ),
      { numRuns: 200 },
    );
  });

  it('any single fail among passing items → overall fail', () => {
    fc.assert(
      fc.property(
        positiveTarget,
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        (target, excess) => {
          const passingMeasured = target; // exactly at target → pass
          const failingMeasured = target * 1.15 + excess; // above range → fail

          const db = createMockDb([
            { target_value: target, measured_value: passingMeasured.toString() },
            { target_value: target, measured_value: failingMeasured.toString() },
          ]);
          const service = new QcService(db);
          service.evaluateQcResult(1);

          expect((db as any).capturedStatus).toBe('fail');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('no evaluable items (null target/measured or non-numeric) → pending', () => {
    const nonNumericValues = [null, '<0.01', '***', 'C Line Weak', 'N/A'];

    fc.assert(
      fc.property(
        fc.constantFrom(...nonNumericValues),
        fc.constantFrom(...nonNumericValues),
        (val1, val2) => {
          const db = createMockDb([
            { target_value: null, measured_value: val1 },
            { target_value: 5.0, measured_value: val2 },
          ]);
          const service = new QcService(db);
          service.evaluateQcResult(1);

          expect((db as any).capturedStatus).toBe('pending');
        },
      ),
      { numRuns: 100 },
    );
  });
});

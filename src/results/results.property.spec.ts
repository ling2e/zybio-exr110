// Feature: lis-server-api, Property 6: Result Filter Correctness
// Feature: lis-server-api, Property 7: Soft-Delete Exclusion
import * as fc from 'fast-check';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { ResultsService } from './results.service';
import { existsSync, rmSync } from 'node:fs';

const TEST_DB = './data/test-results-prop.db';

/**
 * **Validates: Requirements FR-10, FR-13**
 *
 * Property 6: For any date range [dateFrom, dateTo], all results returned
 * have created_at within that range, and no results within the range are missing.
 *
 * Property 7: Voided results are excluded by default, included with includeVoided=true.
 */
describe('Results Filtering Properties (Property 6 & 7)', () => {
  let db: DatabaseService;
  let service: ResultsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DatabaseService,
        ResultsService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: string) => {
              if (key === 'DATABASE_DRIVER') return 'sqlite';
              if (key === 'DATABASE_URL') return TEST_DB;
              return fallback;
            },
          },
        },
      ],
    }).compile();

    db = module.get(DatabaseService);
    db.onModuleInit();
    service = module.get(ResultsService);
  });

  afterAll(() => {
    db.onModuleDestroy();
    if (existsSync(TEST_DB)) rmSync(TEST_DB);
  });

  // Helper: insert a result with a specific created_at timestamp
  function insertResult(createdAt: string): number {
    const res = db.run(
      `INSERT INTO test_results (created_at, status) VALUES (?, 'unreviewed')`,
      [createdAt],
    );
    return res.lastInsertRowid as number;
  }

  // Helper: void a result
  function voidResult(id: number) {
    const now = new Date().toISOString();
    db.run(
      `UPDATE test_results SET voided_at = ?, voided_by = 'test', void_reason = 'test' WHERE id = ?`,
      [now, id],
    );
  }

  // Helper: clear all test results between tests
  function clearResults() {
    db.run('DELETE FROM test_results');
  }

  // Generator: produce a random ISO date string within 2020-2025
  const arbDate = fc.date({
    min: new Date('2020-01-01T00:00:00.000Z'),
    max: new Date('2025-12-31T23:59:59.999Z'),
  }).map((d) => d.toISOString());

  // Generator: produce a sorted date pair [from, to]
  const arbDateRange = fc
    .tuple(arbDate, arbDate)
    .map(([a, b]) => (a <= b ? [a, b] : [b, a]) as [string, string]);

  // Generator: array of dates (the result set)
  const arbDates = fc.array(arbDate, { minLength: 1, maxLength: 20 });

  describe('Property 6: Result Filter Correctness', () => {
    it('date range filter returns exactly results within range', () => {
      fc.assert(
        fc.property(arbDateRange, arbDates, ([dateFrom, dateTo], dates) => {
          clearResults();

          // Seed results with various dates
          const inserted = dates.map((d) => ({ id: insertResult(d), createdAt: d }));

          // Query with date range filter
          const result = service.findAll({
            dateFrom,
            dateTo,
            page: 1,
            limit: 1000,
          });

          const returnedIds = new Set(
            result.data.map((r: any) => r.id as number),
          );

          // All returned results must have created_at within [dateFrom, dateTo]
          for (const row of result.data) {
            const ca = (row as any).created_at as string;
            expect(ca >= dateFrom).toBe(true);
            expect(ca <= dateTo).toBe(true);
          }

          // No result within the range should be missing
          for (const { id, createdAt } of inserted) {
            if (createdAt >= dateFrom && createdAt <= dateTo) {
              expect(returnedIds.has(id)).toBe(true);
            } else {
              expect(returnedIds.has(id)).toBe(false);
            }
          }
        }),
        { numRuns: 50 },
      );
    });
  });

  describe('Property 7: Soft-Delete Exclusion', () => {
    it('voided results excluded by default, included with flag', () => {
      fc.assert(
        fc.property(
          // Generate which indices (out of 5 results) to void
          fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
          (voidFlags) => {
            clearResults();

            // Insert results and void some
            const ids: number[] = [];
            for (let i = 0; i < voidFlags.length; i++) {
              const id = insertResult(new Date(2023, 0, i + 1).toISOString());
              ids.push(id);
              if (voidFlags[i]) {
                voidResult(id);
              }
            }

            const voidedIds = new Set(
              ids.filter((_, i) => voidFlags[i]),
            );
            const activeIds = new Set(
              ids.filter((_, i) => !voidFlags[i]),
            );

            // Default query (excludes voided)
            const defaultResult = service.findAll({
              page: 1,
              limit: 1000,
            });
            const defaultReturnedIds = new Set(
              defaultResult.data.map((r: any) => r.id as number),
            );

            // No voided result in default query
            for (const vid of voidedIds) {
              expect(defaultReturnedIds.has(vid)).toBe(false);
            }
            // All active results present
            for (const aid of activeIds) {
              expect(defaultReturnedIds.has(aid)).toBe(true);
            }

            // Query with includeVoided=true
            const allResult = service.findAll({
              includeVoided: true,
              page: 1,
              limit: 1000,
            });
            const allReturnedIds = new Set(
              allResult.data.map((r: any) => r.id as number),
            );

            // ALL results (voided + active) present
            for (const id of ids) {
              expect(allReturnedIds.has(id)).toBe(true);
            }
          },
        ),
        { numRuns: 50 },
      );
    });
  });
});

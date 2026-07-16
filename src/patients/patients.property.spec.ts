// Feature: lis-server-api, Property 9: Patient Search Substring Match
import * as fc from 'fast-check';
import { PatientsService } from './patients.service';
import { DatabaseService } from '../database/database.service';
import { SqliteAdapter } from '../database/sqlite.adapter';
import { join } from 'node:path';
import { unlinkSync, existsSync } from 'node:fs';

/**
 * **Validates: Requirements FR-22**
 *
 * Property: For any patient with name N stored in the database,
 * searching with any non-empty substring of N should include that
 * patient in the search results.
 */
describe('Patient Search Substring Match (Property 9)', () => {
  const dbPath = join(__dirname, '..', '..', 'data', 'test-patients-property.db');
  let adapter: SqliteAdapter;
  let db: DatabaseService;
  let service: PatientsService;

  beforeAll(() => {
    adapter = new SqliteAdapter(dbPath);
    adapter.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        sex TEXT CHECK(sex IN ('M','F','O')),
        date_of_birth TEXT,
        medical_record_no TEXT UNIQUE,
        department TEXT,
        admission_no TEXT,
        blood_type TEXT,
        pregnant TEXT CHECK(pregnant IN ('Y','N')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create a minimal DatabaseService-compatible object backed by the real adapter
    db = {
      run: (sql: string, params: unknown[] = []) => adapter.run(sql, params),
      get: <T = unknown>(sql: string, params: unknown[] = []) => adapter.get<T>(sql, params),
      all: <T = unknown>(sql: string, params: unknown[] = []) => adapter.all<T>(sql, params),
    } as unknown as DatabaseService;

    service = new PatientsService(db);
  });

  afterAll(() => {
    adapter.close();
    if (existsSync(dbPath)) unlinkSync(dbPath);
  });

  // Clean up between iterations to avoid interference
  beforeEach(() => {
    adapter.exec('DELETE FROM patients');
  });

  // Generate non-empty patient names (alpha + spaces, realistic enough)
  const patientNameArb = fc
    .array(
      fc.oneof(
        fc.integer({ min: 65, max: 90 }).map((c) => String.fromCharCode(c)),
        fc.integer({ min: 97, max: 122 }).map((c) => String.fromCharCode(c)),
        fc.constant(' '),
      ),
      { minLength: 2, maxLength: 30 },
    )
    .map((chars) => chars.join(''))
    .filter((s) => s.trim().length >= 2);

  it('any non-empty substring of patient name returns that patient', () => {
    fc.assert(
      fc.property(
        patientNameArb,
        fc.nat(),
        fc.integer({ min: 1, max: 49 }),
        (name, startSeed, lenSeed) => {
          // Insert patient
          const mrn = `MRN-${Date.now()}-${Math.random()}`;
          adapter.run(
            `INSERT INTO patients (name, medical_record_no, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))`,
            [name, mrn],
          );

          // Generate a non-empty substring of the name
          const start = startSeed % name.length;
          const maxLen = name.length - start;
          const len = Math.min(lenSeed, maxLen) || 1;
          const substring = name.slice(start, start + len);

          // Skip if substring is empty (shouldn't happen but defensive)
          if (substring.length === 0) {
            adapter.exec('DELETE FROM patients');
            return;
          }

          // Search using the substring
          const result = service.findAll({ search: substring, page: 1, limit: 100 });

          // The inserted patient should be in the results
          const found = result.data.some((p) => p.name === name && p.medical_record_no === mrn);
          expect(found).toBe(true);

          // Clean up for next iteration
          adapter.exec('DELETE FROM patients');
        },
      ),
      { numRuns: 50 },
    );
  });
});

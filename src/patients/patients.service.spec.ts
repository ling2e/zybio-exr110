import { NotFoundException } from '@nestjs/common';
import { PatientsService } from './patients.service';

function createMockDb() {
  const store: Record<string, unknown[]> = { patients: [], test_results: [] };
  let nextId = 1;

  return {
    run: jest.fn((sql: string, params: unknown[]) => {
      if (sql.startsWith('INSERT INTO patients')) {
        const id = nextId++;
        store.patients.push({
          id,
          name: params[0],
          sex: params[1],
          date_of_birth: params[2],
          medical_record_no: params[3],
          department: params[4],
          admission_no: params[5],
          blood_type: params[6],
          pregnant: params[7],
          created_at: params[8],
          updated_at: params[9],
        });
        return { lastInsertRowid: id };
      }
      if (sql.startsWith('UPDATE patients')) {
        return { changes: 1 };
      }
      return { changes: 0 };
    }),
    get: jest.fn((sql: string, params: unknown[]) => {
      if (sql.includes('COUNT(*)')) {
        return { count: store.patients.length };
      }
      if (sql.includes('FROM patients WHERE id')) {
        return store.patients.find((p: any) => p.id === params[0]) ?? undefined;
      }
      return undefined;
    }),
    all: jest.fn((sql: string, _params: unknown[]) => {
      if (sql.includes('FROM patients')) return store.patients;
      if (sql.includes('FROM test_results')) return store.test_results;
      return [];
    }),
  };
}

describe('PatientsService', () => {
  let service: PatientsService;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    db = createMockDb();
    service = new PatientsService(db as any);
  });

  it('creates a patient and returns it', () => {
    const result = service.create({ name: 'Zhang San' });
    expect(result.name).toBe('Zhang San');
    expect(result.id).toBe(1);
    expect(db.run).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException for non-existent patient', () => {
    expect(() => service.findById(999)).toThrow(NotFoundException);
  });

  it('findAll returns paginated shape', () => {
    const result = service.findAll({});
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('limit');
  });
});

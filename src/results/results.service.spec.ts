import { NotFoundException } from '@nestjs/common';
import { ResultsService } from './results.service';

// Minimal in-memory mock of DatabaseService
function createMockDb() {
  const tables: Record<string, Record<string, unknown>[]> = {
    test_results: [],
    test_result_items: [],
    patients: [],
  };
  let autoId = 1;

  return {
    run(sql: string, params: unknown[] = []) {
      if (sql.includes('INSERT INTO test_results')) {
        const id = autoId++;
        tables.test_results.push({
          id,
          device_id: params[0],
          patient_id: params[1],
          barcode: params[2],
          sample_no: params[3],
          sample_type: params[4],
          service_id: params[5],
          sampling_time: params[6],
          test_time: params[7],
          result_time: params[8],
          collector: params[9],
          tester: params[10],
          diagnosis: params[11],
          status: 'unreviewed',
          reviewed_by: null,
          reviewed_at: null,
          review_comment: null,
          voided_at: null,
          voided_by: null,
          void_reason: null,
          created_at: new Date().toISOString(),
        });
        return { lastInsertRowid: id, changes: 1 };
      }
      if (sql.includes('INSERT INTO test_result_items')) {
        const id = autoId++;
        tables.test_result_items.push({
          id,
          result_id: params[0],
          set_id: params[1],
          item_name: params[4],
          value: params[5],
          unit: params[6],
          reference_range: params[7],
          flags: params[8],
        });
        return { lastInsertRowid: id, changes: 1 };
      }
      if (sql.includes('UPDATE test_results SET status = \'reviewed\'')) {
        const id = params[3];
        const row = tables.test_results.find((r) => r.id === id);
        if (row) {
          row.status = 'reviewed';
          row.reviewed_by = params[0];
          row.reviewed_at = params[1];
          row.review_comment = params[2];
        }
        return { changes: 1 };
      }
      if (sql.includes('SET status = \'unreviewed\'')) {
        const id = params[0];
        const row = tables.test_results.find((r) => r.id === id);
        if (row) {
          row.status = 'unreviewed';
          row.reviewed_by = null;
          row.reviewed_at = null;
          row.review_comment = null;
        }
        return { changes: 1 };
      }
      if (sql.includes('SET voided_at')) {
        const id = params[3];
        const row = tables.test_results.find((r) => r.id === id);
        if (row) {
          row.voided_at = params[0];
          row.voided_by = params[1];
          row.void_reason = params[2];
        }
        return { changes: 1 };
      }
      return { lastInsertRowid: 0, changes: 0 };
    },
    get<T>(sql: string, params: unknown[] = []): T | undefined {
      if (sql.includes('FROM test_results WHERE id')) {
        return tables.test_results.find((r) => r.id === params[0]) as T | undefined;
      }
      if (sql.includes('COUNT(*)')) {
        return { total: tables.test_results.filter((r) => r.voided_at == null).length } as T;
      }
      return undefined;
    },
    all<T>(sql: string, params: unknown[] = []): T[] {
      if (sql.includes('FROM test_result_items WHERE result_id')) {
        return tables.test_result_items.filter((i) => i.result_id === params[0]) as T[];
      }
      if (sql.includes('FROM test_results tr')) {
        return tables.test_results.filter((r) => r.voided_at == null) as T[];
      }
      return [] as T[];
    },
    _tables: tables,
  };
}

describe('ResultsService', () => {
  let service: ResultsService;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new ResultsService(mockDb as any);
  });

  describe('createResult', () => {
    it('should insert and return id', () => {
      const id = service.createResult({ deviceId: 'dev1', barcode: '123' });
      expect(id).toBe(1);
      expect(mockDb._tables.test_results).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return result with items', () => {
      service.createResult({ deviceId: 'dev1' });
      service.createResultItems(1, [
        { setId: 1, itemName: 'PCT', value: '5.0', unit: 'ng/mL', flags: 'H' },
      ]);
      const result = service.findById(1);
      expect(result.id).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should throw NotFoundException for missing id', () => {
      expect(() => service.findById(999)).toThrow(NotFoundException);
    });
  });

  describe('review', () => {
    it('should set status to reviewed', () => {
      service.createResult({ deviceId: 'dev1' });
      const result = service.review(1, 'Dr. Wang', 'Looks good');
      expect(result.status).toBe('reviewed');
      expect(result.reviewed_by).toBe('Dr. Wang');
      expect(result.review_comment).toBe('Looks good');
    });

    it('should throw NotFoundException for missing id', () => {
      expect(() => service.review(999, 'Dr. Wang')).toThrow(NotFoundException);
    });
  });

  describe('unreview', () => {
    it('should revert status to unreviewed', () => {
      service.createResult({ deviceId: 'dev1' });
      service.review(1, 'Dr. Wang');
      const result = service.unreview(1);
      expect(result.status).toBe('unreviewed');
      expect(result.reviewed_by).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should set voided fields', () => {
      service.createResult({ deviceId: 'dev1' });
      service.softDelete(1, 'admin', 'Duplicate entry');
      const row = mockDb._tables.test_results[0];
      expect(row.voided_at).not.toBeNull();
      expect(row.voided_by).toBe('admin');
      expect(row.void_reason).toBe('Duplicate entry');
    });

    it('should throw NotFoundException for missing id', () => {
      expect(() => service.softDelete(999, 'admin', 'reason')).toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', () => {
      service.createResult({ deviceId: 'dev1' });
      service.createResult({ deviceId: 'dev2' });
      const result = service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should exclude voided results by default', () => {
      service.createResult({ deviceId: 'dev1' });
      service.softDelete(1, 'admin', 'test');
      const result = service.findAll({ page: 1, limit: 10 });
      // mock counts non-voided
      expect(result.total).toBe(0);
    });
  });

  describe('exportCsv', () => {
    it('should return CSV with headers', () => {
      const csv = service.exportCsv({});
      expect(csv).toContain('date,patient,item,value,unit,range,flag,device,reviewer');
    });
  });
});

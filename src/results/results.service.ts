import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface CreateResultData {
  deviceId?: string;
  patientId?: number;
  barcode?: string;
  sampleNo?: string;
  sampleType?: string;
  serviceId?: string;
  samplingTime?: string;
  testTime?: string;
  resultTime?: string;
  collector?: string;
  tester?: string;
  diagnosis?: string;
  messageLogId?: number;
}

export interface CreateResultItemData {
  setId: number;
  valueType?: string;
  itemId?: string;
  itemName?: string;
  value?: string;
  unit?: string;
  referenceRange?: string;
  flags?: string;
  channelNo?: string;
  subId?: string;
}

export interface UpsertPatientData {
  medicalRecordNo: string;
  name?: string;
  sex?: string;
  pregnant?: string;
  department?: string;
  admissionNo?: string;
}

export interface FindAllFilters {
  dateFrom?: string;
  dateTo?: string;
  patient?: string;
  item?: string;
  device?: string;
  status?: 'reviewed' | 'unreviewed';
  flag?: 'normal' | 'abnormal';
  includeVoided?: boolean;
  page: number;
  limit: number;
}

@Injectable()
export class ResultsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Upsert patient by medical_record_no. Returns patient id.
   */
  upsertPatient(data: UpsertPatientData): number {
    const now = new Date().toISOString();
    this.db.run(
      `INSERT INTO patients (medical_record_no, name, sex, pregnant, department, admission_no, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(medical_record_no) DO UPDATE SET
         name = COALESCE(excluded.name, patients.name),
         sex = COALESCE(excluded.sex, patients.sex),
         pregnant = COALESCE(excluded.pregnant, patients.pregnant),
         department = COALESCE(excluded.department, patients.department),
         admission_no = COALESCE(excluded.admission_no, patients.admission_no),
         updated_at = excluded.updated_at`,
      [
        data.medicalRecordNo,
        data.name ?? null,
        data.sex ?? null,
        data.pregnant ?? null,
        data.department ?? null,
        data.admissionNo ?? null,
        now,
        now,
      ],
    );

    const row = this.db.get<{ id: number }>(
      'SELECT id FROM patients WHERE medical_record_no = ?',
      [data.medicalRecordNo],
    );
    return row!.id;
  }

  /**
   * Insert a test result row. Returns the inserted id.
   */
  createResult(data: CreateResultData): number {
    const result = this.db.run(
      `INSERT INTO test_results (device_id, patient_id, barcode, sample_no, sample_type, service_id, sampling_time, test_time, result_time, collector, tester, diagnosis, message_log_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.deviceId ?? null,
        data.patientId ?? null,
        data.barcode ?? null,
        data.sampleNo ?? null,
        data.sampleType ?? null,
        data.serviceId ?? null,
        data.samplingTime ?? null,
        data.testTime ?? null,
        data.resultTime ?? null,
        data.collector ?? null,
        data.tester ?? null,
        data.diagnosis ?? null,
        data.messageLogId ?? null,
      ],
    );
    return result.lastInsertRowid as number;
  }

  /**
   * Bulk insert test result items for a given resultId.
   */
  createResultItems(resultId: number, items: CreateResultItemData[]): void {
    for (const item of items) {
      this.db.run(
        `INSERT INTO test_result_items (result_id, set_id, value_type, item_id, item_name, value, unit, reference_range, flags, channel_no, sub_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resultId,
          item.setId,
          item.valueType ?? null,
          item.itemId ?? null,
          item.itemName ?? null,
          item.value ?? null,
          item.unit ?? null,
          item.referenceRange ?? null,
          item.flags ?? null,
          item.channelNo ?? null,
          item.subId ?? null,
        ],
      );
    }
  }

  /**
   * Paginated list with filters. Default excludes voided results.
   */
  findAll(filters: FindAllFilters) {
    const conditions: string[] = [];
    const params: unknown[] = [];

    // Default: exclude voided
    if (!filters.includeVoided) {
      conditions.push('tr.voided_at IS NULL');
    }

    if (filters.dateFrom) {
      conditions.push('tr.created_at >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('tr.created_at <= ?');
      params.push(filters.dateTo);
    }
    if (filters.device) {
      conditions.push('tr.device_id = ?');
      params.push(filters.device);
    }
    if (filters.status) {
      conditions.push('tr.status = ?');
      params.push(filters.status);
    }

    // Patient filter: partial match on patients.name OR patients.medical_record_no
    let joinPatient = '';
    if (filters.patient) {
      joinPatient = 'LEFT JOIN patients p ON tr.patient_id = p.id';
      conditions.push('(p.name LIKE ? OR p.medical_record_no LIKE ?)');
      const pattern = `%${filters.patient}%`;
      params.push(pattern, pattern);
    }

    // Item filter: EXISTS subquery on test_result_items
    if (filters.item) {
      conditions.push(
        `EXISTS (SELECT 1 FROM test_result_items tri WHERE tri.result_id = tr.id AND tri.item_name LIKE ?)`,
      );
      params.push(`%${filters.item}%`);
    }

    // Flag filter: normal = no items with H/L/A flags; abnormal = at least one item has H/L/A
    if (filters.flag === 'abnormal') {
      conditions.push(
        `EXISTS (SELECT 1 FROM test_result_items tri WHERE tri.result_id = tr.id AND (tri.flags LIKE '%H%' OR tri.flags LIKE '%L%' OR tri.flags LIKE '%A%'))`,
      );
    } else if (filters.flag === 'normal') {
      conditions.push(
        `NOT EXISTS (SELECT 1 FROM test_result_items tri WHERE tri.result_id = tr.id AND (tri.flags LIKE '%H%' OR tri.flags LIKE '%L%' OR tri.flags LIKE '%A%'))`,
      );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (filters.page - 1) * filters.limit;

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM test_results tr ${joinPatient} ${whereClause}`;
    const countRow = this.db.get<{ total: number }>(countSql, params);
    const total = countRow?.total ?? 0;

    // Data query
    const dataSql = `SELECT tr.* FROM test_results tr ${joinPatient} ${whereClause} ORDER BY tr.created_at DESC LIMIT ? OFFSET ?`;
    const data = this.db.all<Record<string, unknown>>(dataSql, [...params, filters.limit, offset]);

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  /**
   * Get a single result with its items (join test_result_items).
   */
  findById(id: number) {
    const result = this.db.get<Record<string, unknown>>(
      'SELECT * FROM test_results WHERE id = ?',
      [id],
    );
    if (!result) {
      throw new NotFoundException(`Result #${id} not found`);
    }

    const items = this.db.all<Record<string, unknown>>(
      'SELECT * FROM test_result_items WHERE result_id = ?',
      [id],
    );

    return { ...result, items };
  }

  /**
   * Mark result as reviewed.
   */
  review(id: number, reviewedBy: string, comment?: string) {
    const existing = this.db.get<{ id: number }>(
      'SELECT id FROM test_results WHERE id = ?',
      [id],
    );
    if (!existing) {
      throw new NotFoundException(`Result #${id} not found`);
    }

    const now = new Date().toISOString();
    this.db.run(
      `UPDATE test_results SET status = 'reviewed', reviewed_by = ?, reviewed_at = ?, review_comment = ? WHERE id = ?`,
      [reviewedBy, now, comment ?? null, id],
    );
    return this.findById(id);
  }

  /**
   * Revert review status.
   */
  unreview(id: number) {
    const existing = this.db.get<{ id: number }>(
      'SELECT id FROM test_results WHERE id = ?',
      [id],
    );
    if (!existing) {
      throw new NotFoundException(`Result #${id} not found`);
    }

    this.db.run(
      `UPDATE test_results SET status = 'unreviewed', reviewed_by = NULL, reviewed_at = NULL, review_comment = NULL WHERE id = ?`,
      [id],
    );
    return this.findById(id);
  }

  /**
   * Soft-delete: set voided_at/voided_by/void_reason.
   */
  softDelete(id: number, voidedBy: string, reason: string) {
    const existing = this.db.get<{ id: number }>(
      'SELECT id FROM test_results WHERE id = ?',
      [id],
    );
    if (!existing) {
      throw new NotFoundException(`Result #${id} not found`);
    }

    const now = new Date().toISOString();
    this.db.run(
      `UPDATE test_results SET voided_at = ?, voided_by = ?, void_reason = ? WHERE id = ?`,
      [now, voidedBy, reason, id],
    );
  }

  /**
   * Export results as CSV text.
   */
  exportCsv(filters: Omit<FindAllFilters, 'page' | 'limit'>) {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (!filters.includeVoided) {
      conditions.push('tr.voided_at IS NULL');
    }
    if (filters.dateFrom) {
      conditions.push('tr.created_at >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('tr.created_at <= ?');
      params.push(filters.dateTo);
    }
    if (filters.device) {
      conditions.push('tr.device_id = ?');
      params.push(filters.device);
    }
    if (filters.status) {
      conditions.push('tr.status = ?');
      params.push(filters.status);
    }

    let joinPatient = '';
    if (filters.patient) {
      joinPatient = 'LEFT JOIN patients p2 ON tr.patient_id = p2.id';
      conditions.push('(p2.name LIKE ? OR p2.medical_record_no LIKE ?)');
      const pattern = `%${filters.patient}%`;
      params.push(pattern, pattern);
    }

    if (filters.item) {
      conditions.push(
        `EXISTS (SELECT 1 FROM test_result_items tri2 WHERE tri2.result_id = tr.id AND tri2.item_name LIKE ?)`,
      );
      params.push(`%${filters.item}%`);
    }

    if (filters.flag === 'abnormal') {
      conditions.push(
        `EXISTS (SELECT 1 FROM test_result_items tri2 WHERE tri2.result_id = tr.id AND (tri2.flags LIKE '%H%' OR tri2.flags LIKE '%L%' OR tri2.flags LIKE '%A%'))`,
      );
    } else if (filters.flag === 'normal') {
      conditions.push(
        `NOT EXISTS (SELECT 1 FROM test_result_items tri2 WHERE tri2.result_id = tr.id AND (tri2.flags LIKE '%H%' OR tri2.flags LIKE '%L%' OR tri2.flags LIKE '%A%'))`,
      );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Join items + patient for CSV output
    const sql = `
      SELECT
        tr.result_time as date,
        p.name as patient,
        tri.item_name as item,
        tri.value,
        tri.unit,
        tri.reference_range as range,
        tri.flags as flag,
        tr.device_id as device,
        tr.reviewed_by as reviewer
      FROM test_results tr
      LEFT JOIN patients p ON tr.patient_id = p.id
      JOIN test_result_items tri ON tri.result_id = tr.id
      ${joinPatient}
      ${whereClause}
      ORDER BY tr.created_at DESC
    `;

    const rows = this.db.all<Record<string, unknown>>(sql, params);

    const headers = ['date', 'patient', 'item', 'value', 'unit', 'range', 'flag', 'device', 'reviewer'];
    const csvLines = [headers.join(',')];

    for (const row of rows) {
      const line = headers.map((h) => {
        const val = row[h];
        if (val == null) return '';
        const str = String(val);
        // Escape CSV fields containing commas or quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvLines.push(line.join(','));
    }

    return csvLines.join('\n');
  }
}

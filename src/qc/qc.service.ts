import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateQcResultDto, CreateQcResultItemDto } from './dto/create-qc.dto';
import { QueryQcDto } from './dto/query-qc.dto';
import {
  QcResult,
  QcResultItem,
  QcResultWithItems,
} from './entities/qc.entity';

@Injectable()
export class QcService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Insert a new QC result row. Returns the inserted id.
   */
  createQcResult(data: CreateQcResultDto): number {
    const result = this.db.run(
      `INSERT INTO qc_results (device_id, solution_name, lot_no, level, service_id, test_time, expiry_date, message_log_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.deviceId ?? null,
        data.solutionName ?? null,
        data.lotNo ?? null,
        data.level ?? null,
        data.serviceId ?? null,
        data.testTime ?? null,
        data.expiryDate ?? null,
        data.messageLogId ?? null,
      ],
    );
    return result.lastInsertRowid as number;
  }

  /**
   * Bulk insert QC result items for a given qcResultId.
   */
  createQcResultItems(
    qcResultId: number,
    items: CreateQcResultItemDto[],
  ): void {
    for (const item of items) {
      this.db.run(
        `INSERT INTO qc_result_items (qc_result_id, set_id, item_id, item_name, target_value, sd, measured_value, unit, reference_range, flags, channel_no)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          qcResultId,
          item.setId,
          item.itemId ?? null,
          item.itemName ?? null,
          item.targetValue ?? null,
          item.sd ?? null,
          item.measuredValue ?? null,
          item.unit ?? null,
          item.referenceRange ?? null,
          item.flags ?? null,
          item.channelNo ?? null,
        ],
      );
    }
  }

  /**
   * Evaluate all items for a QC result and update overall status.
   *
   * For each item:
   * - If measured_value is numeric and target_value exists:
   *   T * 0.85 ≤ M ≤ T * 1.15 → pass, otherwise → fail
   * - If measured_value is not numeric (e.g. "<0.01", "***", "C Line Weak") → pending (can't evaluate)
   *
   * Overall: 'pass' if ALL evaluable items pass, 'fail' if ANY fails.
   * If no items can be evaluated numerically, stays 'pending'.
   */
  evaluateQcResult(qcResultId: number): void {
    const items = this.db.all<QcResultItem>(
      'SELECT * FROM qc_result_items WHERE qc_result_id = ?',
      [qcResultId],
    );

    let hasFail = false;
    let hasPass = false;

    for (const item of items) {
      if (item.target_value == null || item.measured_value == null) {
        continue;
      }

      const measured = parseFloat(item.measured_value);
      if (isNaN(measured)) {
        // Non-numeric value like "<0.01", "***", "C Line Weak" — can't evaluate
        continue;
      }

      const lower = item.target_value * 0.85;
      const upper = item.target_value * 1.15;

      if (measured >= lower && measured <= upper) {
        hasPass = true;
      } else {
        hasFail = true;
      }
    }

    let status: string;
    if (hasFail) {
      status = 'fail';
    } else if (hasPass) {
      status = 'pass';
    } else {
      status = 'pending';
    }

    this.db.run('UPDATE qc_results SET status = ? WHERE id = ?', [
      status,
      qcResultId,
    ]);
  }

  /**
   * Paginated list with filters: dateFrom, dateTo, item, level, lotNo, status.
   * The `item` filter matches on qc_result_items.item_name (checks if any item in the result matches).
   */
  findAll(filters: QueryQcDto): {
    data: QcResult[];
    total: number;
    page: number;
    limit: number;
  } {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.dateFrom) {
      conditions.push('qr.created_at >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('qr.created_at <= ?');
      params.push(filters.dateTo);
    }
    if (filters.level) {
      conditions.push('qr.level = ?');
      params.push(filters.level);
    }
    if (filters.lotNo) {
      conditions.push('qr.lot_no = ?');
      params.push(filters.lotNo);
    }
    if (filters.status) {
      conditions.push('qr.status = ?');
      params.push(filters.status);
    }
    if (filters.item) {
      conditions.push(
        'EXISTS (SELECT 1 FROM qc_result_items qi WHERE qi.qc_result_id = qr.id AND qi.item_name LIKE ?)',
      );
      params.push(`%${filters.item}%`);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total =
      this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM qc_results qr ${where}`,
        params,
      )?.count ?? 0;

    const data = this.db.all<QcResult>(
      `SELECT qr.* FROM qc_results qr ${where} ORDER BY qr.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return { data, total, page, limit };
  }

  /**
   * Single QC result with all items.
   */
  findById(id: number): QcResultWithItems | undefined {
    const result = this.db.get<QcResult>(
      'SELECT * FROM qc_results WHERE id = ?',
      [id],
    );
    if (!result) return undefined;

    const items = this.db.all<QcResultItem>(
      'SELECT * FROM qc_result_items WHERE qc_result_id = ? ORDER BY set_id',
      [id],
    );

    return { ...result, items };
  }
}

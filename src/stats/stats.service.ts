import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class StatsService {
  constructor(private db: DatabaseService) {}

  getDailyStats(date: string) {
    // Total tests on this date
    const totalRow = this.db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM test_results WHERE created_at LIKE ?`,
      [`${date}%`],
    );
    const totalTests = totalRow?.count ?? 0;

    // Tests by item
    const testsByItem = this.db.all<{ item: string; count: number }>(
      `SELECT tri.item_name as item, COUNT(*) as count
       FROM test_result_items tri
       JOIN test_results tr ON tr.id = tri.result_id
       WHERE tr.created_at LIKE ?
       GROUP BY tri.item_name`,
      [`${date}%`],
    );

    // Tests by device
    const testsByDevice = this.db.all<{ device: string; count: number }>(
      `SELECT device_id as device, COUNT(*) as count
       FROM test_results
       WHERE created_at LIKE ?
       GROUP BY device_id`,
      [`${date}%`],
    );

    // Abnormal count: results with at least one item flagged H, L, or A
    const abnormalRow = this.db.get<{ count: number }>(
      `SELECT COUNT(DISTINCT tr.id) as count
       FROM test_results tr
       JOIN test_result_items tri ON tri.result_id = tr.id
       WHERE tr.created_at LIKE ?
         AND (tri.flags LIKE '%H%' OR tri.flags LIKE '%L%' OR tri.flags LIKE '%A%')`,
      [`${date}%`],
    );
    const abnormalCount = abnormalRow?.count ?? 0;

    // QC pass/fail counts
    const qcPassRow = this.db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM qc_results
       WHERE created_at LIKE ? AND status = 'pass'`,
      [`${date}%`],
    );
    const qcFailRow = this.db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM qc_results
       WHERE created_at LIKE ? AND status = 'fail'`,
      [`${date}%`],
    );

    return {
      totalTests,
      testsByItem,
      testsByDevice,
      abnormalCount,
      qcPassCount: qcPassRow?.count ?? 0,
      qcFailCount: qcFailRow?.count ?? 0,
    };
  }

  getThroughput(dateFrom: string, dateTo: string, groupBy: string) {
    // ponytail: week grouping simplified to day — true ISO week grouping
    // adds complexity for negligible MVP value. Upgrade: use strftime('%W') for SQLite
    // or DATE_TRUNC('week', ...) for PostgreSQL.
    let groupExpr: string;
    if (groupBy === 'month') {
      groupExpr = 'SUBSTR(created_at, 1, 7)';
    } else {
      // 'day' or 'week' (week falls back to day for now)
      groupExpr = 'SUBSTR(created_at, 1, 10)';
    }

    const data = this.db.all<{ period: string; count: number }>(
      `SELECT ${groupExpr} as period, COUNT(*) as count
       FROM test_results
       WHERE created_at >= ? AND created_at < ?
       GROUP BY period
       ORDER BY period`,
      [dateFrom, `${dateTo}T99`],
    );

    return { data };
  }

  getDeviceStats(dateFrom: string, dateTo: string) {
    // Per-device test counts in range
    const devices = this.db.all<{
      deviceId: string;
      model: string;
      totalTests: number;
    }>(
      `SELECT d.id as deviceId, d.model, COUNT(tr.id) as totalTests
       FROM devices d
       LEFT JOIN test_results tr
         ON tr.device_id = d.id
         AND tr.created_at >= ? AND tr.created_at < ?
       GROUP BY d.id`,
      [dateFrom, `${dateTo}T99`],
    );

    // Enrich with last QC info and disconnect count per device
    const data = devices.map((dev) => {
      const lastQc = this.db.get<{ created_at: string; status: string }>(
        `SELECT created_at, status FROM qc_results
         WHERE device_id = ?
         ORDER BY created_at DESC LIMIT 1`,
        [dev.deviceId],
      );

      const disconnectRow = this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM device_events
         WHERE device_id = ? AND event_type = 'disconnected'
           AND created_at >= ? AND created_at < ?`,
        [dev.deviceId, dateFrom, `${dateTo}T99`],
      );

      return {
        deviceId: dev.deviceId,
        model: dev.model,
        totalTests: dev.totalTests,
        lastQcDate: lastQc?.created_at?.substring(0, 10) ?? null,
        lastQcStatus: lastQc?.status ?? null,
        disconnectCount: disconnectRow?.count ?? 0,
      };
    });

    return { data };
  }
}

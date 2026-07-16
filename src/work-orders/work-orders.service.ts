import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { QueryWorkOrderDto } from './dto/query-work-order.dto';
import { WorkOrder } from './entities/work-order.entity';
import { OrmSenderService } from '../hl7/orm-sender.service';

@Injectable()
export class WorkOrdersService {
  private readonly logger = new Logger(WorkOrdersService.name);

  constructor(
    private readonly db: DatabaseService,
    @Inject(forwardRef(() => OrmSenderService))
    private readonly ormSender: OrmSenderService,
  ) {}

  create(dto: CreateWorkOrderDto): WorkOrder {
    const items = dto.items.join(',');
    const now = new Date().toISOString();

    const result = this.db.run(
      `INSERT INTO work_orders
        (barcode, patient_name, sex, age, age_unit, sample_type, items,
         department, patient_no, admission_no, submitter, reviewer, diagnosis,
         sampling_time, submission_time, target_device_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.barcode,
        dto.patientName ?? null,
        dto.sex ?? null,
        dto.age ?? null,
        dto.ageUnit ?? 'yr',
        dto.sampleType,
        items,
        dto.department ?? null,
        dto.patientNo ?? null,
        dto.admissionNo ?? null,
        dto.submitter ?? null,
        dto.reviewer ?? null,
        dto.diagnosis ?? null,
        dto.samplingTime ?? null,
        dto.submissionTime ?? null,
        dto.targetDeviceId ?? null,
        now,
        now,
      ],
    );

    const id = (result as { lastInsertRowid: number }).lastInsertRowid;
    this.logger.log(`Work order created: id=${id}, barcode=${dto.barcode}`);
    const wo = this.findById(id)!;

    if (dto.pushToDevice && dto.targetDeviceId) {
      this.ormSender.pushWorkOrder(wo, dto.targetDeviceId);
    }

    return this.findById(id)!;
  }

  findAll(filters: QueryWorkOrderDto): {
    data: WorkOrder[];
    total: number;
    page: number;
    limit: number;
  } {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }
    if (filters.barcode) {
      conditions.push('barcode = ?');
      params.push(filters.barcode);
    }
    if (filters.dateFrom) {
      conditions.push('created_at >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('created_at <= ?');
      params.push(filters.dateTo);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total =
      this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM work_orders ${where}`,
        params,
      )?.count ?? 0;

    const data = this.db.all<WorkOrder>(
      `SELECT * FROM work_orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return { data, total, page, limit };
  }

  findById(id: number): WorkOrder | undefined {
    return this.db.get<WorkOrder>('SELECT * FROM work_orders WHERE id = ?', [
      id,
    ]);
  }

  findByBarcode(barcode: string): WorkOrder | undefined {
    return this.db.get<WorkOrder>(
      `SELECT * FROM work_orders WHERE barcode = ? AND status = 'pending' ORDER BY created_at DESC`,
      [barcode],
    );
  }

  /**
   * Mark a pending work order as completed (called when device uploads result for this barcode).
   * Returns true if a work order was completed, false if none found.
   */
  completeByBarcode(barcode: string, resultId: number): boolean {
    const wo = this.findByBarcode(barcode);
    if (!wo) return false;

    const now = new Date().toISOString();
    this.db.run(
      `UPDATE work_orders SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ?`,
      [now, now, wo.id],
    );

    // Link the test result to this work order
    this.db.run(
      `UPDATE test_results SET work_order_id = ? WHERE id = ?`,
      [wo.id, resultId],
    );

    this.logger.log(`Work order completed: id=${wo.id}, barcode=${barcode}, resultId=${resultId}`);
    return true;
  }

  cancel(id: number): WorkOrder {
    const existing = this.findById(id);
    if (!existing) {
      throw new Error('Work order not found');
    }
    if (existing.status === 'completed') {
      throw new Error('Cannot cancel completed order');
    }

    const now = new Date().toISOString();
    this.db.run(
      `UPDATE work_orders SET status = 'cancelled', updated_at = ? WHERE id = ?`,
      [now, id],
    );

    this.logger.log(`Work order cancelled: id=${id}`);
    return this.findById(id)!;
  }

  batchCreate(items: CreateWorkOrderDto[]): WorkOrder[] {
    return items.map((dto) => this.create(dto));
  }
}

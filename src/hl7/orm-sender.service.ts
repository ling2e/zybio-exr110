import { Injectable, Logger } from '@nestjs/common';
import { Hl7BuilderService } from './hl7-builder.service';
import { MllpService } from './mllp.service';
import { DatabaseService } from '../database/database.service';
import { WorkOrder } from '../work-orders/entities/work-order.entity';
import { OrmWorkOrder } from './hl7.types';

@Injectable()
export class OrmSenderService {
  private readonly logger = new Logger(OrmSenderService.name);

  constructor(
    private readonly hl7Builder: Hl7BuilderService,
    private readonly mllp: MllpService,
    private readonly db: DatabaseService,
  ) {}

  /**
   * Build an ORM^O01 message from a work order and push it to the target device.
   * Updates push_status in the database accordingly.
   */
  pushWorkOrder(workOrder: WorkOrder, targetDeviceId: string): boolean {
    const ormWorkOrder: OrmWorkOrder = {
      barcode: workOrder.barcode,
      sampleNo: workOrder.barcode,
      patientName: workOrder.patient_name ?? '',
      patientNo: workOrder.patient_no ?? '',
      sex: workOrder.sex ?? '',
      pregnant: undefined,
      sampleType: workOrder.sample_type,
      items: workOrder.items.split(','),
      samplingTime: workOrder.sampling_time,
    };

    const ormMessage = this.hl7Builder.buildOrm(ormWorkOrder);
    const sent = this.mllp.sendToDevice(targetDeviceId, ormMessage);

    const now = new Date().toISOString();
    if (sent) {
      // ponytail: mark as 'sent' on successful TCP write. ACK timeout/retry is the upgrade path.
      this.db.run(
        `UPDATE work_orders SET push_status = 'sent', pushed_at = ?, updated_at = ? WHERE id = ?`,
        [now, now, workOrder.id],
      );
      this.logger.log(
        `ORM^O01 pushed to ${targetDeviceId} for barcode=${workOrder.barcode}`,
      );
    } else {
      this.db.run(
        `UPDATE work_orders SET push_status = 'failed', updated_at = ? WHERE id = ?`,
        [now, workOrder.id],
      );
      this.logger.warn(
        `ORM^O01 push failed for barcode=${workOrder.barcode}: device ${targetDeviceId} not connected`,
      );
    }

    return sent;
  }
}

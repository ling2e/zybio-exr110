import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Hl7MessageHandler, Hl7RouterService } from './hl7-router.service';
import { Hl7BuilderService } from './hl7-builder.service';
import { Hl7Message, DsrWorkOrder } from './hl7.types';
import { WorkOrdersService } from '../work-orders/work-orders.service';

/**
 * Handles QRY^Q02 — instrument queries for a work order by barcode.
 * Responds with QCK^Q02 (immediate ack) + DSR^Q03 (data) if found,
 * or QCK^Q02 with NF status if not found.
 */
@Injectable()
export class QryHandlerService implements Hl7MessageHandler, OnModuleInit {
  private readonly logger = new Logger(QryHandlerService.name);

  constructor(
    private readonly router: Hl7RouterService,
    private readonly builder: Hl7BuilderService,
    private readonly workOrdersService: WorkOrdersService,
  ) {}

  onModuleInit() {
    this.router.registerHandler('QRY^Q02', this);
  }

  async handle(message: Hl7Message): Promise<string | string[]> {
    const controlId = message.msh.controlId;

    // Parse QRD segment
    const qrd = message.segments.find((s) => s.name === 'QRD');
    if (!qrd) {
      this.logger.warn(`QRY^Q02 without QRD segment (ctrl=${controlId})`);
      return this.builder.buildQck(controlId, false);
    }

    const queryDateTime = qrd.fields[0] ?? '';  // QRD-1
    const queryId = qrd.fields[3] ?? '';        // QRD-4
    const barcode = qrd.fields[7] ?? '';        // QRD-8

    if (!barcode) {
      this.logger.warn(`QRY^Q02 with empty barcode (ctrl=${controlId})`);
      return this.builder.buildQck(controlId, false);
    }

    this.logger.debug(`Work order query: barcode=${barcode}, ctrl=${controlId}`);

    // Lookup work order
    const wo = this.workOrdersService.findByBarcode(barcode);

    if (!wo) {
      this.logger.debug(`Work order not found for barcode=${barcode}`);
      return this.builder.buildQck(controlId, false);
    }

    // Map WorkOrder to DsrWorkOrder
    const items = wo.items.includes('[')
      ? JSON.parse(wo.items) as string[]
      : wo.items.split(',');

    const dsrData: DsrWorkOrder = {
      patientName: wo.patient_name ?? undefined,
      sex: wo.sex ?? undefined,
      age: wo.age ?? undefined,
      ageUnit: wo.age_unit ?? undefined,
      sampleType: wo.sample_type,
      items,
      sampleNo: wo.barcode,
      department: wo.department ?? undefined,
      patientNo: wo.patient_no ?? undefined,
      admissionNo: wo.admission_no ?? undefined,
      submitter: wo.submitter ?? undefined,
      reviewer: wo.reviewer ?? undefined,
      samplingTime: wo.sampling_time ?? undefined,
      submissionTime: wo.submission_time ?? undefined,
      diagnosis: wo.diagnosis ?? undefined,
    };

    // Return both QCK (ok) and DSR (data)
    const qck = this.builder.buildQck(controlId, true);
    const dsr = this.builder.buildDsr(
      controlId,
      queryDateTime,
      queryId,
      barcode,
      dsrData,
    );

    this.logger.log(`Work order found for barcode=${barcode}, sending DSR`);
    return [qck, dsr];
  }
}

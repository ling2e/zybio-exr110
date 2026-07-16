import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Hl7MessageHandler, Hl7RouterService } from './hl7-router.service';
import { Hl7BuilderService } from './hl7-builder.service';
import { Hl7Message, Hl7Segment } from './hl7.types';
import { ResultsService } from '../results/results.service';
import { QcService } from '../qc/qc.service';
import { MessagesService } from '../messages/messages.service';
import { DevicesService } from '../devices/devices.service';
import { WorkOrdersService } from '../work-orders/work-orders.service';

/**
 * Metadata OBX item IDs that are NOT test result items.
 * These carry instrument/workflow info and should be skipped during result item insertion.
 */
const METADATA_ITEM_IDS = new Set([
  '03001', // Take Mode
  '03003', // Test Mode
  '03004', // Sys Seq
  '03005', // Worklist Seq
  '03006', // Qc Level
  '03008', // Qc lot No
  '03009', // Transmission No
  '03010', // Qc valid date
  '03011', // Tube position
  '31525-0', // Age
  '09001', // Remark
]);

@Injectable()
export class OruHandlerService implements Hl7MessageHandler, OnModuleInit {
  private readonly logger = new Logger(OruHandlerService.name);

  constructor(
    private readonly router: Hl7RouterService,
    private readonly builder: Hl7BuilderService,
    private readonly resultsService: ResultsService,
    private readonly qcService: QcService,
    private readonly messagesService: MessagesService,
    @Inject(forwardRef(() => DevicesService))
    private readonly devicesService: DevicesService,
    @Inject(forwardRef(() => WorkOrdersService))
    private readonly workOrdersService: WorkOrdersService,
  ) {}

  onModuleInit() {
    this.router.registerHandler('ORU^R01', this);
  }

  handle(message: Hl7Message, deviceId: string): Promise<string> {
    const controlId = message.msh.controlId;
    const processingId = message.msh.processingId;

    // Log raw message — already recorded by router, get the ID for linking
    const messageLogId = this.messagesService.logMessage({
      deviceId,
      direction: 'in',
      rawHex: Buffer.from(message.raw, 'utf-8'),
      decodedText: message.raw,
      messageType: message.msh.messageType,
      controlId,
    });

    // Update device last message timestamp
    this.devicesService.updateLastMessage(deviceId);

    // Update device info from SFT segment if present
    const sft = this.findSegment(message, 'SFT');
    if (sft) {
      const model = sft.fields[2] ?? ''; // SFT-3: product/model
      const version = sft.fields[1] ?? ''; // SFT-2: version
      if (model || version) {
        this.devicesService.updateDeviceInfo(deviceId, model, version);
      }
    }

    if (processingId === 'Q') {
      this.handleQcResult(message, deviceId, messageLogId);
    } else {
      // Default to sample (P) processing
      this.handleSampleResult(message, deviceId, messageLogId);
    }

    return Promise.resolve(this.builder.buildAck(controlId, 'AA'));
  }

  private handleSampleResult(message: Hl7Message, deviceId: string, messageLogId: number): void {
    // Parse PID
    const pid = this.findSegment(message, 'PID');
    const pv1 = this.findSegment(message, 'PV1');
    const obr = this.findSegment(message, 'OBR');
    const obxSegments = this.findAllSegments(message, 'OBX');

    // Extract patient data from PID
    let medicalRecordNo = '';
    let patientName = '';
    let sex = '';
    let pregnant = '';

    if (pid) {
      // PID fields[2] = medical record no (component ^MR)
      const mrnRaw = pid.fields[2] ?? '';
      medicalRecordNo = mrnRaw.split('^')[0];

      // PID fields[4] = name (component separated)
      const nameRaw = pid.fields[4] ?? '';
      patientName = nameRaw.split('^')[0];

      // PID fields[7] = sex
      sex = pid.fields[7] ?? '';

      // PID fields[8] = pregnant
      pregnant = pid.fields[8] ?? '';
    }

    // Extract department / admission from PV1
    let department = '';
    let admissionNo = '';

    if (pv1) {
      // PV1 fields[2] = department^room^bed
      const deptRaw = pv1.fields[2] ?? '';
      department = deptRaw.split('^')[0];

      // PV1 fields[3] = admission no
      admissionNo = pv1.fields[3] ?? '';
    }

    // Upsert patient if we have a medical record number
    let patientId: number | undefined;
    if (medicalRecordNo) {
      patientId = this.resultsService.upsertPatient({
        medicalRecordNo,
        name: patientName || undefined,
        sex: sex || undefined,
        pregnant: pregnant || undefined,
        department: department || undefined,
        admissionNo: admissionNo || undefined,
      });
    }

    // Extract OBR data
    let barcode = '';
    let sampleNo = '';
    let serviceId = '';
    let samplingTime = '';
    let testTime = '';
    let resultTime = '';
    let collector = '';
    let diagnosis = '';
    let sampleType = '';
    let tester = '';

    if (obr) {
      barcode = obr.fields[1] ?? ''; // OBR-2
      sampleNo = obr.fields[2] ?? ''; // OBR-3
      // OBR-4: service ID (component separated, take first part)
      const svcRaw = obr.fields[3] ?? '';
      serviceId = svcRaw.split('^')[0];

      samplingTime = obr.fields[5] ?? ''; // OBR-6
      testTime = obr.fields[6] ?? ''; // OBR-7
      resultTime = obr.fields[7] ?? ''; // OBR-8
      collector = obr.fields[9] ?? ''; // OBR-10
      diagnosis = obr.fields[12] ?? ''; // OBR-13
      sampleType = obr.fields[14] ?? ''; // OBR-15
      tester = obr.fields[15] ?? ''; // OBR-16
    }

    // Insert test result
    const resultId = this.resultsService.createResult({
      deviceId,
      patientId,
      barcode,
      sampleNo,
      sampleType,
      serviceId,
      samplingTime,
      testTime,
      resultTime,
      collector,
      tester,
      diagnosis,
      messageLogId,
    });

    // Insert test result items (skip metadata OBX)
    const items = obxSegments
      .filter((obx) => !this.isMetadataObx(obx))
      .map((obx) => {
        const itemIdRaw = obx.fields[2] ?? '';
        const components = itemIdRaw.split('^');
        return {
          setId: parseInt(obx.fields[0] ?? '0', 10),
          valueType: obx.fields[1] ?? undefined,
          itemId: components[0] ?? undefined,
          itemName: components[1] ?? undefined,
          value: obx.fields[4] ?? undefined,
          unit: obx.fields[5] ?? undefined,
          referenceRange: obx.fields[6] ?? undefined,
          flags: obx.fields[7] ?? undefined,
          channelNo: obx.fields[8] ?? undefined,
          subId: obx.fields[3] ?? undefined,
        };
      });

    if (items.length > 0) {
      this.resultsService.createResultItems(resultId, items);
    }

    // Complete matching work order if one exists for this barcode
    if (barcode || sampleNo) {
      this.workOrdersService.completeByBarcode(barcode || sampleNo, resultId);
    }

    this.logger.log(
      `Sample result saved: id=${resultId}, barcode=${barcode}, items=${items.length}`,
    );
  }

  private handleQcResult(message: Hl7Message, deviceId: string, messageLogId: number): void {
    const obr = this.findSegment(message, 'OBR');
    const obxSegments = this.findAllSegments(message, 'OBX');

    // OBR fields for QC
    let solutionName = '';
    let lotNo = '';
    let serviceId = '';
    let testTime = '';
    let expiryDate = '';

    if (obr) {
      solutionName = obr.fields[1] ?? ''; // OBR-2: QC solution name
      lotNo = obr.fields[2] ?? ''; // OBR-3: lot number
      const svcRaw = obr.fields[3] ?? ''; // OBR-4: service ID
      serviceId = svcRaw.split('^')[0];
      expiryDate = obr.fields[5] ?? ''; // OBR-6: expiry date
      testTime = obr.fields[6] ?? ''; // OBR-7: test time
    }

    // Extract QC level from metadata OBX (03006^Qc Level)
    let qcLevel: 'L' | 'M' | 'H' | undefined;
    for (const obx of obxSegments) {
      const itemIdRaw = obx.fields[2] ?? '';
      const itemId = itemIdRaw.split('^')[0];
      if (itemId === '03006') {
        const val = (obx.fields[4] ?? '').toUpperCase();
        if (val === 'L' || val === 'M' || val === 'H') {
          qcLevel = val;
        }
        break;
      }
    }

    // Insert QC result
    const qcResultId = this.qcService.createQcResult({
      deviceId,
      solutionName,
      lotNo,
      level: qcLevel,
      serviceId,
      testTime,
      expiryDate,
      messageLogId,
    });

    // Insert QC result items (skip metadata OBX)
    const items = obxSegments
      .filter((obx) => !this.isMetadataObx(obx))
      .map((obx) => {
        const itemIdRaw = obx.fields[2] ?? '';
        const components = itemIdRaw.split('^');

        // OBX-4 (sub-ID): target^SD for QC
        const subIdRaw = obx.fields[3] ?? '';
        const subParts = subIdRaw.split('^');
        const targetValue = subParts[0] ? parseFloat(subParts[0]) : undefined;
        const sd = subParts[1] ? parseFloat(subParts[1]) : undefined;

        return {
          setId: parseInt(obx.fields[0] ?? '0', 10),
          itemId: components[0] ?? undefined,
          itemName: components[1] ?? undefined,
          targetValue: isNaN(targetValue as number) ? undefined : targetValue,
          sd: isNaN(sd as number) ? undefined : sd,
          measuredValue: obx.fields[4] ?? undefined,
          unit: obx.fields[5] ?? undefined,
          referenceRange: obx.fields[6] ?? undefined,
          flags: obx.fields[7] ?? undefined,
          channelNo: obx.fields[8] ?? undefined,
        };
      });

    if (items.length > 0) {
      this.qcService.createQcResultItems(qcResultId, items);
    }

    // Evaluate QC pass/fail
    this.qcService.evaluateQcResult(qcResultId);

    this.logger.log(
      `QC result saved: id=${qcResultId}, solution=${solutionName}, level=${qcLevel ?? '?'}, items=${items.length}`,
    );
  }

  /**
   * Check if an OBX segment is a metadata item (not a real test result).
   */
  private isMetadataObx(obx: Hl7Segment): boolean {
    const itemIdRaw = obx.fields[2] ?? '';
    const itemId = itemIdRaw.split('^')[0];
    return METADATA_ITEM_IDS.has(itemId);
  }

  private findSegment(
    message: Hl7Message,
    name: string,
  ): Hl7Segment | undefined {
    return message.segments.find((s) => s.name === name);
  }

  private findAllSegments(message: Hl7Message, name: string): Hl7Segment[] {
    return message.segments.filter((s) => s.name === name);
  }
}

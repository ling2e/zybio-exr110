import { Injectable } from '@nestjs/common';
import { DsrWorkOrder, OrmWorkOrder } from './hl7.types';

const CR = '\r';

/** Generate a timestamp-based control ID for outgoing messages. */
function generateControlId(): string {
  const now = new Date();
  const ts = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return ts + rand;
}

/** Format a Date to HL7 timestamp (YYYYMMDDHHmmss). */
function hl7Timestamp(date = new Date()): string {
  return date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0');
}

/**
 * Pure-logic HL7 message builder for the Zybio EXR subset.
 * Builds outgoing messages: ACK^R01, QCK^Q02, DSR^Q03, ORM^O01.
 * No I/O dependencies — only string construction.
 */
@Injectable()
export class Hl7BuilderService {
  /**
   * Build ACK^R01 — acknowledge a received ORU^R01 message.
   * @param originalControlId MSH-10 from the original message (echoed in MSA-2)
   * @param ackCode AA (accept), AE (error), or AR (reject)
   * @param statusCode MSA status code (default 0 = accepted)
   */
  buildAck(
    originalControlId: string,
    ackCode: 'AA' | 'AE' | 'AR',
    statusCode = 0,
  ): string {
    const controlId = generateControlId();
    const dateTime = hl7Timestamp();

    const msh = `MSH|^~\\&|||Q3|Zybio|${dateTime}||ACK^R01|${controlId}|P|2.3.1||||||UNICODE`;
    const msa = `MSA|${ackCode}|${originalControlId}|||${statusCode}|`;

    return [msh, msa].join(CR);
  }

  /**
   * Build QCK^Q02 — immediate acknowledgment of a work order query.
   * @param originalControlId MSH-10 from the QRY^Q02 message
   * @param queryFound true → QAK status OK, false → NF (not found)
   */
  buildQck(originalControlId: string, queryFound: boolean): string {
    const controlId = generateControlId();
    const dateTime = hl7Timestamp();
    const qakStatus = queryFound ? 'OK' : 'NF';

    const msh = `MSH|^~\\&|LIS||||${dateTime}||QCK^Q02|${controlId}|P|2.3.1||||||ASCII`;
    const msa = `MSA|AA|${originalControlId}|Message accepted|||0|`;
    const qak = `QAK|SR|${qakStatus}|`;

    return [msh, msa, qak].join(CR);
  }

  /**
   * Build DSR^Q03 — work order data response with DSP segments.
   * @param originalControlId MSH-10 from the QRY^Q02 message
   * @param queryDateTime QRD-1 from the original query
   * @param queryId QRD-4 from the original query
   * @param barcode QRD-8 from the original query
   * @param workOrder work order data to encode in DSP segments
   */
  buildDsr(
    originalControlId: string,
    queryDateTime: string,
    queryId: string,
    barcode: string,
    workOrder: DsrWorkOrder,
  ): string {
    const controlId = generateControlId();
    const dateTime = hl7Timestamp();

    const msh = `MSH|^~\\&|LIS||||${dateTime}||DSR^Q03|${controlId}|P|2.3.1||||||ASCII`;
    const qak = `QAK|SR|OK|`;
    const msa = `MSA|AA|${originalControlId}|Message accepted|||0|`;
    const qrd = `QRD|${queryDateTime}|R|D|${queryId}|||1|${barcode}|OTH|IVD||T`;

    const dspSegments = this.buildDspSegments(workOrder);

    return [msh, qak, msa, qrd, ...dspSegments].join(CR);
  }

  /**
   * Build ORM^O01 — push a work order to a connected device.
   * @param workOrder work order data for ORC + OBR + PID segments
   */
  buildOrm(workOrder: OrmWorkOrder): string {
    const controlId = generateControlId();
    const dateTime = hl7Timestamp();

    const msh = `MSH|^~\\&|LIS||||${dateTime}||ORM^O01|${controlId}|P|2.3.1||||||UNICODE`;
    const orc = `ORC|RF||${workOrder.sampleNo}||IP|`;
    const obr = `OBR||${workOrder.barcode}|${workOrder.sampleNo}|01001^Automated Count^99MRC||${workOrder.samplingTime ?? ''}|||||||||${workOrder.sampleType}||||||||||HM||||||||`;
    const pid = `PID|1||${workOrder.patientNo}^^^^MR||${workOrder.patientName}^|||${workOrder.sex}|${workOrder.pregnant ?? ''}`;

    return [msh, orc, obr, pid].join(CR);
  }

  /** Build DSP segments from work order fields. */
  private buildDspSegments(wo: DsrWorkOrder): string[] {
    const segments: string[] = [];

    // ponytail: map of DSP set-ID → value. Only emit segments for non-empty values.
    const fields: [number, string | undefined][] = [
      [1, wo.patientName],
      [2, wo.sex],
      [3, wo.age != null ? String(wo.age) : undefined],
      [4, wo.ageUnit],
      [5, wo.sampleType],
      [6, wo.items.join('^')],
      [7, wo.pregnant],
      [8, wo.sampleNo],
      [9, wo.patientType],
      [10, wo.department],
      [12, wo.patientNo],
      [13, wo.admissionNo],
      [14, wo.submitter],
      [16, wo.reviewer],
      [17, wo.samplingTime],
      [18, wo.submissionTime],
      [21, wo.diagnosis],
    ];

    for (const [setId, value] of fields) {
      if (value != null && value !== '') {
        segments.push(`DSP|${setId}||${value}||`);
      }
    }

    return segments;
  }
}

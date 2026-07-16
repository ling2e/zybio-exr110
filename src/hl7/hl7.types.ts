/**
 * Parsed HL7 message — output of Hl7ParserService.parse()
 */
export interface Hl7Message {
  raw: string;
  segments: Hl7Segment[];
  msh: MshSegment;
}

export interface Hl7Segment {
  name: string;        // e.g. 'MSH', 'OBX', 'PID'
  fields: string[];    // Raw field values (pipe-separated)
}

export interface MshSegment {
  sendingApp: string;       // MSH-3
  sendingFacility: string;  // MSH-4
  receivingApp: string;     // MSH-5
  receivingFacility: string; // MSH-6
  dateTime: string;         // MSH-7
  messageType: string;      // MSH-9 e.g. 'ORU^R01'
  controlId: string;        // MSH-10
  processingId: string;     // MSH-11 'P' or 'Q'
  versionId: string;        // MSH-12 '2.3.1'
}

/**
 * Thrown when HL7 parsing fails. Caught by the router to produce error ACKs.
 */
export class Hl7ParseError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 102,
  ) {
    super(message);
    this.name = 'Hl7ParseError';
  }
}

/**
 * Work order data for DSR^Q03 response (server → instrument).
 * Fields map to DSP set IDs 1–21.
 */
export interface DsrWorkOrder {
  patientName?: string;
  sex?: string;
  age?: number;
  ageUnit?: string;
  sampleType: string;
  items: string[];
  pregnant?: string;
  sampleNo?: string;
  patientType?: string;
  department?: string;
  patientNo?: string;
  admissionNo?: string;
  submitter?: string;
  reviewer?: string;
  samplingTime?: string;
  submissionTime?: string;
  diagnosis?: string;
}

/**
 * Work order data for ORM^O01 push (server → instrument).
 */
export interface OrmWorkOrder {
  barcode: string;
  sampleNo: string;
  patientName: string;
  patientNo: string;
  sex: string;
  pregnant?: string;
  sampleType: string;
  items: string[];
  samplingTime?: string;
}

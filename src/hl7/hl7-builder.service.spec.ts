import { Hl7BuilderService } from './hl7-builder.service';
import { DsrWorkOrder, OrmWorkOrder } from './hl7.types';

describe('Hl7BuilderService', () => {
  let builder: Hl7BuilderService;

  beforeEach(() => {
    builder = new Hl7BuilderService();
  });

  describe('buildAck', () => {
    it('should build ACK^R01 with MSA echoing original control ID', () => {
      const result = builder.buildAck('202201041927229109', 'AA');
      const segments = result.split('\r');

      expect(segments).toHaveLength(2);
      expect(segments[0]).toMatch(/^MSH\|\^~\\&\|\|\|Q3\|Zybio\|\d{14}\|\|ACK\^R01\|\d+\|P\|2\.3\.1\|\|\|\|\|\|UNICODE$/);
      expect(segments[1]).toContain('MSA|AA|202201041927229109');
    });

    it('should include error status code', () => {
      const result = builder.buildAck('ctrl123', 'AE', 102);
      const segments = result.split('\r');
      const msa = segments[1];

      expect(msa).toContain('MSA|AE|ctrl123');
      expect(msa).toContain('102');
    });

    it('should produce AR reject codes', () => {
      const result = builder.buildAck('ctrl456', 'AR', 200);
      const segments = result.split('\r');

      expect(segments[1]).toContain('MSA|AR|ctrl456');
      expect(segments[1]).toContain('200');
    });
  });

  describe('buildQck', () => {
    it('should build QCK^Q02 with OK when query found', () => {
      const result = builder.buildQck('20220528152659', true);
      const segments = result.split('\r');

      expect(segments).toHaveLength(3);
      expect(segments[0]).toMatch(/MSH\|\^~\\&\|LIS\|\|\|\|\d{14}\|\|QCK\^Q02\|/);
      expect(segments[1]).toContain('MSA|AA|20220528152659');
      expect(segments[2]).toBe('QAK|SR|OK|');
    });

    it('should build QCK^Q02 with NF when query not found', () => {
      const result = builder.buildQck('20220528152659', false);
      const segments = result.split('\r');

      expect(segments[2]).toBe('QAK|SR|NF|');
    });
  });

  describe('buildDsr', () => {
    const workOrder: DsrWorkOrder = {
      patientName: 'Zhang San',
      sex: 'F',
      age: 24,
      ageUnit: 'yr',
      sampleType: 'WH_BLOOD',
      items: ['PCT', 'CRP'],
      pregnant: 'N',
    };

    it('should build DSR^Q03 with QAK, MSA, QRD and DSP segments', () => {
      const result = builder.buildDsr(
        '20220528152659',
        '20200915103050',
        '258',
        '123456',
        workOrder,
      );
      const segments = result.split('\r');

      // MSH
      expect(segments[0]).toMatch(/MSH\|\^~\\&\|LIS\|\|\|\|\d{14}\|\|DSR\^Q03\|/);
      // QAK
      expect(segments[1]).toBe('QAK|SR|OK|');
      // MSA
      expect(segments[2]).toContain('MSA|AA|20220528152659');
      // QRD
      expect(segments[3]).toBe('QRD|20200915103050|R|D|258|||1|123456|OTH|IVD||T');
      // DSP segments
      expect(segments[4]).toBe('DSP|1||Zhang San||');
      expect(segments[5]).toBe('DSP|2||F||');
      expect(segments[6]).toBe('DSP|3||24||');
      expect(segments[7]).toBe('DSP|4||yr||');
      expect(segments[8]).toBe('DSP|5||WH_BLOOD||');
      expect(segments[9]).toBe('DSP|6||PCT^CRP||');
      expect(segments[10]).toBe('DSP|7||N||');
    });

    it('should only include DSP segments for non-empty fields', () => {
      const minimal: DsrWorkOrder = {
        sampleType: 'SERUM',
        items: ['PCT'],
      };
      const result = builder.buildDsr('ctrl1', '20200101', '1', 'BC001', minimal);
      const segments = result.split('\r');
      const dspSegments = segments.filter((s) => s.startsWith('DSP'));

      // Only sampleType (5) and items (6) should be present
      expect(dspSegments).toHaveLength(2);
      expect(dspSegments[0]).toBe('DSP|5||SERUM||');
      expect(dspSegments[1]).toBe('DSP|6||PCT||');
    });
  });

  describe('buildOrm', () => {
    const workOrder: OrmWorkOrder = {
      barcode: '123456',
      sampleNo: 'S001',
      patientName: 'Li Wei',
      patientNo: 'MR789',
      sex: 'M',
      pregnant: 'N',
      sampleType: 'PLASMA',
      items: ['PCT', 'CRP'],
      samplingTime: '20240315103000',
    };

    it('should build ORM^O01 with MSH, ORC, OBR, PID', () => {
      const result = builder.buildOrm(workOrder);
      const segments = result.split('\r');

      expect(segments).toHaveLength(4);
      // MSH
      expect(segments[0]).toMatch(/MSH\|\^~\\&\|LIS\|\|\|\|\d{14}\|\|ORM\^O01\|/);
      expect(segments[0]).toContain('UNICODE');
      // ORC: RF, empty placer, sampleNo as filler, IP
      expect(segments[1]).toBe('ORC|RF||S001||IP|');
      // OBR: barcode, sampleNo, service ID, samplingTime, sampleType, HM
      expect(segments[2]).toContain('OBR||123456|S001|01001^Automated Count^99MRC||20240315103000');
      expect(segments[2]).toContain('PLASMA');
      expect(segments[2]).toContain('HM');
      // PID
      expect(segments[3]).toBe('PID|1||MR789^^^^MR||Li Wei^|||M|N');
    });

    it('should handle missing optional fields', () => {
      const minimal: OrmWorkOrder = {
        barcode: 'BC99',
        sampleNo: 'SN99',
        patientName: 'Test',
        patientNo: 'P99',
        sex: 'F',
        sampleType: 'WH_BLOOD',
        items: ['SAA'],
      };
      const result = builder.buildOrm(minimal);
      const segments = result.split('\r');

      // samplingTime empty in OBR
      expect(segments[2]).toContain('OBR||BC99|SN99|01001^Automated Count^99MRC||');
      // pregnant empty in PID
      expect(segments[3]).toBe('PID|1||P99^^^^MR||Test^|||F|');
    });
  });

  describe('segment separator', () => {
    it('should use CR (\\r) as segment separator, not LF', () => {
      const result = builder.buildAck('test123', 'AA');
      expect(result).toContain('\r');
      expect(result).not.toContain('\n');
    });
  });
});

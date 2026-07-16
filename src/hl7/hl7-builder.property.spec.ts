import * as fc from 'fast-check';
import { Hl7BuilderService } from './hl7-builder.service';
import { DsrWorkOrder, OrmWorkOrder } from './hl7.types';

const CR = '\r';

describe('Hl7BuilderService — Property Tests', () => {
  let builder: Hl7BuilderService;

  beforeAll(() => {
    builder = new Hl7BuilderService();
  });

  // Feature: lis-server-api, Property 3: ACK Echoes Original Control ID
  // **Validates: Requirements FR-2.4, FR-3.3**
  describe('Property 3: ACK Echoes Original Control ID', () => {
    it('MSA-2 equals the original MSH-10 for any non-empty control ID', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('|') && !s.includes('\r') && !s.includes('\n')),
          (controlId) => {
            const ack = builder.buildAck(controlId, 'AA');
            const segments = ack.split(CR);
            const msaSegment = segments.find(s => s.startsWith('MSA|'));
            expect(msaSegment).toBeDefined();

            const msaFields = msaSegment!.split('|');
            // MSA|ackCode|originalControlId|...
            expect(msaFields[2]).toBe(controlId);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('MSA-2 echoes control ID for all ACK codes', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('|') && !s.includes('\r') && !s.includes('\n')),
          fc.constantFrom('AA' as const, 'AE' as const, 'AR' as const),
          (controlId, ackCode) => {
            const ack = builder.buildAck(controlId, ackCode);
            const segments = ack.split(CR);
            const msaSegment = segments.find(s => s.startsWith('MSA|'));
            const msaFields = msaSegment!.split('|');
            expect(msaFields[2]).toBe(controlId);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // Feature: lis-server-api, Property 4: DSR Response Contains All Required DSP Segments
  // **Validates: Requirements FR-4.3**
  describe('Property 4: DSR Response Contains All Required DSP Segments', () => {
    const arbDsrWorkOrder: fc.Arbitrary<DsrWorkOrder> = fc.record({
      patientName: fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('|') && !s.includes('\r')),
      sex: fc.constantFrom('M', 'F', 'O'),
      age: fc.integer({ min: 0, max: 150 }),
      ageUnit: fc.constantFrom('yr', 'mo', 'w', 'd', 'hr'),
      sampleType: fc.constantFrom('WH_BLOOD', 'PLASMA', 'SERUM', 'URINE', 'OTHER'),
      items: fc.array(
        fc.constantFrom('PCT', 'CRP', 'SAA', 'IL-6', 'cTnT', 'NT-proBNP', 'HbA1c'),
        { minLength: 1, maxLength: 5 },
      ),
      pregnant: fc.constantFrom('Y', 'N', undefined),
      sampleNo: fc.option(fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('|') && !s.includes('\r')), { nil: undefined }),
    });

    it('DSP segments with set IDs 1-6 are all present with correct values', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('|') && !s.includes('\r')),
          fc.string({ minLength: 14, maxLength: 14 }).map(() => '20240315103000'),
          fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('|') && !s.includes('\r')),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('|') && !s.includes('\r')),
          arbDsrWorkOrder,
          (originalControlId, queryDateTime, queryId, barcode, workOrder) => {
            const dsr = builder.buildDsr(originalControlId, queryDateTime, queryId, barcode, workOrder);
            const segments = dsr.split(CR);
            const dspSegments = segments.filter(s => s.startsWith('DSP|'));

            // Extract DSP set IDs present
            const dspMap = new Map<number, string>();
            for (const dsp of dspSegments) {
              const fields = dsp.split('|');
              const setId = parseInt(fields[1], 10);
              const value = fields[3]; // DSP|setId||value||
              dspMap.set(setId, value);
            }

            // Set IDs 1-6 must all be present
            expect(dspMap.has(1)).toBe(true);
            expect(dspMap.has(2)).toBe(true);
            expect(dspMap.has(3)).toBe(true);
            expect(dspMap.has(4)).toBe(true);
            expect(dspMap.has(5)).toBe(true);
            expect(dspMap.has(6)).toBe(true);

            // Values must match work order fields
            expect(dspMap.get(1)).toBe(workOrder.patientName);
            expect(dspMap.get(2)).toBe(workOrder.sex);
            expect(dspMap.get(3)).toBe(String(workOrder.age));
            expect(dspMap.get(4)).toBe(workOrder.ageUnit);
            expect(dspMap.get(5)).toBe(workOrder.sampleType);
            expect(dspMap.get(6)).toBe(workOrder.items.join('^'));
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // Feature: lis-server-api, Property 5: ORM^O01 Message Construction
  // **Validates: Requirements FR-5.1**
  describe('Property 5: ORM^O01 Message Construction', () => {
    const arbOrmWorkOrder: fc.Arbitrary<OrmWorkOrder> = fc.record({
      barcode: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('|') && !s.includes('\r') && !s.includes('^')),
      sampleNo: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('|') && !s.includes('\r') && !s.includes('^')),
      patientName: fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('|') && !s.includes('\r') && !s.includes('^')),
      patientNo: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('|') && !s.includes('\r') && !s.includes('^')),
      sex: fc.constantFrom('M', 'F', 'O'),
      pregnant: fc.option(fc.constantFrom('Y', 'N'), { nil: undefined }),
      sampleType: fc.constantFrom('WH_BLOOD', 'PLASMA', 'SERUM', 'URINE', 'OTHER'),
      items: fc.array(
        fc.constantFrom('PCT', 'CRP', 'SAA', 'IL-6', 'cTnT', 'NT-proBNP'),
        { minLength: 1, maxLength: 5 },
      ),
      samplingTime: fc.option(fc.constant('20240315103000'), { nil: undefined }),
    });

    it('contains MSH with ORM^O01, ORC with RF, OBR with barcode, PID with patient', () => {
      fc.assert(
        fc.property(arbOrmWorkOrder, (workOrder) => {
          const orm = builder.buildOrm(workOrder);
          const segments = orm.split(CR);

          // MSH segment present with correct message type
          const msh = segments.find(s => s.startsWith('MSH|'));
          expect(msh).toBeDefined();
          expect(msh).toContain('ORM^O01');

          // ORC segment with RF order control and sampleNo in field 3
          const orc = segments.find(s => s.startsWith('ORC|'));
          expect(orc).toBeDefined();
          const orcFields = orc!.split('|');
          expect(orcFields[1]).toBe('RF');
          expect(orcFields[3]).toBe(workOrder.sampleNo);

          // OBR segment with barcode
          const obr = segments.find(s => s.startsWith('OBR|'));
          expect(obr).toBeDefined();
          expect(obr).toContain(workOrder.barcode);

          // PID segment with patient data
          const pid = segments.find(s => s.startsWith('PID|'));
          expect(pid).toBeDefined();
          expect(pid).toContain(workOrder.patientName);
          expect(pid).toContain(workOrder.patientNo);
          expect(pid).toContain(workOrder.sex);
        }),
        { numRuns: 100 },
      );
    });
  });
});

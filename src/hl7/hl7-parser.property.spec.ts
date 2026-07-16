import * as fc from 'fast-check';
import { Hl7ParserService } from './hl7-parser.service';
import { Hl7ParseError } from './hl7.types';

describe('Hl7ParserService — Property Tests', () => {
  let parser: Hl7ParserService;

  beforeEach(() => {
    parser = new Hl7ParserService();
  });

  // Feature: lis-server-api, Property 2: HL7 Message Parsing Completeness
  // **Validates: Requirements FR-2.1, FR-2.2**
  describe('Property 2: HL7 Message Parsing Completeness', () => {
    /**
     * For any valid ORU^R01 with N OBX segments, parsing yields exactly N OBX
     * segments with correct fields extracted at the right positions.
     */
    it('for any valid ORU^R01 with N OBX segments, parsing yields exactly N items with correct fields', () => {
      // Generator for a safe HL7 field value (no pipes, no CR/LF, no separators)
      const safeChar = fc
        .integer({ min: 0x20, max: 0x7e })
        .filter((code) => !'|^~\\&'.includes(String.fromCharCode(code)))
        .map((code) => String.fromCharCode(code));
      const safeFieldValue = fc
        .array(safeChar, { minLength: 1, maxLength: 20 })
        .map((chars) => chars.join(''));

      const numericValue = fc.float({ min: Math.fround(0.01), max: Math.fround(9999), noNaN: true }).map((v) => v.toFixed(2));

      const obxArb = fc.record({
        setId: fc.integer({ min: 1, max: 999 }).map(String),
        valueType: fc.constantFrom('NM', 'IS', 'ST'),
        itemId: safeFieldValue,
        itemName: safeFieldValue,
        value: numericValue,
        unit: fc.constantFrom('μg/mL', 'ng/mL', 'mg/L', '%'),
        refRange: fc.constantFrom('<10', '0-5', '>1', '(10-20]'),
        flags: fc.constantFrom('N', 'H', 'L', 'A~H', 'A~L'),
      });

      fc.assert(
        fc.property(
          fc.array(obxArb, { minLength: 1, maxLength: 20 }),
          (obxList) => {
            // Build a valid ORU^R01 message
            const msh =
              'MSH|^~\\&|Q3|Zybio|||20220104192722||ORU^R01|CTRL001|P|2.3.1||||||UNICODE';
            const obr =
              'OBR|1||sample1|01001^Automated Count^99MRC||20220104|20220104|||||||PLASMA|||||||||||HM||||||||';

            const obxLines = obxList.map(
              (obx, i) =>
                `OBX|${i + 1}|${obx.valueType}|${obx.itemId}^${obx.itemName}^LN||${obx.value}|${obx.unit}|${obx.refRange}|${obx.flags}|||F`,
            );

            const raw = [msh, obr, ...obxLines].join('\r');
            const result = parser.parse(raw);

            // Filter only OBX segments
            const obxSegments = result.segments.filter((s) => s.name === 'OBX');

            // Must have exactly N OBX segments
            expect(obxSegments.length).toBe(obxList.length);

            // Verify each OBX segment has correct fields
            for (let i = 0; i < obxList.length; i++) {
              const seg = obxSegments[i];
              const expected = obxList[i];

              // fields[0] = set_id (OBX-1)
              expect(seg.fields[0]).toBe(String(i + 1));
              // fields[1] = value_type (OBX-2)
              expect(seg.fields[1]).toBe(expected.valueType);
              // fields[2] = item_id (OBX-3), component-separated
              expect(seg.fields[2]).toBe(
                `${expected.itemId}^${expected.itemName}^LN`,
              );
              // fields[4] = value (OBX-5)
              expect(seg.fields[4]).toBe(expected.value);
              // fields[5] = unit (OBX-6)
              expect(seg.fields[5]).toBe(expected.unit);
              // fields[6] = reference_range (OBX-7)
              expect(seg.fields[6]).toBe(expected.refRange);
              // fields[7] = flags (OBX-8)
              expect(seg.fields[7]).toBe(expected.flags);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // Feature: lis-server-api, Property 10: Malformed Message Error Response
  // **Validates: Requirements NFR-5**
  describe('Property 10: Malformed Message Error Response', () => {
    /**
     * Invalid byte sequences (arbitrary strings including unicode, binary-like content)
     * never crash the parser — they always produce an Hl7ParseError or a valid parse result.
     */
    it('invalid byte sequences never crash, always produce Hl7ParseError or valid result', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 500 }), (input) => {
          try {
            const result = parser.parse(input);
            // If it parsed successfully, it must have a valid structure
            expect(result).toHaveProperty('raw');
            expect(result).toHaveProperty('segments');
            expect(result).toHaveProperty('msh');
          } catch (e) {
            // Must be Hl7ParseError, never any other error type
            expect(e).toBeInstanceOf(Hl7ParseError);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('binary-like sequences with control characters never crash', () => {
      // Generate strings with control characters, null bytes, etc.
      const binaryLikeArb = fc.array(
        fc.integer({ min: 0, max: 255 }),
        { minLength: 0, maxLength: 200 },
      ).map((bytes) => String.fromCharCode(...bytes));

      fc.assert(
        fc.property(binaryLikeArb, (input) => {
          try {
            const result = parser.parse(input);
            expect(result).toHaveProperty('raw');
            expect(result).toHaveProperty('segments');
            expect(result).toHaveProperty('msh');
          } catch (e) {
            expect(e).toBeInstanceOf(Hl7ParseError);
          }
        }),
        { numRuns: 100 },
      );
    });
  });

  // Feature: lis-server-api, Property 11: QRD Barcode Extraction
  // **Validates: Requirements FR-4.1**
  describe('Property 11: QRD Barcode Extraction', () => {
    /**
     * For any alphanumeric barcode string embedded in a valid QRY^Q02 QRD segment,
     * parsing extracts QRD fields[7] exactly matching the original barcode.
     */
    it('QRD field 8 barcode is extracted exactly', () => {
      const barcodeChar = fc.constantFrom(
        ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'.split(''),
      );
      const barcodeArb = fc
        .array(barcodeChar, { minLength: 1, maxLength: 30 })
        .map((chars) => chars.join(''));

      fc.assert(
        fc.property(barcodeArb, (barcode) => {
          // Build a valid QRY^Q02 message with the barcode in QRD-8
          const msh =
            'MSH|^~\\&|Q3|Zybio|||20200915103050||QRY^Q02|CTRL002|P|2.3.1||||||ASCII';
          const qrd = `QRD|20200915103050|R|D|258|||1|${barcode}|OTH|IVD||T`;

          const raw = [msh, qrd].join('\r');
          const result = parser.parse(raw);

          // Find the QRD segment
          const qrdSegment = result.segments.find((s) => s.name === 'QRD');
          expect(qrdSegment).toBeDefined();

          // QRD fields[7] should be the barcode (QRD-8, 0-indexed from field 1)
          expect(qrdSegment!.fields[7]).toBe(barcode);
        }),
        { numRuns: 100 },
      );
    });
  });
});

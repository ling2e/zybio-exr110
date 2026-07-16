import { Hl7ParserService } from './hl7-parser.service';
import { Hl7ParseError } from './hl7.types';

describe('Hl7ParserService', () => {
  let parser: Hl7ParserService;

  beforeEach(() => {
    parser = new Hl7ParserService();
  });

  const SAMPLE_ORU = [
    'MSH|^~\\&|Q3|Zybio|||20220104192722||ORU^R01|202201041927229109|P|2.3.1||||||UNICODE',
    'SFT|Zybio|1.1|EXR100|q20-gc14||',
    'PID|1||binlihao^^^^MR||xingmin^|||M|N',
    'PV1|1|huanzheleixin|keshi^^chuanghao|zhuyuanhao||||||||||||||||',
    'OBR|3008||44rr|01001^Automated Count^99MRC||20211223165200|20211223165240|||songjianzhe|||zhenduan|20211223165200|PLASMA|jianYanzhe||||||||HM||||||||',
    'OBX|1|IS|03001^Take Mode^99MRC||O||||||F',
    'OBX|2|NM|31525-0^Age^LN||12|yr|||||F',
    'OBX|3|IS|09001^Remark^99MRC||beizhu||||||F',
    'OBX|4|IS|03004^Sys Seq^99MRC||3008||||||F',
    'OBX|5|IS|03005^Worklist Seq^99MRC||-1||||||F',
    'OBX|6|NM|6806-1^SAA^LN||125.00|μg/mL|<10|A~H|6806||F',
  ].join('\r');

  describe('parse()', () => {
    it('should parse a valid ORU^R01 message', () => {
      const result = parser.parse(SAMPLE_ORU);

      expect(result.raw).toBe(SAMPLE_ORU);
      expect(result.segments).toHaveLength(11);
      expect(result.segments[0].name).toBe('MSH');
      expect(result.segments[1].name).toBe('SFT');
      expect(result.segments[5].name).toBe('OBX');
    });

    it('should correctly extract MSH fields', () => {
      const result = parser.parse(SAMPLE_ORU);

      expect(result.msh.sendingApp).toBe('Q3');
      expect(result.msh.sendingFacility).toBe('Zybio');
      expect(result.msh.receivingApp).toBe('');
      expect(result.msh.receivingFacility).toBe('');
      expect(result.msh.dateTime).toBe('20220104192722');
      expect(result.msh.messageType).toBe('ORU^R01');
      expect(result.msh.controlId).toBe('202201041927229109');
      expect(result.msh.processingId).toBe('P');
      expect(result.msh.versionId).toBe('2.3.1');
    });

    it('should parse QC message (MSH-11=Q)', () => {
      const qcMsg = [
        'MSH|^~\\&|Q3|Zybio|||20200731150629||ORU^R01|202007311506294157|Q|2.3.1||||2||UNICODE',
        'OBR|1|QC solution 1|123456|02001^QCR^99MRC||20200731||||||||||||||||||HM||||||||',
        'OBX|1|NM|6802-1^cTnT^LN|5^0.5|<0.01|ng/mL|<0.04ng/mL|N|6802||F',
      ].join('\r');

      const result = parser.parse(qcMsg);
      expect(result.msh.processingId).toBe('Q');
      expect(result.msh.messageType).toBe('ORU^R01');
      expect(result.msh.controlId).toBe('202007311506294157');
      expect(result.segments).toHaveLength(3);
    });

    it('should parse work order query (QRY^Q02)', () => {
      const qryMsg = [
        'MSH|^~\\&|Q3|Zybio|||20200915103050||QRY^Q02|20220528152659|P|2.3.1||||||ASCII',
        'QRD|20200915103050|R|D|258|||1|123456|OTH|IVD||T',
      ].join('\r');

      const result = parser.parse(qryMsg);
      expect(result.msh.messageType).toBe('QRY^Q02');
      expect(result.msh.controlId).toBe('20220528152659');
      expect(result.segments[1].name).toBe('QRD');
      // QRD-8 (barcode) = fields[7] (0-indexed from field 1)
      expect(result.segments[1].fields[7]).toBe('123456');
    });

    it('should handle segments with many empty fields', () => {
      const msg = [
        'MSH|^~\\&|Q3|Zybio|||20220104192722||ORU^R01|123|P|2.3.1||||||UNICODE',
        'OBR|3008||44rr|01001^Automated Count^99MRC||20211223165200|20211223165240|||songjianzhe|||zhenduan|20211223165200|PLASMA|jianYanzhe||||||||HM||||||||',
      ].join('\r');

      const result = parser.parse(msg);
      expect(result.segments[1].name).toBe('OBR');
      expect(result.segments[1].fields[0]).toBe('3008');
      expect(result.segments[1].fields[1]).toBe(''); // empty OBR-2
      expect(result.segments[1].fields[2]).toBe('44rr');
    });

    it('should handle \\n line endings', () => {
      const msg =
        'MSH|^~\\&|Q3|Zybio|||20220104192722||ORU^R01|123|P|2.3.1||||||UNICODE\nOBX|1|NM|6806-1^SAA^LN||125.00|μg/mL|<10|A~H|6806||F';
      const result = parser.parse(msg);
      expect(result.segments).toHaveLength(2);
    });

    it('should handle \\r\\n line endings', () => {
      const msg =
        'MSH|^~\\&|Q3|Zybio|||20220104192722||ORU^R01|123|P|2.3.1||||||UNICODE\r\nOBX|1|NM|6806-1^SAA^LN||125.00|μg/mL|<10|A~H|6806||F';
      const result = parser.parse(msg);
      expect(result.segments).toHaveLength(2);
    });
  });

  describe('error handling', () => {
    it('should throw Hl7ParseError for empty input', () => {
      expect(() => parser.parse('')).toThrow(Hl7ParseError);
    });

    it('should throw Hl7ParseError for null/undefined', () => {
      expect(() => parser.parse(null as any)).toThrow(Hl7ParseError);
      expect(() => parser.parse(undefined as any)).toThrow(Hl7ParseError);
    });

    it('should throw Hl7ParseError when first segment is not MSH', () => {
      expect(() => parser.parse('OBX|1|NM|test||5')).toThrow(Hl7ParseError);
      expect(() => parser.parse('OBX|1|NM|test||5')).toThrow(
        /not MSH/,
      );
    });

    it('should throw Hl7ParseError when MSH has too few fields', () => {
      expect(() => parser.parse('MSH|^~\\&|Q3|Zybio')).toThrow(Hl7ParseError);
    });

    it('should include status code in parse errors', () => {
      try {
        parser.parse('OBX|1|NM|test||5');
      } catch (e) {
        expect(e).toBeInstanceOf(Hl7ParseError);
        expect((e as Hl7ParseError).statusCode).toBe(100);
      }
    });
  });

  describe('unescape()', () => {
    it('should unescape \\F\\ to pipe', () => {
      expect(parser.unescape('hello\\F\\world')).toBe('hello|world');
    });

    it('should unescape \\S\\ to caret', () => {
      expect(parser.unescape('A\\S\\B')).toBe('A^B');
    });

    it('should unescape \\T\\ to ampersand', () => {
      expect(parser.unescape('X\\T\\Y')).toBe('X&Y');
    });

    it('should unescape \\R\\ to tilde', () => {
      expect(parser.unescape('A\\R\\B')).toBe('A~B');
    });

    it('should unescape \\E\\ to backslash', () => {
      expect(parser.unescape('path\\E\\file')).toBe('path\\file');
    });

    it('should unescape \\.br\\ to CR', () => {
      expect(parser.unescape('line1\\.br\\line2')).toBe('line1\rline2');
    });

    it('should handle multiple escape sequences', () => {
      expect(parser.unescape('a\\F\\b\\S\\c\\R\\d')).toBe('a|b^c~d');
    });

    it('should return value unchanged if no escapes', () => {
      expect(parser.unescape('plain text 123')).toBe('plain text 123');
    });

    it('should return empty/falsy values unchanged', () => {
      expect(parser.unescape('')).toBe('');
      expect(parser.unescape(null as any)).toBe(null);
      expect(parser.unescape(undefined as any)).toBe(undefined);
    });
  });
});

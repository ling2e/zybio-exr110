import { OruHandlerService } from './oru-handler.service';
import { Hl7RouterService } from './hl7-router.service';
import { Hl7BuilderService } from './hl7-builder.service';
import { Hl7ParserService } from './hl7-parser.service';
import { ResultsService } from '../results/results.service';
import { QcService } from '../qc/qc.service';
import { MessagesService } from '../messages/messages.service';
import { DevicesService } from '../devices/devices.service';

// ponytail: direct instantiation with partial mocks — no TestingModule overhead
function createHandler() {
  const router = { registerHandler: jest.fn() } as any as Hl7RouterService;
  const builder = new Hl7BuilderService();
  const resultsService = {
    upsertPatient: jest.fn().mockReturnValue(42),
    createResult: jest.fn().mockReturnValue(1),
    createResultItems: jest.fn(),
  } as any as ResultsService;
  const qcService = {
    createQcResult: jest.fn().mockReturnValue(10),
    createQcResultItems: jest.fn(),
    evaluateQcResult: jest.fn(),
  } as any as QcService;
  const messagesService = { logMessage: jest.fn() } as any as MessagesService;
  const devicesService = {
    updateLastMessage: jest.fn(),
    updateDeviceInfo: jest.fn(),
  } as any as DevicesService;

  const handler = new OruHandlerService(
    router,
    builder,
    resultsService,
    qcService,
    messagesService,
    devicesService,
  );

  return { handler, router, resultsService, qcService, messagesService, devicesService };
}

const parser = new Hl7ParserService();

describe('OruHandlerService', () => {
  it('registers itself for ORU^R01 on module init', () => {
    const { handler, router } = createHandler();
    handler.onModuleInit();
    expect(router.registerHandler).toHaveBeenCalledWith('ORU^R01', handler);
  });

  describe('Sample result (MSH-11=P)', () => {
    const sampleMessage = [
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

    it('logs message before processing', async () => {
      const { handler, messagesService } = createHandler();
      const msg = parser.parse(sampleMessage);
      await handler.handle(msg, 'device1');
      expect(messagesService.logMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceId: 'device1',
          direction: 'in',
          messageType: 'ORU^R01',
          controlId: '202201041927229109',
        }),
      );
    });

    it('updates device last message and device info from SFT', async () => {
      const { handler, devicesService } = createHandler();
      const msg = parser.parse(sampleMessage);
      await handler.handle(msg, 'device1');
      expect(devicesService.updateLastMessage).toHaveBeenCalledWith('device1');
      expect(devicesService.updateDeviceInfo).toHaveBeenCalledWith('device1', 'EXR100', '1.1');
    });

    it('upserts patient from PID/PV1 segments', async () => {
      const { handler, resultsService } = createHandler();
      const msg = parser.parse(sampleMessage);
      await handler.handle(msg, 'device1');
      expect(resultsService.upsertPatient).toHaveBeenCalledWith({
        medicalRecordNo: 'binlihao',
        name: 'xingmin',
        sex: 'M',
        pregnant: 'N',
        department: 'keshi',
        admissionNo: 'zhuyuanhao',
      });
    });

    it('inserts test_result with OBR fields', async () => {
      const { handler, resultsService } = createHandler();
      const msg = parser.parse(sampleMessage);
      await handler.handle(msg, 'device1');
      expect(resultsService.createResult).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceId: 'device1',
          patientId: 42,
          barcode: '',      // OBR-2 is empty in this sample (set ID 3008 is in OBR-1)
          sampleNo: '44rr', // OBR-3
          sampleType: 'PLASMA',
          serviceId: '01001',
          samplingTime: '20211223165200',
          testTime: '20211223165240',
          collector: 'songjianzhe',
          tester: 'jianYanzhe',
          diagnosis: 'zhenduan',
        }),
      );
    });

    it('skips metadata OBX and inserts only real result items', async () => {
      const { handler, resultsService } = createHandler();
      const msg = parser.parse(sampleMessage);
      await handler.handle(msg, 'device1');
      expect(resultsService.createResultItems).toHaveBeenCalledWith(1, [
        expect.objectContaining({
          setId: 6,
          valueType: 'NM',
          itemId: '6806-1',
          itemName: 'SAA',
          value: '125.00',
          unit: 'μg/mL',
          referenceRange: '<10',
          flags: 'A~H',
          channelNo: '6806',
        }),
      ]);
    });

    it('returns ACK with AA and original controlId', async () => {
      const { handler } = createHandler();
      const msg = parser.parse(sampleMessage);
      const ack = await handler.handle(msg, 'device1');
      expect(ack).toContain('ACK^R01');
      expect(ack).toContain('MSA|AA|202201041927229109');
    });
  });

  describe('QC result (MSH-11=Q)', () => {
    const qcMessage = [
      'MSH|^~\\&|Q3|Zybio|||20200731150629||ORU^R01|202007311506294157|Q|2.3.1||||2||UNICODE',
      'OBR|1|QC solution 1|123456|02001^QCR^99MRC||20200731||||||||||||||||||HM||||||||',
      'OBX|1|IS|03006^Qc Level^99MRC||M||||||F',
      'OBX|2|NM|6802-1^cTnT^LN|5^0.5|0.03|ng/mL|<0.04ng/mL|N|6802||F',
      'OBX|3|NM|6802-2^CK-MB^LN|10^1|11.83|ng/mL|<5ng/mL|A~H|6802||F',
    ].join('\r');

    it('inserts qc_result with OBR fields and level from metadata OBX', async () => {
      const { handler, qcService } = createHandler();
      const msg = parser.parse(qcMessage);
      await handler.handle(msg, 'device2');
      expect(qcService.createQcResult).toHaveBeenCalledWith({
        deviceId: 'device2',
        solutionName: 'QC solution 1', // OBR-2 full value
        lotNo: '123456',
        level: 'M',
        serviceId: '02001',
        testTime: '',
        expiryDate: '20200731',
      });
    });

    it('inserts qc_result_items with target/SD from OBX-4, skipping metadata', async () => {
      const { handler, qcService } = createHandler();
      const msg = parser.parse(qcMessage);
      await handler.handle(msg, 'device2');
      expect(qcService.createQcResultItems).toHaveBeenCalledWith(10, [
        expect.objectContaining({
          setId: 2,
          itemId: '6802-1',
          itemName: 'cTnT',
          targetValue: 5,
          sd: 0.5,
          measuredValue: '0.03',
          unit: 'ng/mL',
          flags: 'N',
        }),
        expect.objectContaining({
          setId: 3,
          itemId: '6802-2',
          itemName: 'CK-MB',
          targetValue: 10,
          sd: 1,
          measuredValue: '11.83',
          unit: 'ng/mL',
          flags: 'A~H',
        }),
      ]);
    });

    it('evaluates QC result after insertion', async () => {
      const { handler, qcService } = createHandler();
      const msg = parser.parse(qcMessage);
      await handler.handle(msg, 'device2');
      expect(qcService.evaluateQcResult).toHaveBeenCalledWith(10);
    });

    it('returns ACK with AA', async () => {
      const { handler } = createHandler();
      const msg = parser.parse(qcMessage);
      const ack = await handler.handle(msg, 'device2');
      expect(ack).toContain('ACK^R01');
      expect(ack).toContain('MSA|AA|202007311506294157');
    });
  });
});

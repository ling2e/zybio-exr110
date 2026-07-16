import { Test, TestingModule } from '@nestjs/testing';
import { Hl7RouterService, Hl7MessageHandler } from './hl7-router.service';
import { MllpService } from './mllp.service';
import { Hl7ParserService } from './hl7-parser.service';
import { Hl7BuilderService } from './hl7-builder.service';
import { Hl7ParseError } from './hl7.types';

describe('Hl7RouterService', () => {
  let router: Hl7RouterService;
  let mllp: MllpService;
  let parser: Hl7ParserService;
  let builder: Hl7BuilderService;

  const mockMllp = {
    on: jest.fn(),
    sendToDevice: jest.fn(),
  };

  const mockParser = {
    parse: jest.fn(),
  };

  const mockBuilder = {
    buildAck: jest.fn().mockReturnValue('MOCK_ACK'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Hl7RouterService,
        { provide: MllpService, useValue: mockMllp },
        { provide: Hl7ParserService, useValue: mockParser },
        { provide: Hl7BuilderService, useValue: mockBuilder },
      ],
    }).compile();

    router = module.get(Hl7RouterService);
    mllp = module.get(MllpService);
    parser = module.get(Hl7ParserService);
    builder = module.get(Hl7BuilderService);
  });

  describe('onModuleInit', () => {
    it('should subscribe to mllp frame events', () => {
      router.onModuleInit();
      expect(mockMllp.on).toHaveBeenCalledWith('frame', expect.any(Function));
    });
  });

  describe('registerHandler', () => {
    it('should register a handler for a message type', () => {
      const handler: Hl7MessageHandler = {
        handle: jest.fn().mockResolvedValue('ACK'),
      };
      router.registerHandler('ORU^R01', handler);

      // Verify via dispatch
      mockParser.parse.mockReturnValue({
        raw: '',
        segments: [],
        msh: { messageType: 'ORU^R01', controlId: '123' },
      });

      return router.processFrame('device1', 'raw').then(() => {
        expect(handler.handle).toHaveBeenCalled();
      });
    });
  });

  describe('processFrame', () => {
    it('should dispatch to registered handler and send response', async () => {
      const handler: Hl7MessageHandler = {
        handle: jest.fn().mockResolvedValue('RESPONSE_MSG'),
      };
      router.registerHandler('ORU^R01', handler);

      mockParser.parse.mockReturnValue({
        raw: 'raw_msg',
        segments: [],
        msh: { messageType: 'ORU^R01', controlId: 'CTRL001' },
      });

      await router.processFrame('dev1', 'raw_msg');

      expect(handler.handle).toHaveBeenCalledWith(
        expect.objectContaining({ msh: expect.objectContaining({ controlId: 'CTRL001' }) }),
        'dev1',
      );
      expect(mockMllp.sendToDevice).toHaveBeenCalledWith('dev1', 'RESPONSE_MSG');
    });

    it('should send multiple responses when handler returns array', async () => {
      const handler: Hl7MessageHandler = {
        handle: jest.fn().mockResolvedValue(['MSG1', 'MSG2']),
      };
      router.registerHandler('QRY^Q02', handler);

      mockParser.parse.mockReturnValue({
        raw: '',
        segments: [],
        msh: { messageType: 'QRY^Q02', controlId: 'Q001' },
      });

      await router.processFrame('dev1', 'raw');

      expect(mockMllp.sendToDevice).toHaveBeenCalledTimes(2);
      expect(mockMllp.sendToDevice).toHaveBeenCalledWith('dev1', 'MSG1');
      expect(mockMllp.sendToDevice).toHaveBeenCalledWith('dev1', 'MSG2');
    });

    it('should send AR ACK for unknown message types', async () => {
      mockParser.parse.mockReturnValue({
        raw: '',
        segments: [],
        msh: { messageType: 'UNKNOWN^X99', controlId: 'U001' },
      });

      await router.processFrame('dev1', 'raw');

      expect(mockBuilder.buildAck).toHaveBeenCalledWith('U001', 'AR', 200);
      expect(mockMllp.sendToDevice).toHaveBeenCalledWith('dev1', 'MOCK_ACK');
    });

    it('should silently ignore ACK^R03 (no response sent)', async () => {
      mockParser.parse.mockReturnValue({
        raw: '',
        segments: [],
        msh: { messageType: 'ACK^R03', controlId: 'A001' },
      });

      await router.processFrame('dev1', 'raw');

      expect(mockMllp.sendToDevice).not.toHaveBeenCalled();
      expect(mockBuilder.buildAck).not.toHaveBeenCalled();
    });

    it('should send AE ACK on parse failure with statusCode from error', async () => {
      mockParser.parse.mockImplementation(() => {
        throw new Hl7ParseError('MSH segment has too few fields', 101);
      });

      await router.processFrame('dev1', 'garbage');

      expect(mockBuilder.buildAck).toHaveBeenCalledWith('unknown', 'AE', 101);
      expect(mockMllp.sendToDevice).toHaveBeenCalledWith('dev1', 'MOCK_ACK');
    });

    it('should send AE ACK with default statusCode 102 on generic parse error', async () => {
      mockParser.parse.mockImplementation(() => {
        throw new Hl7ParseError('Data type error');
      });

      await router.processFrame('dev1', 'bad');

      expect(mockBuilder.buildAck).toHaveBeenCalledWith('unknown', 'AE', 102);
      expect(mockMllp.sendToDevice).toHaveBeenCalledWith('dev1', 'MOCK_ACK');
    });

    it('should send AE ACK with 207 when handler throws unexpected error', async () => {
      const handler: Hl7MessageHandler = {
        handle: jest.fn().mockRejectedValue(new Error('DB connection failed')),
      };
      router.registerHandler('ORU^R01', handler);

      mockParser.parse.mockReturnValue({
        raw: '',
        segments: [],
        msh: { messageType: 'ORU^R01', controlId: 'CTRL002' },
      });

      await router.processFrame('dev1', 'raw');

      expect(mockBuilder.buildAck).toHaveBeenCalledWith('CTRL002', 'AE', 207);
      expect(mockMllp.sendToDevice).toHaveBeenCalledWith('dev1', 'MOCK_ACK');
    });

    it('should never throw (catches all errors)', async () => {
      mockParser.parse.mockImplementation(() => {
        throw new Error('Catastrophic failure');
      });

      // Should not throw
      await expect(router.processFrame('dev1', 'raw')).resolves.toBeUndefined();
    });
  });
});

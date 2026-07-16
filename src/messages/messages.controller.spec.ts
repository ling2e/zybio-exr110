import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

describe('MessagesController', () => {
  let controller: MessagesController;
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(MessagesController);
    service = module.get(MessagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('delegates to service with query params', () => {
      const result = { data: [], total: 0, page: 1, limit: 50 };
      (service.findAll as jest.Mock).mockReturnValue(result);

      expect(controller.findAll({ direction: 'in', page: 1, limit: 50 })).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith({ direction: 'in', page: 1, limit: 50 });
    });
  });

  describe('findOne', () => {
    it('returns message with hex dump string', () => {
      (service.findById as jest.Mock).mockReturnValue({
        id: 1,
        direction: 'in',
        raw_hex: Buffer.from([0x0b, 0x4d, 0x53]),
        decoded_text: 'MSH|...',
      });

      const result = controller.findOne(1);

      expect(result.raw_hex).toBe('0b4d53');
    });

    it('throws NotFoundException when message not found', () => {
      (service.findById as jest.Mock).mockReturnValue(undefined);

      expect(() => controller.findOne(999)).toThrow(NotFoundException);
    });
  });
});

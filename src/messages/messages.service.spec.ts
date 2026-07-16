import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { DatabaseService } from '../database/database.service';

describe('MessagesService', () => {
  let service: MessagesService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: DatabaseService,
          useValue: {
            run: jest.fn(),
            get: jest.fn(),
            all: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(MessagesService);
    db = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logMessage', () => {
    it('inserts a row into message_log', () => {
      service.logMessage({
        deviceId: 'dev-1',
        direction: 'in',
        rawHex: Buffer.from('0b', 'hex'),
        decodedText: 'MSH|...',
        messageType: 'ORU^R01',
        controlId: 'ctrl-123',
      });

      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO message_log'),
        ['dev-1', 'in', Buffer.from('0b', 'hex'), 'MSH|...', 'ORU^R01', 'ctrl-123'],
      );
    });

    it('handles missing optional fields with null', () => {
      service.logMessage({ direction: 'out' });

      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO message_log'),
        [null, 'out', null, null, null, null],
      );
    });
  });

  describe('findAll', () => {
    it('returns paginated results with default page/limit', () => {
      (db.get as jest.Mock).mockReturnValue({ count: 3 });
      (db.all as jest.Mock).mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

      const result = service.findAll({});

      expect(result).toEqual({ data: [{ id: 1 }, { id: 2 }, { id: 3 }], total: 3, page: 1, limit: 50 });
      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC LIMIT ? OFFSET ?'),
        [50, 0],
      );
    });

    it('applies direction filter', () => {
      (db.get as jest.Mock).mockReturnValue({ count: 0 });
      (db.all as jest.Mock).mockReturnValue([]);

      service.findAll({ direction: 'in' });

      expect(db.get).toHaveBeenCalledWith(
        expect.stringContaining('direction = ?'),
        ['in'],
      );
    });

    it('applies date range filters', () => {
      (db.get as jest.Mock).mockReturnValue({ count: 0 });
      (db.all as jest.Mock).mockReturnValue([]);

      service.findAll({ dateFrom: '2024-01-01', dateTo: '2024-12-31' });

      expect(db.get).toHaveBeenCalledWith(
        expect.stringContaining('created_at >= ?'),
        expect.arrayContaining(['2024-01-01', '2024-12-31']),
      );
    });

    it('paginates correctly', () => {
      (db.get as jest.Mock).mockReturnValue({ count: 100 });
      (db.all as jest.Mock).mockReturnValue([]);

      const result = service.findAll({ page: 3, limit: 10 });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(db.all).toHaveBeenCalledWith(
        expect.any(String),
        [10, 20], // offset = (3-1)*10
      );
    });
  });

  describe('findById', () => {
    it('returns the message by id', () => {
      (db.get as jest.Mock).mockReturnValue({ id: 5, direction: 'in' });

      const result = service.findById(5);

      expect(result).toEqual({ id: 5, direction: 'in' });
      expect(db.get).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        [5],
      );
    });

    it('returns undefined when not found', () => {
      (db.get as jest.Mock).mockReturnValue(undefined);

      expect(service.findById(999)).toBeUndefined();
    });
  });
});

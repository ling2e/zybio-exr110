import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { DatabaseService } from '../database/database.service';
import { MllpService } from '../hl7/mllp.service';
import { EventEmitter } from 'events';

describe('DevicesService', () => {
  let service: DevicesService;
  let db: { run: jest.Mock; all: jest.Mock };
  let mllp: EventEmitter;

  beforeEach(async () => {
    db = { run: jest.fn(), all: jest.fn().mockReturnValue([]) };
    mllp = new EventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        { provide: DatabaseService, useValue: db },
        { provide: MllpService, useValue: mllp },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    service.onModuleInit();
  });

  it('registerDevice upserts into devices and inserts event', () => {
    service.registerDevice('192.168.1.1:5000', '192.168.1.1', 5000);
    expect(db.run).toHaveBeenCalledTimes(2);
    expect(db.run.mock.calls[0][0]).toContain('INSERT INTO devices');
    expect(db.run.mock.calls[0][0]).toContain('ON CONFLICT(id) DO UPDATE');
    expect(db.run.mock.calls[1][0]).toContain('INSERT INTO device_events');
  });

  it('disconnectDevice updates status and inserts event', () => {
    service.disconnectDevice('192.168.1.1:5000');
    expect(db.run).toHaveBeenCalledTimes(2);
    expect(db.run.mock.calls[0][0]).toContain("status = 'disconnected'");
    expect(db.run.mock.calls[1][0]).toContain('INSERT INTO device_events');
  });

  it('subscribes to mllp connect/disconnect events', () => {
    db.run.mockClear();
    mllp.emit('connect', '10.0.0.1:1234');
    // registerDevice called → 2 db.run calls
    expect(db.run).toHaveBeenCalledTimes(2);

    db.run.mockClear();
    mllp.emit('disconnect', '10.0.0.1:1234');
    // disconnectDevice called → 2 db.run calls
    expect(db.run).toHaveBeenCalledTimes(2);
  });

  it('updateDeviceInfo updates model and software_version', () => {
    service.updateDeviceInfo('192.168.1.1:5000', 'EXR110', '2.1');
    expect(db.run).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE devices SET model'),
      ['EXR110', '2.1', '192.168.1.1:5000'],
    );
  });

  it('updateLastMessage updates last_message_at', () => {
    service.updateLastMessage('192.168.1.1:5000');
    expect(db.run).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE devices SET last_message_at'),
      expect.arrayContaining(['192.168.1.1:5000']),
    );
  });

  it('findAll returns all devices', () => {
    db.all.mockReturnValue([{ id: '1', status: 'connected' }]);
    const result = service.findAll();
    expect(result).toEqual([{ id: '1', status: 'connected' }]);
    expect(db.all).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM devices'),
    );
  });

  it('findHistory returns events for a device', () => {
    db.all.mockReturnValue([{ id: 1, event_type: 'connected' }]);
    const result = service.findHistory('192.168.1.1:5000');
    expect(result).toEqual([{ id: 1, event_type: 'connected' }]);
    expect(db.all).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM device_events'),
      ['192.168.1.1:5000'],
    );
  });
});

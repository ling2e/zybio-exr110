import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MllpService } from '../hl7/mllp.service';
import { Device, DeviceEvent } from './entities/device.entity';
import * as net from 'net';

@Injectable()
export class DevicesService implements OnModuleInit {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly mllp: MllpService,
  ) {}

  onModuleInit() {
    this.mllp.on('connect', (deviceId: string) => {
      const [ip, portStr] = deviceId.split(':');
      const port = parseInt(portStr, 10);
      this.registerDevice(deviceId, ip, port);
    });

    this.mllp.on('disconnect', (deviceId: string) => {
      this.disconnectDevice(deviceId);
    });

    // Check all known devices on startup
    void this.checkAllDevices();
  }

  registerDevice(deviceId: string, ip: string, port: number): void {
    const now = new Date().toISOString();
    this.db.run(
      `INSERT INTO devices (id, ip_address, port, status, first_seen_at, last_seen_at)
       VALUES (?, ?, ?, 'connected', ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         ip_address = excluded.ip_address,
         port = excluded.port,
         status = 'connected',
         last_seen_at = excluded.last_seen_at`,
      [deviceId, ip, port, now, now],
    );
    this.db.run(
      `INSERT INTO device_events (device_id, event_type, created_at) VALUES (?, 'connected', ?)`,
      [deviceId, now],
    );
    this.logger.log(`Device registered: ${deviceId}`);
  }

  disconnectDevice(deviceId: string): void {
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE devices SET status = 'disconnected', last_seen_at = ? WHERE id = ?`,
      [now, deviceId],
    );
    this.db.run(
      `INSERT INTO device_events (device_id, event_type, created_at) VALUES (?, 'disconnected', ?)`,
      [deviceId, now],
    );
    this.logger.log(`Device disconnected: ${deviceId}`);
  }

  updateDeviceInfo(deviceId: string, model: string, softwareVersion: string): void {
    this.db.run(
      `UPDATE devices SET model = ?, software_version = ? WHERE id = ?`,
      [model, softwareVersion, deviceId],
    );
  }

  updateLastMessage(deviceId: string): void {
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE devices SET last_message_at = ? WHERE id = ?`,
      [now, deviceId],
    );
  }

  findAll(): Device[] {
    return this.db.all<Device>('SELECT * FROM devices ORDER BY last_seen_at DESC');
  }

  findHistory(deviceId: string): DeviceEvent[] {
    return this.db.all<DeviceEvent>(
      'SELECT * FROM device_events WHERE device_id = ? ORDER BY created_at DESC',
      [deviceId],
    );
  }

  /**
   * On server start, probe all known devices via TCP to update their status.
   * Devices that don't respond within 2s are marked disconnected.
   */
  async checkAllDevices(): Promise<void> {
    const devices = this.findAll();
    if (devices.length === 0) return;

    this.logger.log(`Checking ${devices.length} known device(s)...`);

    // ponytail: check sequentially to avoid socket flood. 2s timeout per device is fine for <50 devices.
    for (const device of devices) {
      const reachable = await this.tcpProbe(device.ip_address, device.port);
      const now = new Date().toISOString();

      if (reachable && device.status !== 'connected') {
        this.db.run(
          `UPDATE devices SET status = 'connected', last_seen_at = ? WHERE id = ?`,
          [now, device.id],
        );
        this.logger.log(`Device reachable: ${device.id}`);
      } else if (!reachable && device.status === 'connected') {
        this.db.run(
          `UPDATE devices SET status = 'disconnected', last_seen_at = ? WHERE id = ?`,
          [now, device.id],
        );
        this.logger.log(`Device unreachable: ${device.id}`);
      }
    }

    this.logger.log('Device check complete');
  }

  /**
   * Ping a single device by IP:port. Updates status in DB.
   * Returns true if reachable, false if not.
   */
  async pingDevice(deviceId: string): Promise<{ reachable: boolean; deviceId: string }> {
    const device = this.db.get<Device>('SELECT * FROM devices WHERE id = ?', [deviceId]);
    if (!device) {
      return { reachable: false, deviceId };
    }

    const reachable = await this.tcpProbe(device.ip_address, device.port);
    const now = new Date().toISOString();

    this.db.run(
      `UPDATE devices SET status = ?, last_seen_at = ? WHERE id = ?`,
      [reachable ? 'connected' : 'disconnected', now, device.id],
    );

    return { reachable, deviceId };
  }

  /**
   * Try to open a TCP connection to ip:port. Resolves true if connect succeeds, false on timeout/error.
   */
  private tcpProbe(ip: string, port: number, timeoutMs = 2000): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let settled = false;

      const done = (result: boolean) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve(result);
      };

      socket.setTimeout(timeoutMs);
      socket.on('connect', () => done(true));
      socket.on('timeout', () => done(false));
      socket.on('error', () => done(false));

      socket.connect(port, ip);
    });
  }
}

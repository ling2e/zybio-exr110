import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import * as net from 'net';

const SB = 0x0b; // Start Block
const EB = 0x1c; // End Block
const CR = 0x0d; // Carriage Return

export interface DeviceInfo {
  model: string;
  softwareVersion: string;
  vendor: string;
}

export interface MllpConnection {
  socket: net.Socket;
  buffer: Buffer;
  deviceId: string;
  connectedAt: Date;
  lastMessageAt: Date | null;
  deviceInfo: DeviceInfo | null;
}

/**
 * TCP server implementing MLLP (Minimal Lower Layer Protocol) framing.
 * Manages device connections and emits complete HL7 frames.
 *
 * Events:
 *  - 'frame' (deviceId: string, message: string) — complete HL7 message extracted
 *  - 'connect' (deviceId: string) — device connected
 *  - 'disconnect' (deviceId: string) — device disconnected
 */
@Injectable()
export class MllpService
  extends EventEmitter
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(MllpService.name);
  private server: net.Server;
  private connections = new Map<string, MllpConnection>();

  constructor(private readonly config: ConfigService) {
    super();
  }

  onModuleInit() {
    const port = this.config.get<number>('EXR_PORT', 10001);

    this.server = net.createServer((socket) => this.handleConnection(socket));

    this.server.on('error', (err) => {
      this.logger.error(`TCP server error: ${err.message}`);
    });

    this.server.listen(port, '0.0.0.0', () => {
      this.logger.log(`MLLP server listening on 0.0.0.0:${port}`);
    });
  }

  onModuleDestroy() {
    for (const conn of this.connections.values()) {
      conn.socket.destroy();
    }
    this.connections.clear();
    this.server?.close();
  }

  /** List all active connections */
  getConnections(): Map<string, MllpConnection> {
    return this.connections;
  }

  /** Send an HL7 message to a device, wrapped in MLLP framing */
  sendToDevice(deviceId: string, message: string): boolean {
    const conn = this.findConnectionByDeviceId(deviceId);
    if (!conn || conn.socket.destroyed) {
      this.logger.warn(`Cannot send to ${deviceId}: not connected`);
      return false;
    }
    const frame = MllpService.wrapFrame(message);
    conn.socket.write(frame);
    return true;
  }

  /** Wrap a message body in MLLP framing: SB + body + EB + CR */
  static wrapFrame(body: string): Buffer {
    const bodyBuf = Buffer.from(body, 'utf-8');
    const frame = Buffer.alloc(bodyBuf.length + 3);
    frame[0] = SB;
    bodyBuf.copy(frame, 1);
    frame[bodyBuf.length + 1] = EB;
    frame[bodyBuf.length + 2] = CR;
    return frame;
  }

  /**
   * Extract complete MLLP frames from a buffer.
   * Returns extracted message bodies and the remaining (unconsumed) buffer.
   */
  static extractFrames(buffer: Buffer): {
    messages: string[];
    remaining: Buffer;
  } {
    const messages: string[] = [];
    let offset = 0;

    while (offset < buffer.length) {
      // Scan for EB followed by CR
      let ebPos = -1;
      for (let i = offset; i < buffer.length - 1; i++) {
        if (buffer[i] === EB && buffer[i + 1] === CR) {
          ebPos = i;
          break;
        }
      }

      if (ebPos === -1) {
        // No complete frame found — return remainder
        break;
      }

      // Check for SB at start of this frame region
      let sbPos = offset;
      // Find the SB that starts this frame
      while (sbPos <= ebPos && buffer[sbPos] !== SB) {
        sbPos++;
      }

      if (sbPos > ebPos) {
        // No SB found before EB — discard this chunk as garbage
        offset = ebPos + 2;
        continue;
      }

      // Extract body between SB and EB (exclusive of both markers)
      const body = buffer.subarray(sbPos + 1, ebPos).toString('utf-8');
      messages.push(body);

      // Advance past EB + CR
      offset = ebPos + 2;
    }

    const remaining =
      offset < buffer.length ? buffer.subarray(offset) : Buffer.alloc(0);
    return { messages, remaining };
  }

  private handleConnection(socket: net.Socket) {
    const deviceId = `${socket.remoteAddress}:${socket.remotePort}`;
    this.logger.log(`Device connected: ${deviceId}`);

    const conn: MllpConnection = {
      socket,
      buffer: Buffer.alloc(0),
      deviceId,
      connectedAt: new Date(),
      lastMessageAt: null,
      deviceInfo: null,
    };

    this.connections.set(deviceId, conn);
    this.emit('connect', deviceId);

    socket.on('data', (chunk) => {
      conn.buffer = Buffer.concat([conn.buffer, chunk]);
      const { messages, remaining } = MllpService.extractFrames(conn.buffer);
      conn.buffer = remaining;

      for (const msg of messages) {
        conn.lastMessageAt = new Date();
        this.emit('frame', deviceId, msg);
      }
    });

    socket.on('close', () => {
      this.logger.log(`Device disconnected: ${deviceId}`);
      this.connections.delete(deviceId);
      this.emit('disconnect', deviceId);
    });

    socket.on('error', (err) => {
      this.logger.error(`Socket error (${deviceId}): ${err.message}`);
      // ponytail: don't crash — socket 'close' fires after error, cleanup happens there
    });
  }

  /** Find connection by deviceId (which may have been updated from IP:port to a device-derived ID) */
  private findConnectionByDeviceId(
    deviceId: string,
  ): MllpConnection | undefined {
    // Direct lookup first
    const direct = this.connections.get(deviceId);
    if (direct) return direct;
    // Fallback: scan by deviceId field (in case it was updated from SFT)
    for (const conn of this.connections.values()) {
      if (conn.deviceId === deviceId) return conn;
    }
    return undefined;
  }
}

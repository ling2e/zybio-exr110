import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MessageLog } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(private readonly db: DatabaseService) {}

  logMessage(data: {
    deviceId?: string;
    direction: 'in' | 'out';
    rawHex?: Buffer;
    decodedText?: string;
    messageType?: string;
    controlId?: string;
  }): number {
    const result = this.db.run(
      `INSERT INTO message_log (device_id, direction, raw_hex, decoded_text, message_type, control_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.deviceId ?? null,
        data.direction,
        data.rawHex ?? null,
        data.decodedText ?? null,
        data.messageType ?? null,
        data.controlId ?? null,
      ],
    );
    return result.lastInsertRowid as number;
  }

  findAll(filters: {
    direction?: 'in' | 'out';
    type?: string;
    deviceId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): { data: MessageLog[]; total: number; page: number; limit: number } {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.direction) {
      conditions.push('direction = ?');
      params.push(filters.direction);
    }
    if (filters.type) {
      conditions.push('message_type = ?');
      params.push(filters.type);
    }
    if (filters.deviceId) {
      conditions.push('device_id = ?');
      params.push(filters.deviceId);
    }
    if (filters.dateFrom) {
      conditions.push('created_at >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('created_at <= ?');
      params.push(filters.dateTo);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total =
      this.db.get<{ count: number }>(`SELECT COUNT(*) as count FROM message_log ${where}`, params)
        ?.count ?? 0;

    const data = this.db.all<MessageLog>(
      `SELECT * FROM message_log ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return { data, total, page, limit };
  }

  findById(id: number): MessageLog | undefined {
    return this.db.get<MessageLog>('SELECT * FROM message_log WHERE id = ?', [id]);
  }
}

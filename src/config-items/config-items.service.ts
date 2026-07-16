import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateConfigItemDto } from './dto/update-config-item.dto';
import { ConfigItem } from './entities/config-item.entity';

@Injectable()
export class ConfigItemsService {
  constructor(private readonly db: DatabaseService) {}

  findAll(): ConfigItem[] {
    return this.db.all<ConfigItem>(
      'SELECT * FROM config_items ORDER BY category, name',
    );
  }

  upsert(name: string, dto: UpdateConfigItemDto): ConfigItem | undefined {
    const now = new Date().toISOString();
    this.db.run(
      `INSERT INTO config_items (name, display_name, unit, reference_range, category, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(name) DO UPDATE SET
         display_name = COALESCE(excluded.display_name, config_items.display_name),
         unit = COALESCE(excluded.unit, config_items.unit),
         reference_range = COALESCE(excluded.reference_range, config_items.reference_range),
         category = COALESCE(excluded.category, config_items.category),
         updated_at = excluded.updated_at`,
      [
        name,
        dto.displayName ?? null,
        dto.unit ?? null,
        dto.referenceRange ?? null,
        dto.category ?? null,
        now,
      ],
    );
    return this.db.get<ConfigItem>(
      'SELECT * FROM config_items WHERE name = ?',
      [name],
    );
  }
}

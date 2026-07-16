import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseAdapter, SqliteAdapter } from './sqlite.adapter';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private adapter!: DatabaseAdapter;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const driver = this.config.get<string>('DATABASE_DRIVER', 'sqlite');
    const url = this.config.get<string>('DATABASE_URL', './data/exr110.db');

    if (driver === 'sqlite') {
      this.adapter = new SqliteAdapter(url);
    } else {
      // ponytail: pg.adapter.ts created later when migrating. For now, fail fast.
      throw new Error(
        `Unsupported DATABASE_DRIVER: ${driver}. Only "sqlite" is currently implemented.`,
      );
    }

    this.logger.log(`Database connected (${driver}: ${url})`);
    this.runMigrations();
  }

  onModuleDestroy() {
    this.adapter.close();
    this.logger.log('Database connection closed');
  }

  run(sql: string, params: unknown[] = []) {
    return this.adapter.run(sql, params);
  }

  get<T = unknown>(sql: string, params: unknown[] = []): T | undefined {
    return this.adapter.get<T>(sql, params);
  }

  all<T = unknown>(sql: string, params: unknown[] = []): T[] {
    return this.adapter.all<T>(sql, params);
  }

  private runMigrations() {
    const migrationsDir = join(__dirname, 'migrations');
    let files: string[];
    try {
      files = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();
    } catch {
      this.logger.warn('No migrations directory found — skipping');
      return;
    }

    for (const file of files) {
      const raw = readFileSync(join(migrationsDir, file), 'utf-8');
      // Strip comment lines, then split by semicolons for per-statement error handling
      const sql = raw
        .split('\n')
        .filter((line) => !line.trimStart().startsWith('--'))
        .join('\n');

      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        try {
          this.adapter.exec(stmt + ';');
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          // Tolerate "duplicate column" (re-running ALTER TABLE ADD COLUMN)
          if (msg.includes('duplicate column')) {
            this.logger.debug(`Skipped (already exists): ${stmt.substring(0, 60)}...`);
          } else {
            throw e;
          }
        }
      }
      this.logger.log(`Migration applied: ${file}`);
    }
  }
}

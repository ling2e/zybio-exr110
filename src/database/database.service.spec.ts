import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { existsSync, rmSync } from 'node:fs';

const TEST_DB = './data/test-db-service.db';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: string) => {
              if (key === 'DATABASE_DRIVER') return 'sqlite';
              if (key === 'DATABASE_URL') return TEST_DB;
              return fallback;
            },
          },
        },
      ],
    }).compile();

    service = module.get(DatabaseService);
    service.onModuleInit();
  });

  afterAll(() => {
    service.onModuleDestroy();
    if (existsSync(TEST_DB)) rmSync(TEST_DB);
  });

  it('run/get/all work with basic SQL', () => {
    service.run(
      'CREATE TABLE IF NOT EXISTS t (id INTEGER PRIMARY KEY, val TEXT)',
    );
    service.run('INSERT INTO t (val) VALUES (?)', ['hello']);
    service.run('INSERT INTO t (val) VALUES (?)', ['world']);

    const one = service.get<{ id: number; val: string }>(
      'SELECT * FROM t WHERE val = ?',
      ['hello'],
    );
    expect(one).toBeDefined();
    expect(one!.val).toBe('hello');

    const all = service.all<{ id: number; val: string }>(
      'SELECT * FROM t ORDER BY id',
    );
    expect(all).toHaveLength(2);
    expect(all[0].val).toBe('hello');
    expect(all[1].val).toBe('world');
  });

  it('run returns changes and lastInsertRowid', () => {
    service.run(
      'CREATE TABLE IF NOT EXISTS t2 (id INTEGER PRIMARY KEY, n INTEGER)',
    );
    const result = service.run('INSERT INTO t2 (n) VALUES (?)', [42]);
    expect(result.changes).toBe(1);
    expect(result.lastInsertRowid).toBeGreaterThan(0);
  });
});

-- 001-initial.sql
-- PostgreSQL-compatible subset: no AUTOINCREMENT, standard types only.
-- Idempotent via CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  ip_address TEXT NOT NULL,
  port INTEGER NOT NULL,
  model TEXT,
  software_version TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT,
  last_message_at TEXT
);

CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  sex TEXT CHECK(sex IN ('M','F','O')),
  date_of_birth TEXT,
  medical_record_no TEXT UNIQUE,
  department TEXT,
  admission_no TEXT,
  blood_type TEXT,
  pregnant TEXT CHECK(pregnant IN ('Y','N')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_orders (
  id INTEGER PRIMARY KEY,
  barcode TEXT NOT NULL,
  patient_id INTEGER REFERENCES patients(id),
  patient_name TEXT,
  sex TEXT,
  age INTEGER,
  age_unit TEXT DEFAULT 'yr',
  sample_type TEXT NOT NULL,
  items TEXT NOT NULL,
  department TEXT,
  patient_no TEXT,
  admission_no TEXT,
  submitter TEXT,
  reviewer TEXT,
  diagnosis TEXT,
  sampling_time TEXT,
  submission_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  target_device_id TEXT,
  push_status TEXT DEFAULT 'none',
  pushed_at TEXT,
  completed_at TEXT,
  expired_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_work_orders_barcode ON work_orders(barcode);

CREATE TABLE IF NOT EXISTS test_results (
  id INTEGER PRIMARY KEY,
  device_id TEXT REFERENCES devices(id),
  patient_id INTEGER REFERENCES patients(id),
  work_order_id INTEGER REFERENCES work_orders(id),
  barcode TEXT,
  sample_no TEXT,
  sample_type TEXT,
  service_id TEXT,
  sampling_time TEXT,
  test_time TEXT,
  result_time TEXT,
  collector TEXT,
  tester TEXT,
  diagnosis TEXT,
  status TEXT NOT NULL DEFAULT 'unreviewed',
  reviewed_by TEXT,
  review_comment TEXT,
  reviewed_at TEXT,
  voided_by TEXT,
  void_reason TEXT,
  voided_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_test_results_barcode ON test_results(barcode);

CREATE TABLE IF NOT EXISTS test_result_items (
  id INTEGER PRIMARY KEY,
  result_id INTEGER NOT NULL REFERENCES test_results(id),
  set_id INTEGER NOT NULL,
  value_type TEXT,
  item_id TEXT,
  item_name TEXT,
  value TEXT,
  unit TEXT,
  reference_range TEXT,
  flags TEXT,
  channel_no TEXT,
  sub_id TEXT
);

CREATE TABLE IF NOT EXISTS qc_results (
  id INTEGER PRIMARY KEY,
  device_id TEXT REFERENCES devices(id),
  solution_name TEXT,
  lot_no TEXT,
  level TEXT CHECK(level IN ('L','M','H')),
  service_id TEXT,
  test_time TEXT,
  expiry_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qc_result_items (
  id INTEGER PRIMARY KEY,
  qc_result_id INTEGER NOT NULL REFERENCES qc_results(id),
  set_id INTEGER NOT NULL,
  item_id TEXT,
  item_name TEXT,
  target_value REAL,
  sd REAL,
  measured_value TEXT,
  unit TEXT,
  reference_range TEXT,
  flags TEXT,
  channel_no TEXT
);

CREATE TABLE IF NOT EXISTS message_log (
  id INTEGER PRIMARY KEY,
  device_id TEXT,
  direction TEXT NOT NULL CHECK(direction IN ('in','out')),
  raw_hex BLOB,
  decoded_text TEXT,
  message_type TEXT,
  control_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_message_log_device_id ON message_log(device_id);
CREATE INDEX IF NOT EXISTS idx_message_log_message_type ON message_log(message_type);

CREATE TABLE IF NOT EXISTS device_events (
  id INTEGER PRIMARY KEY,
  device_id TEXT REFERENCES devices(id),
  event_type TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_events_device_id ON device_events(device_id);

CREATE TABLE IF NOT EXISTS config_items (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  unit TEXT,
  reference_range TEXT,
  category TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 002-message-log-relation.sql
-- Add message_log_id to test_results and qc_results for raw data traceability.
-- ponytail: SQLite ignores REFERENCES in ALTER TABLE but the column still gets added.
-- Idempotency: these will error if column already exists; handled by the migration runner wrapping in try/catch.

ALTER TABLE test_results ADD COLUMN message_log_id INTEGER;
ALTER TABLE qc_results ADD COLUMN message_log_id INTEGER;

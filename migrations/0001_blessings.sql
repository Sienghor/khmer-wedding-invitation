-- Guests' blessings (section 06). Only a hash of the visitor IP is kept, for rate limiting.
CREATE TABLE IF NOT EXISTS blessings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  message    TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 1000),
  country    TEXT,
  ip_hash    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_blessings_created ON blessings (created_at);
CREATE INDEX IF NOT EXISTS idx_blessings_ip_time ON blessings (ip_hash, created_at);

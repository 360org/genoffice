export const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  avatar_url TEXT,
  is_default INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS email_folders (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  unread_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  is_favorite INTEGER DEFAULT 0,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  folder_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  recipient_emails TEXT NOT NULL,
  cc_emails TEXT,
  bcc_emails TEXT,
  subject TEXT NOT NULL,
  snippet TEXT,
  date_iso TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  is_starred INTEGER DEFAULT 0,
  is_important INTEGER DEFAULT 0,
  is_draft INTEGER DEFAULT 0,
  has_attachments INTEGER DEFAULT 0,
  attachments_json TEXT,
  category TEXT DEFAULT 'focused',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES email_folders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_bodies (
  email_id TEXT PRIMARY KEY,
  html TEXT NOT NULL,
  plain_text TEXT NOT NULL,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS op_queue (
  id TEXT PRIMARY KEY,
  op_type TEXT NOT NULL,
  email_id TEXT NOT NULL,
  payload_json TEXT,
  status TEXT DEFAULT 'pending',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_emails_folder_date ON emails(folder_id, date_iso DESC);
CREATE INDEX IF NOT EXISTS idx_emails_category ON emails(folder_id, category);
CREATE INDEX IF NOT EXISTS idx_op_queue_status ON op_queue(status, created_at ASC);
`

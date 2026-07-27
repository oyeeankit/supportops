-- Migration: 017_daily_report_portal.sql
-- Create daily_report_submissions and daily_report_attachments tables

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status_enum') THEN
    CREATE TYPE submission_status_enum AS ENUM ('draft', 'submitted', 'late', 'missing');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS daily_report_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('morning', 'day', 'evening')),
  status submission_status_enum NOT NULL DEFAULT 'draft',
  is_late BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  draft_payload JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_employee_work_date UNIQUE (employee_id, work_date)
);

CREATE TABLE IF NOT EXISTS daily_report_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES daily_report_submissions(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INT NOT NULL,
  file_type TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'daily-log-attachments',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_report_submissions_employee ON daily_report_submissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_report_submissions_date ON daily_report_submissions(work_date);
CREATE INDEX IF NOT EXISTS idx_report_submissions_status ON daily_report_submissions(status);
CREATE INDEX IF NOT EXISTS idx_report_attachments_submission ON daily_report_attachments(submission_id);

-- RLS Policies
ALTER TABLE daily_report_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_attachments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select their own or if manager
CREATE POLICY "Allow users select daily_report_submissions"
  ON daily_report_submissions FOR SELECT
  USING (
    auth.uid() = employee_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
  );

CREATE POLICY "Allow users insert own daily_report_submissions"
  ON daily_report_submissions FOR INSERT
  WITH CHECK (
    auth.uid() = employee_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
  );

CREATE POLICY "Allow users update own daily_report_submissions"
  ON daily_report_submissions FOR UPDATE
  USING (
    auth.uid() = employee_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
  );

-- Attachments RLS Policies
CREATE POLICY "Allow users select daily_report_attachments"
  ON daily_report_attachments FOR SELECT
  USING (
    auth.uid() = employee_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
  );

CREATE POLICY "Allow users insert own daily_report_attachments"
  ON daily_report_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = employee_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
  );

-- Supabase Schema for Tracker App
-- Run this in your Supabase SQL Editor to create the tables

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Logs table (tracks when activities are completed)
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, logged_date)
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logged_date DATE NOT NULL UNIQUE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_logs_activity_id ON logs(activity_id);
CREATE INDEX IF NOT EXISTS idx_logs_logged_date ON logs(logged_date);
CREATE INDEX IF NOT EXISTS idx_notes_logged_date ON notes(logged_date);

-- Enable Row Level Security (RLS) - you can customize these policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you should add proper auth policies later)
CREATE POLICY "Allow all for activities" ON activities FOR ALL USING (true);
CREATE POLICY "Allow all for logs" ON logs FOR ALL USING (true);
CREATE POLICY "Allow all for notes" ON notes FOR ALL USING (true);


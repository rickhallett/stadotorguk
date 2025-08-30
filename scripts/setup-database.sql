-- Neon PostgreSQL Database Setup for Swanage Traffic Alliance
-- Run this script in your Neon database console

-- Create leads table to replace markdown files
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  submission_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  visitor_type VARCHAR(20) DEFAULT 'Local' CHECK (visitor_type IN ('Local', 'Visitor', 'Tourist', 'Other')),
  comments TEXT,
  referral_code VARCHAR(100),
  source VARCHAR(50) DEFAULT 'signup_form',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page views table to replace Edge Config
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads(timestamp);
CREATE INDEX IF NOT EXISTS idx_leads_visitor_type ON leads(visitor_type);
CREATE INDEX IF NOT EXISTS idx_leads_published ON leads(published);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_submission_id ON leads(submission_id);

-- Initialize page views counter (set to 0 or current count from Edge Config)
INSERT INTO page_views (view_count) 
VALUES (0) 
ON CONFLICT DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
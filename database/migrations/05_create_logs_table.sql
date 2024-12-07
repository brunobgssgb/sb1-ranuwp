-- Create logs table for error tracking
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_logs_level_created 
ON logs(level, created_at DESC);

-- Create index for user logs
CREATE INDEX IF NOT EXISTS idx_logs_user 
ON logs(user_id, created_at DESC);
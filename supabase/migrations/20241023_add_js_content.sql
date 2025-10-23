-- Add js_content column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS js_content TEXT DEFAULT '';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

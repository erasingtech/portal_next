-- Add html_excerpt and js_excerpt columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS html_excerpt TEXT DEFAULT '';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS js_excerpt TEXT DEFAULT '';

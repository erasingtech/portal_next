# Database Migrations

This directory contains SQL migrations for the Supabase database.

## Running Migrations

To apply the `20241023_add_js_content.sql` migration, you can:

1. **Using Supabase CLI:**
   ```bash
   supabase migration up
   ```

2. **Using Supabase Dashboard:**
   - Go to the SQL Editor in your Supabase project
   - Copy and paste the contents of the migration file
   - Execute the SQL

3. **Directly in Supabase:**
   ```sql
   ALTER TABLE posts ADD COLUMN IF NOT EXISTS js_content TEXT DEFAULT '';
   CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
   ```

## Migration Details

### `20241023_add_js_content.sql`
Adds support for storing JavaScript content separately from HTML content:
- Adds `js_content` column to the `posts` table
- Provides default empty string for backward compatibility
- Creates an index on the `status` column for better query performance

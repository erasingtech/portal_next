# Supabase Integration

This project integrates with Supabase for database operations. The integration includes:

- Supabase client utilities for both browser and server
- Middleware for session management
- Validation utilities for posts
- API routes for CRUD operations on posts

## Setup

1. Create a Supabase project at https://supabase.com/
2. Add the following environment variables to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional, for server-side operations)
3. Run the SQL schema for posts in Supabase's SQL editor
4. Generate TypeScript types using `npx supabase gen types typescript --project-id <PROJECT_REF> > src/utils/database.types.ts`

## Usage

The integration provides:

- `src/utils/supabase/client.ts` - for client-side operations
- `src/utils/supabase/server.ts` - for server-side operations
- `src/utils/supabase/middleware.ts` - for session management
- `src/utils/validation.ts` - for validating and sanitizing post data
- `src/app/api/posts/route.ts` - for CRUD operations on posts

## Testing

Run tests with:
```bash
pnpm test
```

## Security

The implementation follows best practices for security:
- Uses Row-Level Security (RLS) policies in Supabase
- Validates all incoming data with Zod
- Sanitizes HTML content with DOMPurify
- Uses cookie-based authentication with JWT
- Implements proper authorization checks
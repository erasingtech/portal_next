Next‑JS + Supabase – End‑to‑End Spec & Implementation Guide
(focus: a Post API that stores rich HTML content)

1. Project‑level Overview

Layer Responsibility Tech / Library
Frontend React components (App Router), client‑side data fetching (SWR / TanStack Query) next@13+, react, tailwindcss (optional)
API / Server Route‑handlers (app/api/.../route.ts) exposing CRUD, pagination, auth, validation Next.js App Router, Route Handlers, @supabase/ssr
DB PostgreSQL managed by Supabase – tables, RLS policies, SQL functions Supabase
Auth Cookie‑based JWT that Supabase refreshes on every request @supabase/ssr + Supabase Auth
Types Auto‑generated TypeScript types from Supabase schema supabase gen types
Validation Runtime request validation & sanitisation zod, dompurify
CI / Deploy Lint, unit tests, Vercel (or any platform that runs Next.js) eslint, jest, vercel
The whole stack lives in a single repository – no separate backend service is required because Supabase is accessed directly from the server‑side route handlers.

2. Supabase Project Setup

2.1 Create a Supabase project

Go to https://database.new (or the Supabase dashboard) and create a new project.
Note the Project URL and Anon/public key – they will be needed as env vars (see § 3).
2.2 SQL schema for posts

-- public.posts
create table public.posts (
id uuid primary key default gen_random_uuid(),
title text not null,
slug text not null unique,
html_content text not null, -- raw HTML (store as TEXT)
excerpt text, -- optional short text
author_id uuid references auth.users(id) on delete cascade,
status text not null default 'draft', -- draft | published | archived
published_at timestamp with time zone,
created_at timestamp not null default now(),
updated_at timestamp not null default now()
);

-- RLS: only the author may edit/delete, everyone can read published posts
alter table public.posts enable row level security;

create policy "public read"
on public.posts
for select
using (status = 'published');

create policy "author write"
on public.posts
for all
using (auth.uid() = author_id);
Why these fields?

Field Purpose
id Primary key – UUID for safe public exposure
title / slug Human readable title + SEO‑friendly URL
html_content Full post body (stored as raw HTML)
excerpt Optional short preview for listings
author_id FK to Supabase Auth user
status Draft / published flow
published_at Timestamp used for sorting / RSS
created_at / updated_at Audit columns (auto‑maintained by triggers if desired)
The tables/ RLS policy snippet above is pure SQL and can be run in Supabase’s SQL editor.

2.3 Generate TypeScript types

# after linking the project (supabase login && supabase link)

npx supabase gen types typescript --project-id <PROJECT_REF> > utils/database.types.ts
The generated file (e.g. utils/database.types.ts) contains a Database interface you’ll import in your API layer for full‑type safety.

3. Local Development Environment

Create .env.local in the repo root:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url # ← project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb-pub-xxxxxxxxxxxxx # ← anon/public key

# (Optional) service_role key – do NOT expose to the browser

SUPABASE_SERVICE_ROLE_KEY=service_role_secret
The Supabase docs explicitly show this pattern
[15]
.

4. Supabase Client Utilities (SSR & Browser)

Create a folder utils/supabase/ with two tiny helpers.

4.1 client.ts – for React client components

// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
4.2 server.ts – for Route Handlers, Server Actions, Server Components

// utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabaseServerClient() {
const cookieStore = await cookies();
return createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
{
cookies: {
getAll() {
return cookieStore.getAll();
},
setAll(cookiesToSet) {
cookiesToSet.forEach(({ name, value, options }) => {
cookieStore.set(name, value, options);
});
},
},
}
);
}
The above pattern mirrors the createServerClient example that Supabase recommends for the App Router
[17]
.

4.3 Middleware (refreshes auth cookies)

Add middleware.ts at the project root (or under src/):

// middleware.ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
return await updateSession(request); // contacts Supabase to refresh JWT
}

export const config = {
matcher: [
// everything except static assets & favicons
'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
],
};
The code mirrors Supabase’s official snippet
[18]
.

5. Validation & HTML Sanitisation

Zod – schema for incoming JSON payloads.
DOMPurify – clean the HTML before saving to the DB (prevents XSS).
// utils/validation.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export const postSchema = z.object({
title: z.string().min(1).max(200),
slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(100),
html_content: z.string().min(1),
excerpt: z.string().max(300).optional(),
status: z.enum(['draft', 'published', 'archived']).default('draft'),
published_at: z.coerce.date().optional(),
});

// Helper: sanitize HTML before insert / update
export const sanitizeHtml = (dirty: string): string => {
return DOMPurify.sanitize(dirty, {
ADD_TAGS: ['iframe'],
ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
});
};
Why isomorphic-dompurify? It works both on the server (Node) and the client, making the same sanitisation logic reusable.

6. API – Route Handlers (app/api/posts/route.ts)

Using the App Router (app/api/.../route.ts) gives you a single file that can export GET, POST, PUT, DELETE methods.

// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/utils/supabase/server';
import { postSchema, sanitizeHtml } from '@/utils/validation';
import type { Database } from '@/utils/database.types';
import { z } from 'zod';

// Helper to map Supabase rows to public shape (omit internal fields)
type PostRow = Database['public']['Tables']['posts']['Row'];
type PostPublic = Omit<PostRow, 'author_id'> & { authorId: string | null };

const toPublic = (row: PostRow): PostPublic => ({
...row,
authorId: row.author_id,
});

export async function GET(request: Request) {
const { searchParams } = new URL(request.url);
const limit = Number(searchParams.get('limit')) || 10;
const offset = Number(searchParams.get('offset')) || 0;
const status = searchParams.get('status') ?? 'published';

const supabase = await getSupabaseServerClient();
const { data, error } = await supabase
.from('posts')
.select('\*')
.eq('status', status)
.order('published_at', { ascending: false })
.range(offset, offset + limit - 1);

if (error) return NextResponse.json({ error: error.message }, { status: 500 });

const posts = (data as PostRow[]).map(toPublic);
return NextResponse.json({ posts, limit, offset });
}

export async function POST(request: Request) {
const body = await request.json();

const parsed = postSchema.safeParse(body);
if (!parsed.success) {
return NextResponse.json(
{ error: parsed.error.format() },
{ status: 400 }
);
}

const supabase = await getSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
}

const cleanHtml = sanitizeHtml(parsed.data.html_content);
const { error, data } = await supabase
.from('posts')
.insert({
...parsed.data,
html_content: cleanHtml,
author_id: user.id,
})
.select()
.single();

if (error) {
return NextResponse.json({ error: error.message }, { status: 500 });
}

return NextResponse.json(toPublic(data as PostRow), { status: 201 });
}

/_ ---- UPDATE ------------------------------------------------------ _/
export async function PUT(request: Request) {
const { id, ...rest } = await request.json();

if (!id) {
return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
}

const parsed = postSchema.partial().safeParse(rest);
if (!parsed.success) {
return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
}

const supabase = await getSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
}

// Only the author can edit – rely on RLS, but we also double‑check
const { error: authErr } = await supabase
.from('posts')
.select('id')
.eq('id', id)
.eq('author_id', user.id)
.single();

if (authErr) {
return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

const updatePayload = {
...parsed.data,
...(parsed.data?.html_content && {
html_content: sanitizeHtml(parsed.data.html_content),
}),
};

const { error, data } = await supabase
.from('posts')
.update(updatePayload)
.eq('id', id)
.select()
.single();

if (error) {
return NextResponse.json({ error: error.message }, { status: 500 });
}

return NextResponse.json(toPublic(data as PostRow));
}

/_ ---- DELETE ------------------------------------------------------ _/
export async function DELETE(request: Request) {
const { searchParams } = new URL(request.url);
const id = searchParams.get('id');

if (!id) {
return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
}

const supabase = await getSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
}

const { error } = await supabase
.from('posts')
.delete()
.eq('id', id)
.eq('author_id', user.id);

if (error) {
return NextResponse.json({ error: error.message }, { status: 500 });
}

return NextResponse.json({ success: true });
}
Why this shape works

Feature Implementation
Typed DB access Uses the generated Database types (utils/database.types.ts).
Auth Calls supabase.auth.getUser() inside the server handler (cookies are automatically forwarded by createServerClient).
RLS safety The author_id check in the code is a defense‑in‑depth layer; the Row‑Level Security policy (see § 2.2) is the real gate‑keeper.
Validation zod schemas (postSchema) catch malformed payloads before any DB call.
HTML safety sanitizeHtml cleans the html_content field to avoid XSS.
Pagination limit/offset query parameters plus range() on the Supabase query.
Error handling All Supabase errors are mapped to a JSON response with an appropriate HTTP status. 7. Front‑end Consumption (optional snippet)

// app/posts/page.tsx – list with SWR
import useSWR from 'swr';
import { supabase } from '@/utils/supabase/client';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PostsList() {
const { data, error } = useSWR('/api/posts?status=published&limit=20', fetcher);

if (error) return <p>Failed to load.</p>;
if (!data) return <p>Loading…</p>;

return (
<ul>
{data.posts.map((p: any) => (
<li key={p.id}>
<a href={`/posts/${p.slug}`}>{p.title}</a>
</li>
))}
</ul>
);
}
Because the client is only used for client‑side reads, no auth token handling is needed for public posts. Private endpoints (create / edit) will call the same /api/posts route using fetch with credentials: 'include' so the server can read the auth cookie.

8. Testing Strategy

Test Type Tool Example
Unit jest + ts-jest Validate postSchema.parse(...) and sanitizeHtml.
Integration next-test-api-route-handler (or supertest) Spin up the route handler in node, mock Supabase client using @supabase/supabase-js’s createClient with a service role key (only in CI).
E2E cypress or playwright Run the full stack on a preview deployment (Vercel preview) and assert that a logged‑in user can create a post and that the HTML is rendered safely. 9. CI / Lint / Formatting

# .github/workflows/ci.yml

name: CI
on: [push, pull_request]
jobs:
lint-test:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v3 - name: Setup Node
uses: actions/setup-node@v3
with:
node-version: '20' - run: npm ci - run: npm run lint # eslint + prettier - run: npm run test # jest
Add eslint with @next/eslint-plugin-next and prettier for code style consistency.

10. Deployment (Vercel)

Connect the repo to Vercel.
In Project Settings → Environment Variables, add the same three vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY).
Vercel automatically builds the Next.js app (npm run build).
Because all Supabase calls happen on the server side, no additional server is required. 11. Security Checklist

Checklist item How it’s handled
Authentication Cookie‑based JWT, refreshed by middleware (updateSession).
Authorization Row‑Level Security policies enforce author‑only writes; API also checks user.id.
Input validation Zod schemas (postSchema).
HTML sanitisation DOMPurify (sanitizeHtml).
CSRF Cookies are httpOnly by Supabase; using fetch(..., { credentials: 'include' }) automatically sends them – no additional CSRF token needed.
Rate limiting Can be added via Vercel Edge Middleware or Supabase’s built‑in request limits.
Logging Use Supabase’s logging dashboard or add console.error in catch blocks for server‑side debugging (never expose raw DB errors to the client). 12. Full Directory Layout (suggested)

/app
├─ /api
│ └─ /posts
│ └─ route.ts ← CRUD handler
├─ /login
│ ├─ page.tsx
│ └─ actions.ts
├─ /posts
│ ├─ page.tsx ← list
│ └─ [slug]/page.tsx ← single post view
└─ layout.tsx
/utils
├─ supabase
│ ├─ client.ts
│ ├─ server.ts
│ └─ middleware.ts
├─ validation.ts
└─ database.types.ts
/public
└─ …
TL;DR – Checklist to copy & paste into a new repo

Create Supabase project → get URL + anon key.
Run the SQL above (posts table + RLS).
npx create-next-app@latest my‑blog --ts --tailwind (or use the with-supabase template).
Add env vars (.env.local).
Install packages
npm i @supabase/ssr @supabase/supabase-js zod isomorphic-dompurify
npm i -D eslint prettier jest ts-jest supertest
Add client/server utilities (utils/supabase/\*).
Add middleware (middleware.ts).
Create app/api/posts/route.ts (the full code block above).
Generate DB types (npx supabase gen types … > utils/database.types.ts).
Write UI components (list, editor, detail).
Set up lint / test scripts and CI.
Deploy to Vercel – add the three env vars.
Follow the detailed sections above for each step and you’ll have a production‑ready Next.js API backed by Supabase that stores rich HTML posts, enforces security, and is fully typed. Happy coding!

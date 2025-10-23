# Changes Summary

## Overview

Refactored the Posts Editor with the following improvements:

1. Removed the main page header and navigation
2. Removed the CSS tab editor (now using Tailwind CSS CDN)
3. Made the right sidebar light-themed
4. Added visible Update/Delete buttons when a post is selected
5. Separated JavaScript and HTML content into distinct database fields
6. Implemented Tailwind CSS support for HTML preview

## Detailed Changes

### 1. Frontend Changes (`src/app/posts/page.tsx`)

#### Header Removal

- Removed the sticky header with "Posts Editor" title and navigation links
- The layout now starts directly with the three-panel editor

#### CSS Tab Removal

- Removed the CSS TabsTrigger and TabsContent
- Posts no longer need separate CSS configuration
- All styling now uses Tailwind CSS via CDN in the iframe preview

#### Right Sidebar Theme Update

- Changed background from `bg-neutral-950` (dark) to `bg-white` (light)
- Updated text colors from `text-neutral-50` to `text-neutral-900`
- Changed input styling:
    - Border: `border-neutral-700` → `border-neutral-300`
    - Background: `bg-neutral-900` → `bg-neutral-50`
    - Text: `text-neutral-50` → `text-neutral-900`
    - Placeholder: `text-neutral-600` → `text-neutral-400`
- Updated error message styling with red colors instead of neutral dark

#### Action Buttons

- Added Update/Delete buttons at the bottom of the form (in a sticky section)
- Buttons are only visible when `editingPost` is not null
- Delete button is red (`bg-red-600`) with confirmation dialog
- Update/Create button is dark (`bg-neutral-900`)

#### Form State Updates

- Removed `css` from form state (was `{ html, css, js }`, now `{ html, js }`)
- All form data now directly maps to database fields

#### Preview HTML Generation

- Updated iframe preview to include Tailwind CSS CDN:
    ```html
    <script src="https://cdn.tailwindcss.com"></script>
    ```
- Removed the inline `<style>${formData.css}</style>` section

### 2. Database Schema Changes (`src/utils/database.types.ts`)

Added `js_content` field to Post entity:

- **Row type**: `js_content: string`
- **Insert type**: `js_content?: string`
- **Update type**: `js_content?: string`

### 3. Validation Schema (`src/utils/validation.ts`)

Updated `postSchema`:

- Added `js_content: z.string().optional().default('')`
- Now accepts separate HTML and JS content fields

### 4. API Route (`src/app/api/posts/route.ts`)

No changes needed - already handles the new field through the spread operator

### 5. Database Migration (`supabase/migrations/20241023_add_js_content.sql`)

Created migration file to:

- Add `js_content` column to `posts` table (TEXT, DEFAULT '')
- Create index on `status` column for query performance

## Migration Steps

1. **Apply Database Migration:**
    - Use Supabase CLI: `supabase migration up`
    - Or execute the SQL in Supabase Dashboard

2. **Deploy Frontend:**
    - Build and deploy the Next.js application
    - The app now expects separate `js_content` field

3. **Data Migration (if needed):**
    - Existing posts with combined HTML+CSS+JS need to be parsed
    - For new posts, just use separate fields directly

## Form Structure

### Before (with CSS):

```
- HTML Tab
- CSS Tab
- JS Tab
```

### After (without CSS):

```
- HTML Tab
- JS Tab
```

## Sidebar Colors

### Before (Dark Theme):

- Background: `bg-neutral-950` (nearly black)
- Text: `text-neutral-50` (white)
- Inputs: Dark backgrounds with light text

### After (Light Theme):

- Background: `bg-white`
- Text: `text-neutral-900` (dark)
- Inputs: Light backgrounds with dark text
- Accents: Red for delete, dark for primary actions

## Tailwind CSS Support

The iframe preview now:

- Loads Tailwind CSS from CDN automatically
- No longer needs separate CSS field
- Can use any Tailwind utility classes in the HTML
- Posts can be styled purely with Tailwind classes

Example HTML post:

```html
<div class="rounded-lg bg-blue-500 p-4 text-white">
    <h1 class="text-2xl font-bold">Hello World</h1>
</div>
```

## Backward Compatibility

Old posts that have HTML+CSS+JS combined in `html_content` will still load but won't display CSS properly. Consider migrating them by:

1. Parsing the combined content
2. Extracting HTML to `html_content`
3. Extracting JS to `js_content`

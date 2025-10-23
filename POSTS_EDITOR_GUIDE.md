# Posts Editor - Implementation Guide

## ✅ Completed Changes

### 1. **No More Main Header**

- The page header with "Posts Editor" title and navigation has been removed
- The editor layout now starts directly with the three-column interface

### 2. **CSS Tab Removed**

- The CSS editing tab has been removed from the editor
- All styling now uses **Tailwind CSS** automatically loaded via CDN in the preview
- Users can use Tailwind utility classes in their HTML

### 3. **Light Right Sidebar**

- The right sidebar (form panel) is now light-themed
- White background with dark text
- Light input fields for better visibility
- Red delete button for destructive actions

### 4. **Update/Delete Buttons Visible**

- When you select a post from the left sidebar, the Update and Delete buttons appear
- Located at the bottom of the form in a sticky section
- Update button: Save changes to the selected post
- Delete button: Permanently remove the post (with confirmation)
- Buttons only show when editing an existing post

### 5. **Separate HTML and JS Fields**

- HTML content and JavaScript are now stored separately in the database
- `html_content` - stores HTML markup
- `js_content` - stores JavaScript code
- This allows better organization and prevents styling conflicts

### 6. **Tailwind CSS Preview**

- The live preview now automatically loads Tailwind CSS from CDN
- You can use any Tailwind utility classes in your HTML
- Example: `<div class="bg-blue-500 text-white p-4">Hello</div>`

## 🔧 Next Steps

### Apply Database Migration

You need to add the `js_content` column to your Supabase database:

**Option 1: Using Supabase Dashboard**

1. Go to your Supabase project
2. Click on "SQL Editor"
3. Run this SQL:

```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS js_content TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
```

**Option 2: Using Supabase CLI**

```bash
supabase migration up
```

### How to Use the Editor

1. **Create New Post:**
    - Click in the form area (right sidebar)
    - Fill in Title and Slug
    - Enter HTML in the HTML editor
    - Enter JavaScript in the JS editor (optional)
    - Select a status (Draft/Published/Archived)
    - Click "Create Post"

2. **Edit Existing Post:**
    - Click a post in the left sidebar
    - The form will populate with the post data
    - Update/Delete buttons will appear
    - Make changes and click "Update Post"

3. **Preview:**
    - The bottom right shows a live preview
    - Updates as you type
    - All Tailwind CSS classes are available

## 📝 Example Post

### HTML Content:

```html
<div class="mx-auto max-w-2xl p-6">
    <h1 class="mb-4 text-4xl font-bold text-blue-600">My Great Post</h1>
    <p class="mb-4 text-gray-700">This is a paragraph using Tailwind styles.</p>
    <button class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">Click Me</button>
</div>
```

### JavaScript Content (optional):

```javascript
document.querySelector('button').addEventListener('click', function () {
    alert('Button clicked!');
});
```

## 🎨 Styling Tips

Since CSS is no longer editable, use Tailwind CSS classes:

- **Colors**: `bg-blue-500`, `text-red-600`, etc.
- **Spacing**: `p-4`, `m-2`, `px-6`, etc.
- **Typography**: `text-xl`, `font-bold`, `text-center`, etc.
- **Layout**: `flex`, `grid`, `max-w-2xl`, etc.

See [Tailwind CSS documentation](https://tailwindcss.com/) for all available classes.

## 📦 File Changes

### Modified Files:

- `src/app/posts/page.tsx` - Main editor component
- `src/utils/database.types.ts` - TypeScript types
- `src/utils/validation.ts` - Zod validation schema

### New Files:

- `supabase/migrations/20241023_add_js_content.sql` - Database migration
- `CHANGELOG_POSTS_EDITOR.md` - Detailed change log

## 🐛 Troubleshooting

**Q: My posts don't have JavaScript**
A: Check the `js_content` column exists in your database. Run the migration.

**Q: Tailwind CSS doesn't work in preview**
A: The CDN is loaded automatically. Make sure your HTML uses valid Tailwind class names.

**Q: Update/Delete buttons don't appear**
A: Click on a post in the left sidebar first to select it for editing.

**Q: Old posts show no styling**
A: Old posts may have CSS in the combined html_content. They still work but won't show the original CSS styling.

---

For more details, see `CHANGELOG_POSTS_EDITOR.md`

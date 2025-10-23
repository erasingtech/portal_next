# Posts Editor - Resizable Panels Update

## Changes Made

### 1. **Returned Tabs for Single Editor View**

- HTML and JS tabs are back in the editor panel
- Only one editor visible at a time
- Proper shadcn Tab styling with grid layout (2 columns)
- Users can switch between HTML/JS using tabs

### 2. **Preview Moved to the Right**

- Preview is now on the right side of the editor (not below)
- Split horizontally: Editor (60%) | Preview (40%)
- Both visible and editable simultaneously
- The split can be resized using the handle between them

### 3. **Fully Resizable Panels**

All three main sections are now resizable and collapsible:

**Left Sidebar (Posts List)**

- Default: 20% of screen width
- Min: 15%, Max: 40%
- **Collapsible**: Can be collapsed to hide post list
- Posts list, "+ New" button

**Center Panel (Editor + Preview)**

- Default: 50% of screen width
- Min: 30% of screen width
- Contains internal horizontal split:
    - **Editor**: 60% (HTML/JS tabs)
    - **Preview**: 40% (Live preview iframe)
- **Both sections are independently resizable**
- Can collapse preview to focus on editing

**Right Sidebar (Form Controls)**

- Default: 30% of screen width
- Min: 20%, Max: 50%
- **Collapsible**: Can be collapsed to hide form
- Title, Excerpt, Status inputs
- Create/Update/Delete buttons

### 4. **Resize Handles**

- Visual drag handles appear between all resizable sections
- Users can click and drag to resize any panel
- Smooth, responsive resizing with `react-resizable-panels`
- Double-click handles to collapse/expand panels

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                        HEADER                            │
├───────────┬─────────────────────────────────┬───────────┤
│           │                                 │           │
│  POSTS    │  EDITOR         │    PREVIEW    │   FORM    │
│  LIST     │  [HTML/JS Tabs] │               │  CONTROLS │
│           │                 │               │           │
│ [+New]    │  [Resizable ↔]  │  [Resizable ↔]│           │
│           │   (60%)         │   (40%)       │           │
│ Posts:    │                 │               │ Title:    │
│ • Post 1  │ [textarea]      │  [PREVIEW]    │ [input]   │
│ • Post 2  │                 │               │           │
│ • Post 3  │                 │               │ Excerpt:  │
│           │                 │               │ [textarea]│
│           │                 │               │           │
│           │                 │               │ Status:   │
│ [Collap↔] │   [Collap↔]     │   [Collap↔]   │ [select]  │
│ 20%       │      50%        │      50%      │  [Collap↔]│
│           │                 │               │    30%    │
│ collapse→ │ collapse→       │ collapse→     │collapse→  │
│           │                 │               │           │
└───────────┴─────────────────────────────────┴───────────┘
```

## Features

### Resizable

- Drag the white handles (╱) between panels to resize
- Each panel has minimum and maximum sizes
- Smooth animations and responsive updates

### Collapsible

- Left Sidebar: Can collapse to full width editor view
- Right Sidebar: Can collapse to focus on coding
- Preview: Can collapse to focus on editing
- Double-click handle or single click collapse button

### Tabs

- Switch between HTML and JS editors using tab buttons
- Only one editor visible at a time (saves space)
- Proper shadcn styling

### Live Preview

- Always visible on the right side
- Updates in real-time as you code
- Includes Tailwind CSS via CDN
- Can be resized or collapsed

## Usage

1. **Resize**: Click and drag any white handle (╱) to adjust panel sizes
2. **Collapse**: Double-click a handle to collapse that panel
3. **Expand**: Double-click again or drag to expand
4. **Edit**: Switch between HTML/JS tabs in the center editor
5. **Preview**: See live results on the right side in real-time

## Technical Details

- Uses `react-resizable-panels` library (already installed)
- ResizablePanelGroup: Horizontal outer layout
- ResizablePanel: All three main sections with collapsible support
- ResizableHandle: Visual handles with `withHandle` prop for grip icon
- TabsList/TabsTrigger: Proper shadcn tabs implementation

## Responsive Behavior

All panels maintain their size ratios when the window is resized, and each panel respects its min/max constraints to ensure usability.

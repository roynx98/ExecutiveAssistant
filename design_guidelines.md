# Design Guidelines: AI Executive Assistant App

## Design Approach

**System-Based Approach** inspired by **Linear** and **Notion**

This productivity tool demands clarity, efficiency, and information density. The design draws from Linear's precision and Notion's flexibility, prioritizing:
- Immediate comprehension of complex data
- Minimal cognitive load for daily repeated tasks
- Professional, focused aesthetic for business context
- Fast, keyboard-friendly interactions

---

## Color Palette

### Dark Mode (Primary)
**Background Layers:**
- Base: 222 15% 8%
- Surface: 222 13% 11%
- Surface Elevated: 222 12% 14%
- Border: 222 10% 20%

**Brand & Accent:**
- Primary: 250 80% 60% (vibrant blue for CTAs, active states)
- Primary Hover: 250 80% 65%
- Success: 142 70% 50% (green for completed tasks, positive states)
- Warning: 38 92% 55% (amber for urgent items, deadlines)
- Danger: 0 72% 55% (red for declined, errors)

**Text Hierarchy:**
- Primary Text: 222 5% 95%
- Secondary Text: 222 5% 65%
- Tertiary Text: 222 5% 45%
- Muted: 222 5% 35%

### Light Mode (Secondary)
**Background Layers:**
- Base: 0 0% 100%
- Surface: 222 15% 98%
- Surface Elevated: 222 20% 96%
- Border: 222 10% 88%

**Text Hierarchy:**
- Primary Text: 222 15% 10%
- Secondary Text: 222 10% 35%
- Tertiary Text: 222 8% 50%

---

## Typography

**Font Family:**
- Primary: 'Inter', system-ui, sans-serif (Google Fonts)
- Monospace: 'JetBrains Mono', monospace (for email IDs, technical data)

**Scale & Weights:**
- Hero/Page Titles: text-3xl font-semibold (30px, 600)
- Section Headers: text-xl font-semibold (20px, 600)
- Card Titles: text-base font-medium (16px, 500)
- Body Text: text-sm font-normal (14px, 400)
- Metadata/Labels: text-xs font-medium (12px, 500) uppercase tracking-wide
- Small Print: text-xs font-normal (12px, 400)

**Line Heights:**
- Headings: leading-tight
- Body: leading-relaxed
- Compact Lists: leading-snug

---

## Layout System

**Tailwind Spacing Primitives:** Use 2, 4, 6, 8, 12, 16, 20, 24, 32 units

**Container Strategy:**
- Full App: max-w-[1600px] mx-auto
- Main Content: px-6 lg:px-8
- Sidebar Width: w-64 (256px) fixed
- Component Spacing: space-y-6 for vertical, gap-4 for grid/flex

**Grid Patterns:**
- Dashboard Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Data Tables: Full width with horizontal scroll on mobile
- Split Views: grid-cols-1 lg:grid-cols-[2fr_1fr] for main content + sidebar

**Vertical Rhythm:**
- Page Padding: py-6 lg:py-8
- Section Margins: mb-8
- Card Padding: p-6
- Tight Sections: p-4

---

## Component Library

### Navigation
**Top Bar:** Sticky, h-16, dark surface, logo left, search center, user menu right, notification bell
**Sidebar:** Fixed left, collapsible on mobile, icon + label nav items with active states (primary color background)

### Dashboard Cards
**Brief Card:** Surface elevated background, p-6, rounded-lg border, shadow-sm
- Card Header: flex justify-between items-center mb-4
- Quick Actions: Inline icon buttons with tooltips
- Status Badges: Pill shapes, colored backgrounds (success/warning/muted)

### Email Components
**Thread List:** Compact rows with sender avatar (h-8 w-8), subject line (truncate), timestamp, labels, priority indicator
**Draft Panel:** Full-height sidebar with textarea, formatting toolbar, tone selector dropdown, send/save buttons
**Labels:** Small rounded pills with colored dot + text, hover to show full name

### Calendar Views
**Time Blocks:** Visual grid with hour markers, color-coded events, drag handles, conflict warnings (warning color)
**Meeting Windows:** Toggle switches with time range pickers
**Buffer Settings:** Slider inputs with minute labels

### CRM Displays
**Pipeline Kanban:** Horizontal scrolling columns, draggable deal cards with value, stage, and next action
**Deal Cards:** Compact with company name (bold), value (large), stage badge, last contact timestamp
**Stale Deal Alert:** Warning background with exclamation icon

### Data Tables
**Sortable Headers:** Hover underline, sort indicator arrows
**Row Actions:** Revealed on hover - icon buttons for edit, delete, view details
**Pagination:** Centered, with page numbers and prev/next

### Forms & Inputs
**Text Fields:** Dark surface, border on focus (primary color), labels above, helper text below in muted
**Dropdowns:** Custom styled with chevron icon, scrollable list with hover states
**Checkboxes/Toggles:** Primary color when active, smooth transitions
**Date Pickers:** Calendar popup with range selection support

### Buttons
**Primary CTA:** bg-primary text-white, px-4 py-2, rounded-md, hover brightness increase
**Secondary:** border border-border bg-transparent, hover bg-surface-elevated
**Icon Buttons:** p-2 rounded hover:bg-surface-elevated
**Danger:** bg-danger text-white for destructive actions

### Modals & Overlays
**Modal:** Centered, max-w-2xl, dark surface elevated, backdrop blur-sm
**Slide-Overs:** Fixed right, h-full, w-[480px], for detailed views and quick edits
**Toasts:** Fixed top-right, auto-dismiss, colored left border for type (success/warning/danger)

### Empty States
**Illustrations:** Simple line icons (Heroicons) in muted color, centered with descriptive text and CTA button below

### Loading States
**Skeleton Loaders:** animate-pulse backgrounds matching card structure
**Spinners:** Only for critical full-page loads, primary color

---

## Animations

**Minimal & Purposeful:**
- Page Transitions: None (instant navigation)
- Hover States: Scale 1.02 or brightness increase, duration-150
- Modal Entry: Fade in + scale from 0.95, duration-200
- Toast Slide: Slide from right, duration-300
- NO scroll-triggered animations
- NO parallax effects

---

## Iconography

**Library:** Heroicons (outline for navigation, solid for actions) via CDN
**Size Standards:** h-5 w-5 for inline, h-6 w-6 for buttons, h-4 w-4 for labels
**Color:** Inherit text color, use text-muted for secondary icons

---

## Key Page Layouts

**Home (Morning Brief):** 
- Hero section: Date, greeting, 3-column metric cards (meetings today, priority emails, tasks due)
- Below: Calendar mini-view (left 2/3), CRM snapshot (right 1/3)
- Bottom: Quick action tiles for common workflows

**Comms:**
- Split view: Thread list (left 1/3), thread detail + draft panel (right 2/3)
- Filters bar above list with label chips

**Calendar:**
- Week view default, time grid with color-coded blocks
- Right sidebar: Buffer settings, meeting windows, quick add event form

**Settings:**
- Vertical tab navigation (left), content panels (right)
- Each integration shown as connected/disconnected card with setup CTA

---

## Responsive Strategy

- **Desktop First:** Optimize for 1440px+ primary use case
- **Tablet (768px-1023px):** Collapse sidebar to icons only, stack split views
- **Mobile (<768px):** Bottom tab navigation, full-width cards, simplified tables to list view

---

This design system ensures clarity, speed, and professional polish for daily executive assistant workflows.
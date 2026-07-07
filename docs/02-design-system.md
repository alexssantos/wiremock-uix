# 02. Design System — WireMock Studio Open Source

## Goal

This document defines the design system for **WireMock Studio Open Source**, a web interface focused on operating, inspecting, and maintaining a WireMock server through the administrative API. The visual system should balance **information density**, **operational clarity**, and **speed of use**, serving a primarily technical audience.

---

## 1. Design philosophy

### 1.1 Visual principles

The product should follow a **developer tool** aesthetic, inspired by tools such as **Postman**, **Insomnia**, **Linear**, **Raycast**, and modern administrative consoles:

- **Minimalist without feeling empty**: low visual noise with high readability.
- **Information-dense**: tables, badges, filters, cards, and editors should coexist without feeling cluttered.
- **Operational prioritization**: the design favors real user tasks such as locating requests, adjusting stubs, identifying near misses, and debugging scenarios.
- **Instant feedback**: every important action should produce an immediate visible response.
- **Strong hierarchy**: headers, filters, tables, editors, and side panels must have clear contrast and separation.
- **Technical yet accessible**: clean typography, consistent spacing, and semantic colors should avoid an excessively raw appearance.

### 1.2 Formal guidelines

- Soft borders with a moderate radius.
- Subtle shadows; prioritize separation through borders and contrast.
- Heavy use of **badges**, **tabs**, **compact cards**, and **side panels**.
- JSON, diffs, and payloads should always use a monospace font.
- Color should carry meaning, but never be the only source of meaning.

---

## 2. Color tokens

The project should adopt the CSS variable pattern compatible with **shadcn/ui**, using **HSL** values to support variations and consistent theming.

### 2.1 Light theme

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;

  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;

  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;

  --primary: 221 83% 53%;
  --primary-foreground: 210 40% 98%;

  --secondary: 210 40% 96%;
  --secondary-foreground: 222 47% 11%;

  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;

  --accent: 214 95% 93%;
  --accent-foreground: 221 83% 30%;

  --destructive: 0 84% 60%;
  --destructive-foreground: 210 40% 98%;

  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 221 83% 53%;

  --radius: 0.75rem;

  --chart-1: 221 83% 53%;
  --chart-2: 142 71% 45%;
  --chart-3: 32 95% 44%;
  --chart-4: 271 81% 56%;
  --chart-5: 0 84% 60%;
}
```

### 2.2 Dark theme

```css
.dark {
  --background: 222 47% 8%;
  --foreground: 210 40% 98%;

  --card: 222 47% 10%;
  --card-foreground: 210 40% 98%;

  --popover: 222 47% 10%;
  --popover-foreground: 210 40% 98%;

  --primary: 217 91% 60%;
  --primary-foreground: 222 47% 11%;

  --secondary: 217 33% 17%;
  --secondary-foreground: 210 40% 98%;

  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;

  --accent: 217 33% 20%;
  --accent-foreground: 210 40% 98%;

  --destructive: 0 63% 45%;
  --destructive-foreground: 210 40% 98%;

  --border: 217 33% 20%;
  --input: 217 33% 20%;
  --ring: 224 76% 58%;

  --chart-1: 217 91% 60%;
  --chart-2: 142 70% 45%;
  --chart-3: 35 92% 50%;
  --chart-4: 271 81% 66%;
  --chart-5: 0 72% 58%;
}
```

### 2.3 Surfaces and levels

To maintain readability on dense screens, it is recommended to work with three surface levels:

- **Level 0 — background**: the main application background.
- **Level 1 — card/popover**: cards, modals, drawers, tables.
- **Level 2 — muted/secondary**: filters, grouped areas, internal headers, supporting panels.

### 2.4 Domain semantic colors

#### HTTP methods

| Method | Suggested color | HSL | Usage |
|---|---|---|---|
| GET | Blue | `214 100% 58%` | Read/query |
| POST | Green | `142 71% 45%` | Creation |
| PUT | Orange | `32 95% 44%` | Full update |
| PATCH | Purple | `271 81% 56%` | Partial update |
| DELETE | Red | `0 84% 60%` | Destructive action |
| ANY / ALL | Neutral gray | `215 16% 47%` | Generic match |

#### Status code ranges

| Range | Suggested color | HSL | Usage |
|---|---|---|---|
| 2xx | Green | `142 71% 45%` | Success |
| 3xx | Blue | `214 100% 58%` | Redirection |
| 4xx | Yellow/Amber | `45 93% 47%` | Client error |
| 5xx | Red | `0 84% 60%` | Server error |
| N/A | Gray | `215 16% 47%` | No response/undefined |

#### Additional operational states

| State | Color |
|---|---|
| Server online | Green |
| Server degraded | Yellow |
| Server offline | Red |
| Recording active | Red with subtle pulsing highlight |
| Scenario STARTED | Blue |
| Unsaved changes | Orange |

---

## 3. Typography

### 3.1 Fonts

- **Primary UI font**: `Inter`, with fallback `system-ui`, `Segoe UI`, `sans-serif`
- **Monospace font**: `JetBrains Mono`, with fallback `Fira Code`, `Consolas`, `monospace`

### 3.2 Usage by context

- **Inter**: navigation, headings, labels, tables, forms, tooltips, and cards.
- **JetBrains Mono**: JSON, request/response bodies, headers, diffs, technical logs, snippets, and IDs.

### 3.3 Recommended type scale

| Token | Size | Weight | Usage |
|---|---:|---:|---|
| `text-xs` | 12px | 500 | metadata, badges, help text |
| `text-sm` | 14px | 400–500 | standard text, tables, inputs |
| `text-base` | 16px | 400–600 | primary content |
| `text-lg` | 18px | 600 | section titles |
| `text-xl` | 20px | 600 | page title |
| `text-2xl` | 24px | 700 | exceptional emphasis |

### 3.4 Typography rules

- Compact but comfortable line height: `1.4` to `1.6`.
- Technical text should never depend on full uppercase.
- In tables, prioritize `text-sm`.
- In payloads and JSON, use `text-xs` or `text-sm` with `leading-relaxed`.

---

## 4. Spacing, grid, and density

### 4.1 Base system

The spacing system should follow a **4px** grid, with a primary rhythm based on **8px**:

- 4px: micro-adjustments
- 8px: minimum internal spacing
- 12px: small groupings
- 16px: standard spacing between elements
- 24px: separation between blocks
- 32px: breathing room between major sections

### 4.2 Layout grid

- **Header**: height between `56px` and `64px`
- **Desktop sidebar**: width between `240px` and `280px`
- **Collapsed sidebar**: `72px`
- **Content container**: padding `24px` on desktop, `16px` on tablet, `12px` on mobile
- **Metric cards**: responsive grid with 2, 4, or 8 columns depending on viewport

### 4.3 Recommended density by context

| Context | Density |
|---|---|
| Dashboard | Medium |
| Operational tables | Medium/high |
| Stub wizard | Medium |
| JSON editor | High |
| Settings | Medium/low |
| Logs/Requests | High |

---

## 5. Required shadcn/ui components

### 5.1 Core components

| Component | Project usage |
|---|---|
| `Button` | Primary, secondary, ghost, outline, and destructive actions throughout the application |
| `Input` | Global search, filters, simple fields, and configuration inputs |
| `Select` | HTTP method, status, pagination, filters, and enumerated settings |
| `Dialog` | Import/export, confirmations with rich context, quick creation |
| `Sheet / Drawer` | Request details, side editor, contextual viewing without changing pages |
| `Tabs` | Stub wizard, structured content switching, panel details |
| `Table` | Simple listings, query grids, and comparison structures |
| `Badge` | HTTP method, status code, tags, scenario state, matched/unmatched |
| `Card` | Metrics, dashboard blocks, content grouping |
| `Tooltip` | Short explanations, compact actions, and icon-only controls |
| `DropdownMenu` | Row actions: edit, duplicate, export, delete |
| `Popover` | Quick filters, contextual help, compact details |
| `Accordion` | Advanced sections in dense forms |
| `Switch` | Boolean flags such as persistence, request journal, recording mode |
| `Checkbox` | Bulk selection, multi-select filters, capture options |
| `RadioGroup` | Mutually exclusive choices with a small number of options |
| `Separator` | Separation between blocks in cards, menus, drawers, and forms |
| `Skeleton` | Loading states that preserve layout |
| `Alert` | Non-blocking warnings: server unavailable, read-only mode |
| `AlertDialog` | Confirmation for reset, deletion, discarding changes |
| `ScrollArea` | Long side panels, file tree, payload body |
| `Breadcrumb` | Contextual navigation on deep pages and in the file explorer |

### 5.2 Advanced components

| Component | Project usage |
|---|---|
| `DataTable` with TanStack Table | Primary tables with sorting, filters, pagination, selection, and custom columns |
| `Toast / Sonner` | Global feedback for success, error, undo, and asynchronous events |
| `Command` (`cmdk`) | Global search and quick actions via `Cmd/Ctrl+K` |
| `Resizable panels` | Files screen, diff viewer, and list + detail combinations |

### 5.3 Usage recommendations

- Critical tables should use **TanStack Table** instead of a static table.
- Every destructive modal must be an `AlertDialog`, not a regular `Dialog`.
- Inspection panels should prefer `Sheet` to preserve the original screen context.

---

## 6. Custom components

### 6.1 `HttpMethodBadge`

Compact badge for HTTP methods with semantic color and filled or subtle variants.

**Uses**:
- Stub Mappings
- Requests
- Near Misses
- Logs

### 6.2 `StatusCodeBadge`

Badge for a status code or semantic range, with fallback for undefined state.

**Uses**:
- Requests
- Response preview
- Logs
- Dashboard

### 6.3 `JsonEditor`

Wrapper around **Monaco Editor** with support for:

- syntax highlighting
- auto-formatting
- read/write mode
- JSON validation
- optional diff mode
- theme synchronized with light/dark

### 6.4 `DiffViewer`

Component for side-by-side comparison between the expected request and the received request, highlighting differences in:

- URL
- method
- headers
- query params
- body

### 6.5 `MetadataEditor`

Editor oriented around key/value pairs and tag chips for:

- tags
- scenario
- description
- custom metadata
- persistence flags

### 6.6 `EmptyState`

Standardized component with:

- icon
- title
- short description
- primary CTA
- optional secondary CTA

### 6.7 `PageHeader`

Consistent page header with:

- title
- description
- optional breadcrumbs
- actions block
- contextual indicators

---

## 7. Recommended Lucide icons

| Context | Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Stub Mappings | `Webhook` |
| Requests | `Activity` |
| Near Misses | `ScanSearch` |
| Scenarios | `GitBranch` |
| Recording | `Radio` |
| Settings | `Settings` |
| Files | `FolderOpen` |
| Logs | `ScrollText` |
| Global search | `Search` |
| Server status | `Server` |
| Theme | `MoonStar` / `Sun` |
| User | `CircleUserRound` |
| New stub | `Plus` |
| Edit | `Pencil` |
| Duplicate | `Copy` |
| Export | `Download` |
| Import | `Upload` |
| Delete | `Trash2` |
| Replay request | `RotateCcw` |
| Generate stub | `WandSparkles` |
| Snapshot | `Camera` |
| Real-time logs | `Clock3` |
| Error | `TriangleAlert` |
| Success | `CircleCheckBig` |
| Empty | `Inbox` |

---

## 8. Accessibility (a11y)

### 8.1 Minimum requirements

- Minimum **WCAG AA** contrast for text, borders, and interactive elements.
- All controls must be keyboard accessible.
- Visible focus states using a `ring` consistent with the theme.
- Labels and `aria-label` required on icon buttons.
- `aria-live` for toasts and critical feedback.
- Semantic structure with `header`, `nav`, `main`, `aside`, `section`, `table`, `form`.

### 8.2 Specific rules

- Do not rely on color alone to indicate matched/unmatched, 2xx/4xx, or online/offline.
- Tabs must follow the ARIA roving tab index pattern.
- Drawers and dialogs must trap focus while open.
- Monaco and technical viewers must offer a clear textual reading alternative.
- Global search must indicate the keyboard shortcut and provide an accessible empty state.

---

## 9. Responsiveness

### 9.1 Recommended breakpoints

| Breakpoint | Range | Behavior |
|---|---|---|
| `sm` | `>= 640px` | Basic grid and spacing adjustment |
| `md` | `>= 768px` | Transition to tablet layout |
| `lg` | `>= 1024px` | Primary desktop layout |
| `xl` | `>= 1280px` | Better use of tables and dashboards |
| `2xl` | `>= 1536px` | Wide tables, spacious diffs, comfortable editors |

### 9.2 Device behavior

#### Mobile

- Sidebar becomes an overlay drawer.
- Header keeps search, menu, status, and theme in a compact version.
- Large tables use horizontal scroll or responsive cards when appropriate.
- Drawers may take the full width.

#### Tablet

- Sidebar may start collapsed.
- Dashboard reorganizes metrics into 2 columns.
- Charts should prioritize readability over simultaneous quantity.

#### Desktop

- Fixed sidebar.
- Lists and details can coexist in split view.
- Technical screens such as Files, Requests, and Near Misses benefit from resizable panels.

---

## 10. Screen-specific application guidelines

### Dashboard

- Compact cards with quick readability.
- Charts inside cards with title, legend, and period.

### Stub Mappings

- Dense table focused on productivity.
- Wizard with clear tabs and persistent preview when possible.

### Requests / Near Misses / Logs

- Compact typography.
- Persistent filters.
- Strong semantic highlighting.

### Scenarios

- Clean, neutral background.
- Nodes with state badges and clearly visible connectors.

### Files

- Lightweight IDE-style layout.
- Monospace dominant in the editing area.

---

## 11. Implementation recommendations

- Centralize tokens in `globals.css` via Tailwind CSS v4's CSS-first configuration (`@theme inline`); this project does **not** use a `tailwind.config.js` file.
- Expose additional tokens for HTTP methods and status codes.
- Define variants with `class-variance-authority` for badges and contextual buttons.
- Ensure synchronization between the app theme and the Monaco Editor theme.
- Standardize `loading`, `empty`, `error`, and `success` states across all modules.

---

## 12. Expected result

The design system should allow the application to be:

- visually consistent
- quick to operate
- scalable across new screens
- suitable for design-to-development handoff
- robust enough to evolve from an open source dashboard into an advanced administration platform

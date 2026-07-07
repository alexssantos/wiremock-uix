# 10. UX/UI Guide — WireMock Studio Open Source

## Goal

This guide consolidates principles, interaction patterns, required states, and review criteria so that the **WireMock Studio Open Source** interface can be implemented consistently, predictably, and ready for Figma handoff or direct execution by a development team.

---

## 1. UX principles

### 1.1 Immediate feedback

Every user action should produce noticeable feedback:

- button clicks trigger a loading or success state
- saving displays a toast and visual update
- errors show a clear, contextual message
- long asynchronous processes show progress, polling, or a transitional state

### 1.2 Error prevention

The product should help users avoid failures before they happen:

- inline validation in forms
- safe defaults for destructive actions
- explicit confirmation for delete, reset, and discard
- JSON preview before saving critical stubs
- labels and contextual help on advanced fields

### 1.3 Consistency

The same action should look and behave the same way on every screen:

- filters always at the top or in a standardized side panel
- primary actions on the right side of the `PageHeader`
- tables with similar search, sorting, and pagination behavior
- standardized toasts for success, error, and undo
- drawers for contextual detail, dialogs for blocking decisions

### 1.4 Affordance

Elements should “look usable”:

- buttons with a clear visual hierarchy
- badges that are informative, but not mistaken for buttons when not clickable
- editable fields clearly styled as editable fields
- contextual action menus with a standardized overflow icon
- expandable areas, tabs, and graph nodes should communicate interactivity

### 1.5 Operational readability

Because the application is designed for technical use, operational clarity takes priority:

- critical information should stay above the fold whenever possible
- tabular data should support quick scanning
- large payloads should offer formatting, search, and comfortable scrolling
- semantic color should reinforce reading, not compete with it

---

## 2. Required interface states by screen

Each screen must define, at minimum, these states:

- **loading / skeleton**
- **empty state**
- **error state**
- **populated state**

### 2.1 Dashboard

#### Loading

- Skeleton for cards and chart areas
- Preserve the height of cards and blocks to avoid layout shift

#### Empty

- Display a message such as “There is not enough data yet to display metrics”
- Offer a CTA to refresh or navigate to Requests / Recording

#### Error

- Visible alert at the top of the content
- “Try again” button
- If possible, show the last timestamp with valid data

#### Populated

- Cards with summarized metrics
- Charts with legend, tooltip, and period indicator

### 2.2 Stub Mappings — Listing

#### Loading

- Filters skeleton + table with 8 to 10 simulated rows

#### Empty

- Message: “No stubs found”
- Primary CTA: “Create stub”
- Secondary CTA: “Import mappings”

#### Error

- Error banner with explanation and reload action
- If the error is connectivity-related, highlight server status

#### Populated

- Full table with pagination, filters, bulk selection, and row actions

### 2.3 Stub Mappings — Wizard

#### Loading

- Skeleton for the primary fields and editor area

#### Empty

- Does not apply in the classic sense; in creation mode, the base state is a blank form with helpful defaults

#### Error

- Inline validation errors
- API errors in a top block or persistent toast
- Invalid JSON should block saving and highlight the problem

#### Populated

- Filled fields, valid preview, and available save/cancel actions

### 2.4 Requests

#### Loading

- Table and drawer skeletons handled independently

#### Empty

- “No requests have been recorded yet”
- CTA: “Refresh”

#### Error

- Contextual warning with a reload action
- If the Request Journal is disabled, explain that clearly

#### Populated

- Table with filters and a full detail drawer

### 2.5 Near Misses

#### Loading

- List skeleton and diff viewer placeholder

#### Empty

- “No near misses found”
- Supporting text: “Unmatched requests did not produce close candidates”

#### Error

- Explain whether the analysis failed or the endpoint is unavailable

#### Populated

- List ranked by score + diff viewer synchronized with the selected item

### 2.6 Scenarios

#### Loading

- Canvas placeholder with mock nodes

#### Empty

- “No scenarios detected”
- Optional CTA: “View mappings with scenario”

#### Error

- Error state with retry
- If the structure is inconsistent, show a warning without breaking the entire canvas

#### Populated

- Navigable graph with details for the selected node

### 2.7 Recording

#### Loading

- Controls temporarily locked during start/stop
- Progress indicator or “Initializing recording...” status

#### Empty

- “No capture available”
- Explanation that recording must be started

#### Error

- Proxy, capture, or snapshot errors with actionable detail

#### Populated

- Active control panel, filled settings, and preview of captured stubs

### 2.8 Settings

#### Loading

- Skeleton per settings card

#### Empty

- Not applicable; there should always be defaults or current values

#### Error

- Message near the field whenever possible
- Toast + summary at the top in case of a general save error

#### Populated

- Complete form with unsaved-change feedback

### 2.9 Files

#### Loading

- Tree and editor skeletons

#### Empty

- “Select a file to view or edit”
- CTA: “New file”

#### Error

- Read, save, rename, or delete errors clearly associated with the item

#### Populated

- Navigable tree + editor or preview depending on the file type

### 2.10 Logs

#### Loading

- Skeleton for the filters panel and the timeline

#### Empty

- “No events found for the applied filters”
- CTA: “Clear filters”

#### Error

- Show the loading failure without clearing the selected filters

#### Populated

- Vertical timeline, side filters, incremental pagination, and export

---

## 3. Interaction patterns

### 3.1 Instant search

- Standard debounce: **300ms**
- Applies to: global search, textual table filters, file search, and log search
- While the query is being resolved, show a subtle loading indicator
- In large lists, keep search responsive without blocking the rest of the UI

### 3.2 Optimistic updates with rollback

Apply whenever the action has low ambiguity and predictable local impact:

- favorite a stub
- edit a simple description
- rename an item with later confirmation
- delete an item from a list with undo support

#### Rules

- update the UI immediately
- display a “Saving...” toast when needed
- revert local state on error
- show a failure toast with direct language

### 3.3 Success and error toasts

#### Success

- short
- direct wording
- may include an undo CTA when applicable

#### Error

- describe what failed
- avoid generic messages without context
- include a recommended action when possible

### 3.4 Confirmation for destructive actions

Use **AlertDialog** for:

- deleting a stub
- resetting mappings
- clearing the request journal
- discarding unsaved changes
- deleting a file/folder
- stopping recording when there is unpromoted capture

#### Recommended structure

- clear title
- description of impact
- explicit destructive button
- secondary “Cancel” button

### 3.5 Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + K` | Open global search / command palette |
| `Cmd/Ctrl + N` | Create new stub |
| `Esc` | Close drawer, modal, or command palette |
| `Cmd/Ctrl + S` | Save form or current file |
| `Shift + /` | Open keyboard shortcut help |
| `[` / `]` or similar | Optional tab navigation, when feasible |

### 3.6 Context persistence

Persist locally, when useful:

- theme
- recent per-screen filters
- width of resizable panels
- active wizard tab
- table sorting

---

## 4. Standard microcopy

### 4.1 Success messages

| Context | Microcopy |
|---|---|
| Stub created | `Stub created successfully.` |
| Stub updated | `Changes saved successfully.` |
| Stub deleted | `Stub removed successfully.` |
| File saved | `File saved successfully.` |
| Settings saved | `Settings updated successfully.` |
| Recording started | `Recording started.` |
| Recording paused | `Recording paused.` |
| Recording finished | `Recording finished.` |

### 4.2 Error messages

| Context | Microcopy |
|---|---|
| Generic API error | `The operation could not be completed. Please try again.` |
| Failed to save stub | `The stub could not be saved. Check the fields and try again.` |
| Invalid JSON | `The provided JSON is invalid. Fix it before continuing.` |
| Connectivity failure | `Could not connect to the WireMock server.` |
| Failed to load requests | `Could not load the requests.` |
| Failed to save file | `Could not save the file.` |
| Recording failure | `Could not start recording with the current settings.` |

### 4.3 Confirmation messages

| Context | Microcopy |
|---|---|
| Delete stub | `Do you want to delete this stub? This action cannot be undone.` |
| Clear requests | `Do you want to remove all recorded requests?` |
| Discard changes | `There are unsaved changes. Do you want to discard them?` |
| Delete file | `Do you want to delete this file? This action is permanent.` |
| Reset mappings | `Do you want to reset all loaded mappings?` |

### 4.4 Empty states

| Context | Microcopy |
|---|---|
| Mappings | `No stubs found.` |
| Requests | `No requests have been recorded yet.` |
| Near Misses | `No near misses found.` |
| Scenarios | `No scenarios available.` |
| Files | `Select a file to get started.` |
| Logs | `No events found for the applied filters.` |

### 4.5 Labels and CTAs

Prefer direct language:

- `Save`
- `Cancel`
- `Delete`
- `Duplicate`
- `Generate stub`
- `Import`
- `Export`
- `Refresh`
- `Try again`
- `Clear filters`

Avoid:

- long button phrases
- excessive jargon when a simpler alternative exists
- vague messages such as `Unexpected error`

---

## 5. Spacing grid and recommendations for Figma handoff

### 5.1 Auto Layout

All interface components should be planned in Figma with **Auto Layout**:

- horizontal for action bars and filter groups
- vertical for cards, lists, panels, and forms
- consistent padding based on the 4px/8px grid
- gap defined by component density

### 5.2 Recommended component structure

Create component variants for:

- `Button`: primary, secondary, outline, ghost, destructive, icon
- `Badge`: HTTP method, status code, neutral, warning, success, error
- `Input`: default, error, disabled, with-icon
- `Table row`: default, hover, selected, loading
- `Card`: metric, chart, form-section, empty-state
- `Toast`: success, error, warning, info
- `EmptyState`: no data, no search results, no permissions, no connection

### 5.3 Exportable tokens

The handoff should account for clearly named tokens for:

- colors
- typography
- borders
- radius
- spacing
- shadows
- z-index by layer

Grouping example:

- `color.background.default`
- `color.surface.card`
- `color.http.get`
- `color.status.success`
- `space.2`
- `space.4`
- `radius.md`
- `font.ui.body.sm`
- `font.code.body.sm`

### 5.4 Priority composite components

They should be prepared as reusable Figma blocks:

- `PageHeader`
- `FilterBar`
- `DataTable Toolbar`
- `HttpMethodBadge`
- `StatusCodeBadge`
- `JsonEditor Container`
- `DiffPanel`
- `RequestDetailDrawer`
- `FileExplorer`
- `TimelineItem`

### 5.5 Handoff annotations

Every screen delivered for implementation should document:

- responsive behavior
- loading variants
- truncation rules
- required tooltips
- keyboard navigation
- error states
- destructive interactions

---

## 6. UX review checklist before considering a screen ready

### 6.1 Clarity and hierarchy

- [ ] Is the page title clear?
- [ ] Is the primary action visible?
- [ ] Does the visual order help execute the main task?
- [ ] Does the most important information appear first?

### 6.2 States and feedback

- [ ] Is loading/skeleton defined?
- [ ] Is there an empty state with a useful CTA?
- [ ] Is there an error state with possible recovery?
- [ ] Is there success and error feedback for the main actions?

### 6.3 Forms and error prevention

- [ ] Do fields have clear labels?
- [ ] Do validations appear at the right time?
- [ ] Is there confirmation for destructive actions?
- [ ] Can the user undo critical actions when applicable?

### 6.4 Consistency

- [ ] Do buttons, badges, and tables follow the same visual patterns?
- [ ] Do filters and search behave the same way as on other screens?
- [ ] Is icon usage consistent?
- [ ] Is the microcopy aligned with the standard?

### 6.5 Accessibility

- [ ] Does contrast meet WCAG AA?
- [ ] Do all interactive elements have visible focus?
- [ ] Do icon buttons have `aria-label`?
- [ ] Has keyboard navigation been considered?

### 6.6 Responsiveness

- [ ] Does the screen work on desktop, tablet, and mobile?
- [ ] Does the sidebar have appropriate behavior on smaller screens?
- [ ] Do large tables have an overflow or adaptation strategy?
- [ ] Do editors and drawers remain usable in reduced viewports?

### 6.7 Implementability

- [ ] Can the screen be assembled using design system components?
- [ ] Have the required variants been made explicit?
- [ ] Are states defined for integration with TanStack Query?
- [ ] Is the handoff clear enough for implementation without ambiguity?

---

## 7. Expected result

A screen should only be considered ready when it:

- clearly communicates its purpose
- responds quickly to user actions
- handles success, error, and empty states consistently
- works with a guaranteed minimum level of accessibility
- can be implemented with a low degree of ambiguity

This guide should serve as an operational reference for designers, developers, and AI agents responsible for implementing the product.

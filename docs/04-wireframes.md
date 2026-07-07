# 04. Wireframes — WireMock Studio Open Source

## Goal

This document presents ASCII art wireframes to guide the visual architecture, information hierarchy, and structural behavior of the application's main screens. All wireframes assume a fixed **Header** and **Sidebar**, with the main content occupying the central area.

### Conventions

- `[Btn]` = button
- `[Input]` = input field
- `[Select]` = selector
- `[Tabs]` = tab navigation
- `[Table]` = table
- `[Chart]` = chart
- `[Drawer]` = side panel
- `[Empty]` = empty state
- `[Skeleton]` = loading

---

## 1. Dashboard

```text
+------------------------------------------------------------------------------------------------------------------+
| HEADER                                                                                                           |
| [Logo] [Global search......................] [Server: Online] [Theme] [User]                                  |
+----------------------+-------------------------------------------------------------------------------------------+
| SIDEBAR              | DASHBOARD                                                                                 |
| > Dashboard          | [Page Title: Dashboard]                                      [Refresh] [Period v]   |
|   Stub Mappings      |-------------------------------------------------------------------------------------------|
|   Requests           | [Card Total Stubs] [Card Requests] [Card Unmatched] [Card Near Misses]                |
|   Near Misses        | [Card Scenarios]   [Card Recording] [Card Version]   [Card Memory Usage]                 |
|   Scenarios          |-------------------------------------------------------------------------------------------|
|   Recording          | [Chart Requests per minute.........................................................]   |
|   Settings           |-------------------------------------------------------------------------------------------|
|   Files              | [Chart HTTP Methods...............] [Chart Status Codes................]               |
|   Logs               |-------------------------------------------------------------------------------------------|
|                      | [Chart Top URLs......................................................................]   |
|                      |-------------------------------------------------------------------------------------------|
|                      | [Last sync] [Quick indicators] [Operational alerts]                      |
+----------------------+-------------------------------------------------------------------------------------------+
```

**Interactive elements**

- Global search in the header
- Dashboard period selector
- Manual refresh button
- Clickable cards for drill-down
- Tooltips on charts
- Empty state for absence of metrics
- Skeleton for cards and charts during loading

---

## 2. Stub Mappings — Listing

```text
+------------------------------------------------------------------------------------------------------------------+
| HEADER                                                                                                           |
| [Logo] [Global search......................] [Server: Online] [Theme] [User]                                  |
+----------------------+-------------------------------------------------------------------------------------------+
| SIDEBAR              | STUB MAPPINGS                                                                            |
|   Dashboard          | [Page Title: Stub Mappings]                    [Import] [Export] [New Stub]         |
| > Stub Mappings      |-------------------------------------------------------------------------------------------|
|   Requests           | [Search by name/url.......................] [Method v] [Tag v] [Status v] [Favorites] |
|   Near Misses        | [Persistent] [Sort by v]                                           [Clear filters]   |
|   Scenarios          |-------------------------------------------------------------------------------------------|
|   Recording          | [ ] Select All                                                                            |
|   Settings           | [Table----------------------------------------------------------------------------------] |
|   Files              | | Name / Description | Method | URL Pattern | Priority | Tags | Updated | Actions (...) | |
|   Logs               | | User API mock      | GET    | /users/*    | 1        | core | 10:31   | Edit Delete  | |
|                      | | Order create stub  | POST   | /orders     | 5        | sales| 09:12   | ...          | |
|                      | | ...                                                                                      | |
|                      | [----------------------------------------------------------------------------------------] |
|                      | [Bulk actions v] [Delete] [Export] [Favorite]                Page 1 of 12  < 1 2 3 > |
+----------------------+-------------------------------------------------------------------------------------------+
```

**Interactive elements**

- Instant search field
- Filters by method, tag, status, persistence, and favorites
- Sorting and pagination
- Bulk selection and batch actions
- Per-row menu with edit, duplicate, clone, export, and delete
- Empty state with “Create first stub” CTA
- Table skeleton with placeholder rows

---

## 3. Stub Mappings — Creation/editing wizard

```text
+------------------------------------------------------------------------------------------------------------------+
| HEADER                                                                                                           |
| [Logo] [Global search......................] [Server: Online] [Theme] [User]                                  |
+----------------------+-------------------------------------------------------------------------------------------+
| SIDEBAR              | STUB WIZARD                                                                           |
|   Dashboard          | [Breadcrumb: Stub Mappings / Edit Stub]                          [Cancel] [Save]     |
| > Stub Mappings      |-------------------------------------------------------------------------------------------|
|   Requests           | [Stub title....................................] [Favorite] [Persistent] [Priority #] |
|   Near Misses        |-------------------------------------------------------------------------------------------|
|   Scenarios          | [Tabs: Request | Response | Metadata | Preview]                                          |
|   Recording          |-------------------------------------------------------------------------------------------|
|   Settings           | REQUEST TAB                                                                              |
|   Files              | [Method v] [URL.........................] [URL Pattern......................]            |
|   Logs               | [Accordion Headers]                                                                      |
|                      | [Accordion Cookies]                                                                      |
|                      | [Accordion Query Params]                                                                 |
|                      | [Accordion Body Matcher / JSONPath / Regex / Contains]                                   |
|                      | [Accordion Multipart]                                                                    |
|                      | [Accordion Authentication]                                                               |
|                      |-------------------------------------------------------------------------------------------|
|                      | RESPONSE TAB                                                                             |
|                      | [Status code] [Fixed Delay] [Random Delay] [Fault v]                                     |
|                      | [Headers key/value.................................................................]     |
|                      | [Body File..................] [Or edit the body below]                                    |
|                      | [Monaco Editor / Body Response......................................................]    |
|                      |-------------------------------------------------------------------------------------------|
|                      | METADATA TAB                                                                             |
|                      | [Tags chips....................................] [Scenario v] [Required State v]         |
|                      | [Next State................] [Description.........................................]     |
|                      | [Custom Metadata key/value.......................................................]     |
|                      |-------------------------------------------------------------------------------------------|
|                      | PREVIEW TAB                                                                              |
|                      | [Valid JSON ✓] [Format] [Copy] [Generate JSON]                                          |
|                      | [Monaco Editor / JSON final.......................................................]    |
+----------------------+-------------------------------------------------------------------------------------------+
```

**Interactive elements**

- Tabs with local persistence of the active tab
- Form with real-time validation via Zod
- Accordions for advanced fields
- Monaco editor for body and preview
- Cancel, save, format, copy, and generate JSON buttons
- Error state with inline per-field messages
- Unsaved changes state

---

## 4. Requests — Listing + side drawer

```text
+------------------------------------------------------------------------------------------------------------------+
| HEADER                                                                                                           |
| [Logo] [Global search......................] [Server: Online] [Theme] [User]                                  |
+----------------------+-------------------------------------------------------------------------------------------+
| SIDEBAR              | REQUESTS                                                                                 |
|   Dashboard          | [Page Title: Requests]                                 [Refresh] [Delete All] [Export] |
|   Stub Mappings      |-------------------------------------------------------------------------------------------|
| > Requests           | [Search URL/header/body...............] [Matched v] [Method v] [Status v] [Period v]  |
|   Near Misses        |-------------------------------------------------------------------------------------------|
|   Scenarios          | [Table----------------------------------------------------------------------------------] |
|   Recording          | | Time     | Method | URL                | Matched | Status | Stub        | Duration | IP | |
|   Settings           | | 12:01:30 | GET    | /users/1           | Yes     | 200    | user-get    | 45ms     |..| |
|   Files              | | 12:01:10 | POST   | /orders            | No      | 404    | -           | 12ms     |..| |
|   Logs               | | ...                                                                                      | |
|                      | [----------------------------------------------------------------------------------------] |
|                      |                                                                                           |
|                      |                                                        +----------------------------------+
|                      |                                                        | DRAWER: REQUEST DETAIL           |
|                      |                                                        | [Replay] [Generate Stub] [Delete]|
|                      |                                                        |----------------------------------|
|                      |                                                        | [Tabs: Overview | Body | Response|
|                      |                                                        |        | Headers | Raw JSON]     |
|                      |                                                        | Method: GET                      |
|                      |                                                        | URL: /users/1                    |
|                      |                                                        | Matched: Yes                     |
|                      |                                                        | Headers........................  |
|                      |                                                        | Query..........................  |
|                      |                                                        | Body / Response / JSON.........  |
|                      |                                                        +----------------------------------+
+----------------------+-------------------------------------------------------------------------------------------+
```

**Interactive elements**

- Instant search with combinable filters
- Row selection to open the drawer
- Tabs in the drawer
- Replay, generate stub, export, and delete actions
- Empty state when there are no recorded requests
- Table and drawer loading handled independently

---

## 5. Near Misses — List + diff viewer

```text
+------------------------------------------------------------------------------------------------------------------+
| HEADER                                                                                                           |
| [Logo] [Global search......................] [Server: Online] [Theme] [User]                                  |
+----------------------+-------------------------------------------------------------------------------------------+
| SIDEBAR              | NEAR MISSES                                                                              |
|   Dashboard          | [Page Title: Near Misses]                                     [Refresh] [Generate Stub]    |
|   Stub Mappings      |-------------------------------------------------------------------------------------------|
|   Requests           | [Search URL/request...............] [Min score v] [Method v] [Period v]            |
| > Near Misses        |-------------------------------------------------------------------------------------------|
|   Scenarios          | [Near misses list]                                 [Side-by-side diff panel]         |
|   Recording          | +-------------------------------------+            +----------------------------------+ |
|   Settings           | | #1  Score 0.92  POST /orders        |            | RECEBIDA          | ESPERADA   | |
|   Files              | | Candidate stub: order-create        |            |------------------|-------------| |
|   Logs               | | Mismatch: header + body          |            | Method: POST     | POST        | |
|                      | | [View Diff] [Auto-fix]          |            | URL: /orders/v2  | /orders     | |
|                      | +-------------------------------------+            | Header X: abc    | missing     | |
|                      | +-------------------------------------+            | Body.............|...........  | |
|                      | | #2  Score 0.78  GET /users/33       |            | [inline diff highlights]   | |
|                      | | ...                                 |            +----------------------------------+ |
|                      | +-------------------------------------+                                                           |
+----------------------+-------------------------------------------------------------------------------------------+
```

**Interactive elements**

- List sorted by similarity score
- Item selection for detailed diff view
- Assisted auto-correction action
- Stub generation from a near miss
- Empty state for “No near misses found”
- Independent loading for the list and the diff

---

## 6. Scenarios — Graph view

```text
+------------------------------------------------------------------------------------------------------------------+
| HEADER                                                                                                           |
| [Logo] [Global search......................] [Server: Online] [Theme] [User]                                  |
+----------------------+-------------------------------------------------------------------------------------------+
| SIDEBAR              | SCENARIOS                                                                                |
|   Dashboard          | [Page Title: Scenarios]                            [Auto layout] [Fit View] [Reset] |
|   Stub Mappings      |-------------------------------------------------------------------------------------------|
|   Requests           | [Scenario filter v] [Search by state.................] [Show orphan transitions]  |
|   Near Misses        |-------------------------------------------------------------------------------------------|
| > Scenarios          |                                                                                           |
|   Recording          |        +-----------+            +-------------+             +-------------+               |
|   Settings           |        | STARTED   |----------->| AUTHORIZED  |------------>| COMPLETED   |               |
|   Files              |        | badge      | req state  | next state  | next state  | terminal    |               |
|   Logs               |        +-----------+            +-------------+             +-------------+               |
|                      |              \                         ^                                                  |
|                      |               \                        |                                                  |
|                      |                \------->+-------------+                                                   |
|                      |                         | FAILED      |                                                   |
|                      |                         +-------------+                                                   |
|                      |                                                                                           |
|                      | [Optional side panel: Selected node details]                                    |
|                      | State: AUTHORIZED                                                                    |
|                      | Required State: STARTED                                                              |
|                      | Next State: COMPLETED                                                                |
|                      | Related stubs: 3                                                                |
+----------------------+-------------------------------------------------------------------------------------------+
```

**Interactive elements**

- React Flow canvas with zoom, pan, and fit view
- Node or edge selection
- Automatic layout
- Search/filter by scenario name or state
- Empty state for absence of scenarios
- Loading with canvas placeholder

---

## 7. Recording — Control panel

```text
+------------------------------------------------------------------------------------------------------------------+
| HEADER                                                                                                           |
| [Logo] [Global search......................] [Server: Online] [Theme] [User]                                  |
+----------------------+-------------------------------------------------------------------------------------------+
| SIDEBAR              | RECORDING                                                                                |
|   Dashboard          | [Page Title: Recording]                                 [Snapshot] [Export Capture]     |
|   Stub Mappings      |-------------------------------------------------------------------------------------------|
|   Requests           | [Status: Idle/Recording/Paused]  [Start] [Pause] [Stop]                                 |
|   Near Misses        |-------------------------------------------------------------------------------------------|
|   Scenarios          | SETTINGS                                                                            |
| > Recording          | [Proxy URL.........................................]                                     |
|   Settings           | [Capture Headers] [Capture Body] [Persist as files]                                      |
|   Files              | [Ignore Hosts......................................]                                     |
|   Logs               | [Capture filters / regex / methods / status.....................................]    |
|                      |-------------------------------------------------------------------------------------------|
|                      | CAPTURED STUBS PREVIEW                                                               |
|                      | [Table or list]                                                                           |
|                      | | Time | Method | URL | Suggested Name | Status | [Preview] [Discard] [Promote]         |
|                      |-------------------------------------------------------------------------------------------|
|                      | [Optional Monaco preview of the selected item....................................]    |
+----------------------+-------------------------------------------------------------------------------------------+
```

**Interactive elements**

- Start, pause, stop, and snapshot controls
- Capture settings form
- Preview of captured stubs
- Discard, promote, and export actions
- Alerts when recording is active
- Loading for recording startup/shutdown

---

## 8. Settings — Global settings

```text
+------------------------------------------------------------------------------------------------------------------+
| HEADER                                                                                                           |
| [Logo] [Global search......................] [Server: Online] [Theme] [User]                                  |
+----------------------+-------------------------------------------------------------------------------------------+
| SIDEBAR              | SETTINGS                                                                                 |
|   Dashboard          | [Page Title: Settings]                                               [Reset] [Save]  |
|   Stub Mappings      |-------------------------------------------------------------------------------------------|
|   Requests           | [Card Global Delay]                                                                      |
|   Near Misses        | | Default delay (ms) [..............]                                                     |
|   Scenarios          |-------------------------------------------------------------------------------------------|
|   Recording          | [Card Proxy]                                                                             |
| > Settings           | | Proxy base URL [..............................................................]        |
|   Files              |-------------------------------------------------------------------------------------------|
|   Logs               | [Card Extensions]                                                                        |
|                      | | List of registered extensions / status / enabled                                 |
|                      |-------------------------------------------------------------------------------------------|
|                      | [Card Persistence & Journal]                                                            |
|                      | | [Persistence Switch] [Request Journal Switch] [Max Requests...............]          |
|                      |-------------------------------------------------------------------------------------------|
|                      | [Validation alerts] [Contextual help]                                               |
+----------------------+-------------------------------------------------------------------------------------------+
```

**Interactive elements**

- Inputs, switches, and numeric fields
- Save and reset buttons
- Inline validation per field
- Alerts for required restart or operational impact
- Per-section loading and save errors

---

## 9. Files — Explorer + editor

```text
+------------------------------------------------------------------------------------------------------------------+
| HEADER                                                                                                           |
| [Logo] [Global search......................] [Server: Online] [Theme] [User]                                  |
+----------------------+-------------------------------------------------------------------------------------------+
| SIDEBAR              | FILES                                                                                    |
|   Dashboard          | [Breadcrumb: __files / mocks / responses]         [New File] [New Folder] [Save]  |
|   Stub Mappings      |-------------------------------------------------------------------------------------------|
|   Requests           | +----------------------------+ +------------------------------------------------------+ |
|   Near Misses        | | FILE TREE         | | EDITOR / PREVIEW                                     | |
|   Scenarios          | | [Search file..........]   | | [Tabs: editor | preview]                            | |
|   Recording          | | > __files                 | |------------------------------------------------------| |
| > Files              | |   > mocks                 | | Name: user-response.json                             | |
|   Logs               | |     - user-response.json  | | Type: JSON                                           | |
|                      | |     - order.xml           | |------------------------------------------------------| |
|                      | |   > images                | | [Monaco Editor....................................] | |
|                      | |     - logo.png            | | [..................................................] | |
|                      | |                           | |------------------------------------------------------| |
|                      | | [Upload] [Rename] [Delete]| | [Rendered preview when applicable]             | |
|                      | +----------------------------+ +------------------------------------------------------+ |
+----------------------+-------------------------------------------------------------------------------------------+
```

**Interactive elements**

- Expandable file tree
- Search by name
- Upload, rename, delete, new file, and new folder
- Monaco editor for text/code
- Preview for images, HTML, and renderable content
- Empty state when a folder is selected without a file
- Tree and file loading handled separately

---

## 10. Logs — Vertical timeline with filters

```text
+------------------------------------------------------------------------------------------------------------------+
| HEADER                                                                                                           |
| [Logo] [Global search......................] [Server: Online] [Theme] [User]                                  |
+----------------------+-------------------------------------------------------------------------------------------+
| SIDEBAR              | LOGS                                                                                     |
|   Dashboard          | [Page Title: Logs]                                                 [Refresh] [Export]|
|   Stub Mappings      |-------------------------------------------------------------------------------------------|
|   Requests           | +------------------------------+ +-----------------------------------------------------+ |
|   Near Misses        | | FILTERS                      | | VERTICAL TIMELINE                                    | |
|   Scenarios          | | [Search text...........]    | | 12:04:15  ● Request received: GET /users/1           | |
|   Recording          | | [Method v]                  | |            Matched stub: user-get                     | |
|   Settings           | | [Status v]                  | |-----------------------------------------------------| |
|   Files              | | [Type v]                    | | 12:04:08  ● Near miss detected for POST /orders    | |
| > Logs               | | [Start/end time]       | |            Score: 0.92                                | |
|                      | | [Errors only]             | |-----------------------------------------------------| |
|                      | | [Clear filters]            | | 12:03:59  ● Recording started                        | |
|                      | +------------------------------+ |-----------------------------------------------------| |
|                      |                                  | 12:03:20  ● Stub updated: order-create            | |
|                      |                                  |-----------------------------------------------------| |
|                      |                                  | [Load more]                                           | |
|                      |                                  +-----------------------------------------------------+ |
+----------------------+-------------------------------------------------------------------------------------------+
```

**Interactive elements**

- Side filter panel
- Timeline grouped by time
- Incremental pagination or load more
- Export of filtered logs
- Empty state for absence of events
- Timeline skeleton during loading

---

## General notes

- On every screen, the header and sidebar should remain recognizable.
- Loading states should preserve the final layout.
- Tables and detail panels should prioritize productivity.
- Critical components should account for desktop, tablet, and mobile variations.

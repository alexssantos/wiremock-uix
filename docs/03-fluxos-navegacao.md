# 03. Navigation Flows

## Document goal

This document describes the main navigation flows of WireMock Studio Open Source, detailing the user's path across screens, actions, expected results, decision points, and error branches. The focus is to guide design, development, QA, and end-to-end test automation.

## Conventions used

- **Screen**: the visual context where the user is currently located.
- **Action**: the interaction performed by the user.
- **Result**: the expected response from the interface and/or the WireMock administrative API.
- **Next screen**: the natural destination of the flow after the action.
- **Error branch**: the expected behavior when there is server unavailability, validation failure, data conflict, or operational error.

---

## 1. Create a new Stub Mapping from scratch (via wizard)

**Goal:** register a complete new stub using the guided Request -> Response -> Metadata -> Preview assistant.

**Preconditions:** WireMock server online, user authenticated in the application (if a future authentication layer exists), and permission to create mappings.

### Steps

1. **Screen: Global sidebar** -> the user clicks **Stub Mappings** -> the application opens the mappings list with filters, search, and primary actions -> **Next screen: Stub Mappings / List**.
2. **Screen: Stub Mappings / List** -> the user clicks **New Stub** -> the wizard opens in creation mode, starting at the **Request** step -> **Next screen: Wizard / Request**.
3. **Screen: Wizard / Request** -> the user selects the HTTP method (for example, `GET`) -> the form updates required fields and compatible matcher options -> **Remains on the same screen**.
4. **Screen: Wizard / Request** -> the user enters an exact `URL` or `URL Pattern` -> the interface validates format, basic conflicts, and required fields -> **Remains on the same screen**.
5. **Screen: Wizard / Request** -> the user adds headers, cookies, query params, body matchers, authentication, and priority when applicable -> the UI stores the configuration in a local stub draft -> **Remains on the same screen**.
6. **Decision at the Request step** -> if there is an invalid field or a required field is missing, the **Next** button remains disabled or shows inline errors -> the user corrects the fields -> **Remains on the same screen**.
7. **Screen: Wizard / Request** -> the user clicks **Next** -> the Request step is persisted in the wizard's local state without saving to the server -> **Next screen: Wizard / Response**.
8. **Screen: Wizard / Response** -> the user defines `status`, response headers, inline body or `bodyFileName`, fixed delay, random delay, chunked dribble, or fault, depending on the use case -> the UI updates the intermediate JSON -> **Remains on the same screen**.
9. **Decision at the Response step** -> if the user selects a nonexistent `bodyFileName`, the UI should warn that the file was not found in `__files` and offer a link to create/select it -> the user adjusts the reference or returns to the flow after creating the file -> **Remains on the same screen or temporarily navigates to Files**.
10. **Screen: Wizard / Response** -> the user clicks **Next** -> the response configuration is attached to the draft -> **Next screen: Wizard / Metadata**.
11. **Screen: Wizard / Metadata** -> the user enters tags, description, persistence flag, associated scenario, and custom metadata -> the UI organizes the data to make future searches easier -> **Remains on the same screen**.
12. **Decision at the Metadata step** -> if the user associates the stub with an existing scenario, the UI suggests coherent `requiredState` and `newState`; if the scenario does not exist, the UI allows a new scenario name to be entered -> **Remains on the same screen**.
13. **Screen: Wizard / Metadata** -> the user clicks **Next** -> the system generates the consolidated stub JSON -> **Next screen: Wizard / Preview**.
14. **Screen: Wizard / Preview** -> the user reviews the JSON in Monaco Editor with formatting and structural validation -> the screen highlights schema errors, unknown fields, and request/response inconsistencies -> **Remains on the same screen**.
15. **Decision at the Preview step** -> if the JSON is invalid, the **Save** button is blocked and the UI offers an action to return to the step with the error -> the user fixes the issue and returns to preview -> **Remains in the wizard**.
16. **Screen: Wizard / Preview** -> the user clicks **Save** -> the application sends the payload to `POST /__admin/mappings` -> **Waiting for response**.
17. **Successful result** -> the API returns the created mapping with `id`; the UI shows a success toast, invalidates the list cache, and offers to open detail/edit -> **Next screen: Stub Mappings / List or Stub Detail**.
18. **Persistence error branch** -> if the API returns a 4xx/5xx error or times out, the UI preserves the local draft, shows an actionable message, and allows **Try again**, **Copy JSON**, or **Export draft** -> **Remains on Wizard / Preview**.

### Tree diagram

Stub Mappings / List
-> New Stub
  -> Wizard / Request
    -> Valid data
      -> Wizard / Response
        -> Valid response
          -> Wizard / Metadata
            -> JSON Preview
              -> Valid JSON
                -> Save
                  -> Success -> Stub List/Detail
                  -> API error -> Keep draft and allow retry
              -> Invalid JSON -> Return to step with error
    -> Invalid data -> Show inline validation and block progress

---

## 2. Duplicate and edit an existing Stub Mapping

**Goal:** speed up the creation of variations of an existing stub while preserving the original until the new entry is confirmed.

### Steps

1. **Screen: Stub Mappings / List** -> the user locates a stub through search, filter, or pagination -> the stub row shows quick actions -> **Remains on the same screen**.
2. **Screen: Stub Mappings / List** -> the user clicks **Duplicate** in the row action menu -> the application creates a draft based on the original stub, removing `id` and adjusting fields that should not be reused literally -> **Next screen: Wizard / Request (duplicate mode)**.
3. **Screen: Wizard / Request** -> the user reviews method, URL, headers, and priority inherited from the original stub -> the UI highlights that this is a copy and not a direct edit of the original -> **Remains on the same screen**.
4. **Decision** -> if the new URL or matcher conflicts with an existing stub of the same priority, the UI warns about possible functional overlap before saving -> the user can adjust priority, URL, or match conditions -> **Remains on the same screen**.
5. **Screen: Wizard / Request** -> the user updates the necessary fields and moves forward -> the updated draft proceeds to the response step -> **Next screen: Wizard / Response**.
6. **Screen: Wizard / Response** -> the user adapts body, status, delays, or faults for the new variant -> the partial preview is updated -> **Remains on the same screen**.
7. **Screen: Wizard / Metadata** -> the user adjusts tags, description, favorite, scenario, and metadata to differentiate the new copy from the original stub -> **Remains on the same screen**.
8. **Screen: Wizard / Preview** -> the user visually compares the copied JSON with the expected behavior -> the UI may show a warning indicating which fields differ from the source -> **Remains on the same screen**.
9. **Screen: Wizard / Preview** -> the user saves the duplicate -> the application creates a new mapping via `POST /__admin/mappings` -> **Waiting for response**.
10. **Successful result** -> the UI returns to the list with the new stub highlighted and can optionally open a JSON comparison between the original and the duplicate -> **Next screen: Stub Mappings / List**.
11. **Error branch** -> if the save fails, the UI keeps the draft and clearly informs that the original stub was not changed -> **Remains in the wizard**.
12. **Alternative flow: direct edit** -> if the user chooses **Edit** instead of **Duplicate**, the wizard/loading opens with the original `id`; on save, the UI uses `PUT /__admin/mappings/{id}` and updates the existing item -> **Next screen: List or Stub Detail**.

### Tree diagram

Stub Mappings / List
-> Locate stub
  -> Duplicate
    -> Pre-filled wizard
      -> Adjust Request/Response/Metadata
        -> Preview
          -> Save copy
            -> Success -> List with new stub
            -> Error -> Keep draft
  -> Edit
    -> Original stub wizard
      -> Save changes
        -> Success -> Update existing stub
        -> Error -> Preserve local edit

---

## 3. Import a collection of Stub Mappings from a JSON file

**Goal:** load multiple stubs at once from an exported or externally prepared file.

### Steps

1. **Screen: Stub Mappings / List** -> the user clicks **Import** -> the application opens the import wizard/modal -> **Next screen: Import Wizard**.
2. **Screen: Import Wizard** -> the user selects a local `.json` file or drags and drops the file into the upload area -> the UI begins client-side content reading -> **Remains on the same screen**.
3. **Initial decision** -> if the file is empty, corrupted, or not valid JSON, the UI rejects the upload, explains the reason, and allows another file to be sent -> **Remains on Import Wizard**.
4. **Screen: Import Wizard** -> with valid JSON, the interface shows a summary with the number of mappings, detected tags, impacted scenarios, and any `bodyFileName` dependencies -> **Remains on the same screen**.
5. **Consistency decision** -> if there are fields incompatible with the schema accepted by WireMock, the wizard marks the problematic items and allows invalid records to be excluded from the import or the process to be canceled -> **Remains on the same screen**.
6. **Screen: Import Wizard** -> the user defines the import strategy (for example, import all, ignore duplicates, overwrite conflicts when supported by the rule defined by the application) -> the UI summarizes the expected impact -> **Remains on the same screen**.
7. **Conflict decision** -> if duplicate IDs or functionally equivalent stubs are detected, the UI presents a conflict list, highlighting which records will be created, ignored, or replaced -> **Remains on the same screen**.
8. **Screen: Import Wizard** -> the user confirms the import -> the application sends the payload to `POST /__admin/mappings/import` -> **Waiting for response**.
9. **Successful result** -> the UI shows totals for imported items, ignored items, and warnings; then it invalidates the cache and returns to the list, optionally filtering to the newly imported items -> **Next screen: Stub Mappings / List**.
10. **Partial branch** -> if the API accepts only part of the batch, the UI shows an item-by-item report, keeps the rejected JSON available for download/correction, and preserves the user's context -> **Next screen: Import Summary**.
11. **Full failure branch** -> if the import fails entirely, the UI keeps the uploaded file available in the current session, explains the failure, and offers **Revalidate**, **Download report**, or **Cancel** -> **Remains on Import Wizard**.

### Tree diagram

Stub Mappings / List
-> Import
  -> Select JSON file
    -> Invalid JSON -> Show error and request a new file
    -> Valid JSON
      -> Analyze collection
        -> Conflicts found -> Choose strategy
        -> No conflicts -> Confirm import
          -> Success -> Updated list
          -> Partial -> Show detailed report
          -> Error -> Allow retry

---

## 4. Investigate an unmatched request and generate a Stub from it

**Goal:** quickly turn a real unmatched request into a usable new stub.

### Steps

1. **Screen: Dashboard** -> the user identifies an increase in **Unmatched Requests** or directly accesses the **Requests** module from the sidebar -> **Next screen: Requests / List**.
2. **Screen: Requests / List** -> the user applies the **Matched = No** filter or opens the dedicated unmatched requests view -> the table now shows only requests without a match -> **Remains on the same screen**.
3. **Screen: Requests / List** -> the user selects a request of interest -> the application opens the side drawer with full details -> **Next screen: Requests / Detail Drawer**.
4. **Screen: Requests / Detail Drawer** -> the user reviews method, URL, query params, headers, cookies, body, received response, and raw JSON -> the UI makes it clear that there was no matching stub -> **Remains on the same screen**.
5. **Data quality decision** -> if the request has incomplete, truncated, or masked payload, the UI warns which fields may require manual editing in the generated stub -> **Remains on the same screen**.
6. **Screen: Requests / Detail Drawer** -> the user clicks **Generate Stub** -> the application creates an initial draft automatically filling the wizard's Request step based on the captured request -> **Next screen: Wizard / Request (generate from request mode)**.
7. **Screen: Wizard / Request** -> the user decides whether to keep literal values or convert parts into more flexible matchers (`urlPattern`, regex, contains, `equalToJson`, etc.) -> the UI offers generalization presets -> **Remains on the same screen**.
8. **Screen: Wizard / Response** -> the user defines the mocked response and can copy data from the original observed response if available -> **Remains on the same screen**.
9. **Screen: Wizard / Metadata** -> the user adds a description indicating the capture source, troubleshooting tags, and, if necessary, a scenario association -> **Remains on the same screen**.
10. **Screen: Wizard / Preview** -> the user validates the final JSON and saves -> the application sends `POST /__admin/mappings` -> **Waiting for response**.
11. **Successful result** -> the UI shows a toast, offers a shortcut to **Replay** the original request, and suggests rerunning the client to confirm that the stub now matches correctly -> **Next screen: Requests List or Stubs List**.
12. **Error branch** -> if automatic generation cannot build a minimally valid stub, the UI still opens the wizard with partially filled fields and explicitly lists what must be completed manually -> **Remains in the wizard**.

### Tree diagram

Requests / List
-> Filter unmatched
  -> Open request drawer
    -> Generate Stub
      -> Pre-filled wizard
        -> Adjust matchers
          -> Define response
            -> Preview
              -> Save
                -> Success -> Revalidate behavior
                -> Error -> Keep draft
    -> Insufficient data -> Warn about limitations and allow manual editing

---

## 5. Analyze a Near Miss and fix the existing Stub

**Goal:** use similarity analysis to adjust an existing stub instead of creating an unnecessary new one.

### Steps

1. **Screen: Global sidebar** -> the user opens **Near Misses** -> the application queries near misses for unmatched requests -> **Next screen: Near Misses / List**.
2. **Screen: Near Misses / List** -> the user sorts items by highest similarity score or filters by method/URL -> the list prioritizes the most likely quick-fix cases -> **Remains on the same screen**.
3. **Screen: Near Misses / List** -> the user opens a specific near miss -> the interface shows the received request, candidate stub, `distance score`, and a visual diff between expected and received values -> **Next screen: Near Misses / Detail**.
4. **Screen: Near Misses / Detail** -> the user identifies which differences prevent the match (for example, missing query param, mismatched header, or overly restrictive body matcher) -> the UI highlights each discrepancy by category -> **Remains on the same screen**.
5. **Decision** -> if the ideal fix is to modify the existing stub, the user chooses **Fix Stub**; if the difference represents new business behavior, the user may choose **Generate New Stub** -> **Remains on the same screen**.
6. **Screen: Near Misses / Detail** -> when **Fix Stub** is selected, the UI opens the existing stub in edit mode, preferably already focused on the divergent field -> **Next screen: Wizard / Request or JSON Editor**.
7. **Screen: Stub Editing** -> the user applies the suggested fix or makes a more appropriate manual adjustment (for example, changing `urlEqualTo` to `urlPath`, adding an optional query param, or relaxing `equalToJson`) -> the preview reflects the new behavior -> **Remains on the same screen**.
8. **Screen: Preview / Comparison** -> the user compares the current version with the original stub version and checks whether the change resolves the near miss without excessively widening the matcher's scope -> **Remains on the same screen**.
9. **Screen: Preview** -> the user saves the change -> the application sends `PUT /__admin/mappings/{id}` -> **Waiting for response**.
10. **Successful result** -> the UI returns to the near miss detail, updates the list, and suggests reprocessing or repeating the original call to validate the match -> **Next screen: Near Misses / List or Requests**.
11. **Error branch** -> if there is an update conflict or save failure, the UI keeps local changes, identifies the affected stub, and offers a retry -> **Remains in editing**.

### Tree diagram

Near Misses / List
-> Open near miss
  -> View diff and score
    -> Fix existing Stub
      -> Edit matcher/response
        -> Compare before/after
          -> Save
            -> Success -> Update near miss
            -> Error -> Keep local edit
    -> Generate New Stub
      -> Open creation wizard based on the case

---

## 6. Create and test a multi-state scenario via the visual editor

**Goal:** model a stateful WireMock flow using a visual graph, transitions, and functional validation.

### Steps

1. **Screen: Global sidebar** -> the user opens **Scenarios** -> the application loads stubs with `scenarioName`, `requiredScenarioState`, and `newScenarioState` -> **Next screen: Scenarios / Graph Editor**.
2. **Screen: Scenarios / Graph Editor** -> the user selects an existing scenario or creates a new blank scenario -> the React Flow canvas is displayed with the initial `STARTED` node -> **Remains on the same screen**.
3. **Screen: Graph Editor** -> the user adds state nodes (for example, `CartCreated`, `PaymentAuthorized`, `OrderCompleted`) -> the UI creates repositionable visual elements on the canvas -> **Remains on the same screen**.
4. **Screen: Graph Editor** -> the user creates transitions between states, associating each edge with a stub or planned operation -> the UI requires `requiredState` and `nextState` definitions -> **Remains on the same screen**.
5. **Structural decision** -> if there is a transition without a target state, an orphan state, or an inconsistent cycle, the visual editor marks the problem and blocks publishing until it is fixed -> **Remains on the same screen**.
6. **Screen: Properties side panel** -> the user links or creates stubs for each transition, defining method, URL, and response together with the required state -> **Remains on the same screen**.
7. **Screen: Graph Editor** -> the user saves the scenario -> the application translates the visual model into a set of WireMock-compatible stub mappings -> **Waiting for persistence**.
8. **Successful result** -> the scenario is persisted and reopened already reflecting the saved layout -> **Remains on Scenarios / Graph Editor**.
9. **Screen: Graph Editor** -> the user clicks **Reset State** -> the application resets the scenario to `STARTED` via a compatible API/equivalent configuration -> **Remains on the same screen**.
10. **Screen: Scenario test** -> the user triggers test requests from the Requests module, an external client, or an integrated replay action -> the scenario panel visually highlights the executed transition and current state -> **Remains on Scenarios or temporarily navigates to Requests**.
11. **Validation decision** -> if a request does not satisfy the `requiredState`, the UI should indicate why the transition did not occur and point out which state was active -> **Remains on the same screen**.
12. **Error branch** -> if part of the scenario's stubs fail to save, the UI reports which transitions were persisted, which failed, and avoids creating a false impression of complete success -> **Remains in the editor with per-item status**.

### Tree diagram

Scenarios / Graph Editor
-> Create or open scenario
  -> Add states
    -> Create transitions
      -> Validate structure
        -> Valid structure
          -> Save scenario
            -> Success -> Test requests and observe state
            -> Partial error -> Indicate failed transitions
        -> Invalid structure -> Block publishing and highlight error
  -> Reset state -> Return to STARTED

---

## 7. Record real interactions against a remote service through a proxy and review before saving

**Goal:** capture real traffic through a reverse proxy and turn it into reviewable stubs before final persistence.

### Steps

1. **Screen: Global sidebar** -> the user opens **Recording** -> the application displays the current recording status and the proxy configuration form -> **Next screen: Recording**.
2. **Screen: Recording** -> the user enters `Proxy URL`, header/body capture policies, and the list of ignored hosts -> the UI validates URL format and option consistency -> **Remains on the same screen**.
3. **Configuration decision** -> if the `Proxy URL` is invalid, unreachable, or incompatible, the **Start** button should remain blocked or fail with a clear message -> **Remains on Recording**.
4. **Screen: Recording** -> the user clicks **Start** -> the application activates recording mode in WireMock and updates the status indicator to **Recording** -> **Remains on the same screen**.
5. **Screen: Recording** -> the user performs real calls from the client system pointing to WireMock as a proxy -> the application shows counters or an incremental list of captured interactions -> **Remains on the same screen**.
6. **Screen: Recording** -> the user clicks **Pause** to temporarily stop new captures without losing the current batch -> the status changes to **Paused** -> **Remains on the same screen**.
7. **Screen: Recording** -> the user can click **Resume/Start** again and continue capture -> the batch keeps accumulating relevant interactions -> **Remains on the same screen**.
8. **Screen: Recording** -> the user clicks **Snapshot** -> the application asks WireMock to generate stubs from what has been captured so far -> **Next screen: Capture Review**.
9. **Screen: Capture Review** -> the user reviews each generated stub, removing duplicates, editing matchers, cleaning volatile headers, and adjusting responses before the final save -> **Remains on the same screen**.
10. **Review decision** -> if a captured stub is too specific (for example, a variable tracking header), the UI should flag the need for generalization before saving -> **Remains in review**.
11. **Screen: Capture Review** -> the user selects which stubs will be persisted and confirms -> the application saves only the approved items -> **Waiting for response**.
12. **Screen: Recording** -> when the round is complete, the user clicks **Stop** -> recording ends, indicators and controls return to the initial state, and the UI offers a session summary -> **Remains on Recording**.
13. **Error branch** -> if the recording session drops in the middle of the process, the UI must preserve local review of stubs already materialized by snapshot and report the exact point of failure -> **Remains on Recording or Capture Review**.

### Tree diagram

Recording
-> Configure proxy
  -> Invalid configuration -> Show error and block start
  -> Valid configuration
    -> Start
      -> Capture traffic
        -> Pause/Resume
        -> Snapshot
          -> Review captured stubs
            -> Approve and save selected items
              -> Success -> Finish with Stop
              -> Error -> Preserve local review
        -> Stop -> Finish session

---

## 8. Change global settings (for example, global delay) and validate the impact

**Goal:** update WireMock global parameters with immediate feedback and functional validation.

### Steps

1. **Screen: Global sidebar** -> the user opens **Settings** -> the application loads the server's current settings -> **Next screen: Settings**.
2. **Screen: Settings** -> the user locates the **Global Delay** section -> the fields show current values, unit, and contextual help -> **Remains on the same screen**.
3. **Screen: Settings** -> the user changes the global delay to a new value -> the UI validates numeric range, format, and expected impact -> **Remains on the same screen**.
4. **Validation decision** -> if the value is negative, non-numeric, or above the limit defined by UX/business rules, the UI blocks saving and shows an inline error -> **Remains on the same screen**.
5. **Screen: Settings** -> the user saves the change -> the application sends the payload to the appropriate administrative endpoint and invalidates dependent queries -> **Waiting for response**.
6. **Successful result** -> the UI shows a toast confirming immediate application of the change and marks the form as synchronized with the server -> **Remains on Settings**.
7. **Screen: Validation navigation** -> the user opens **Requests**, **Dashboard**, or performs a test call to observe increased latency on subsequent responses -> the application highlights the new perceived time in metrics/logs -> **Next screen: Requests, Dashboard, or Logs**.
8. **Impact decision** -> if the measured behavior does not reflect the saved setting, the UI should allow a forced settings refresh and indicate a possible client/server mismatch -> **Remains on the current screen**.
9. **Error branch** -> if saving fails, the UI reports that the setting was not applied, restores or keeps the edited value as unsaved, and offers another attempt -> **Remains on Settings**.

### Tree diagram

Settings
-> Change Global Delay
  -> Invalid value -> Block saving
  -> Valid value
    -> Save
      -> Success
        -> Validate impact in Requests/Dashboard/Logs
          -> Impact confirmed -> End flow
          -> Impact not confirmed -> Reload setting and investigate
      -> Error -> Report that it was not applied

---

## 9. Manage static files in __files (upload, editing, deletion)

**Goal:** manage files used by WireMock static responses directly through the interface.

### Steps

1. **Screen: Global sidebar** -> the user opens **Files** -> the application opens the `__files` explorer with a directory tree/list and preview -> **Next screen: Files Explorer**.
2. **Screen: Files Explorer** -> the user clicks **Upload** or drags a file to the upload area -> the UI validates type, size, and destination path -> **Remains on the same screen**.
3. **Upload decision** -> if a file with the same name already exists, the UI asks for confirmation to overwrite it or allows renaming before upload -> **Remains on the same screen**.
4. **Screen: Files Explorer** -> after a successful upload, the tree is updated and the newly uploaded file is highlighted -> **Remains on the same screen**.
5. **Screen: Files Explorer** -> the user selects a text file (`json`, `xml`, `html`, `txt`) -> the application opens the integrated editor with loaded content and save/cancel actions -> **Next screen: Files / Editor**.
6. **Screen: Files / Editor** -> the user changes the content -> the UI marks the file as modified and, when applicable, offers formatting/syntax support -> **Remains on the same screen**.
7. **Editing decision** -> if the content becomes invalid for the recognized type (for example, malformed JSON), the UI warns the user and may block structured saving, while still allowing save as raw text depending on the defined policy -> **Remains on the same screen**.
8. **Screen: Files / Editor** -> the user saves -> the application persists the file and updates any stubs that reference it only at the read/preview level, without automatically rewriting the stubs -> **Remains on Files**.
9. **Screen: Files Explorer** -> the user selects an image file -> the application shows a visual preview instead of the text editor -> **Next screen: Files / Preview**.
10. **Screen: Files Explorer** -> the user triggers **Delete** on a file -> the UI opens a destructive confirmation that explains potential impacts on stubs using `bodyFileName` -> **Remains on the same screen**.
11. **Deletion result** -> after confirmation, the application removes the file, updates the tree, and shows a success toast; if it fails, the item remains visible and the UI explains why -> **Remains on Files Explorer**.

### Tree diagram

Files Explorer
-> Upload
  -> Name conflict -> Confirm overwrite or rename
  -> Successful upload -> Update tree
-> Open text file
  -> Edit content
    -> Invalid content -> Warn before saving
    -> Save -> Update file
-> Open image
  -> Show preview
-> Delete file
  -> Confirm impact
    -> Success -> Remove from list
    -> Error -> Keep item and report failure

---

## 10. Search globally (Cmd/Ctrl+K) and navigate directly to a resource

**Goal:** reduce navigation time by allowing instant access to modules, stubs, requests, files, and settings.

### Steps

1. **Screen: any module** -> the user presses **Ctrl+K** (Windows/Linux) or **Cmd+K** (macOS) -> the application opens the global search/command palette -> **Next screen: Command Palette**.
2. **Screen: Command Palette** -> the user types a search term (for example, URL, stub name, tag, file, module) -> the UI returns results grouped by category and relevance -> **Remains on the same screen**.
3. **Availability decision** -> if the application is offline, the search should at least return local routes and cached items, marking remote results as unavailable -> **Remains on the same screen**.
4. **Screen: Command Palette** -> the user navigates with arrow keys, reviews summarized metadata, and confirms with **Enter** -> the application navigates directly to the selected resource -> **Next screen: corresponding resource**.
5. **Screen: target resource** -> if the result is a stub, the UI opens the filtered list or detail; if it is a request, it opens the list/drawer; if it is a file, it opens the editor/preview; if it is a route, it navigates to the module -> **Remains on the destination screen**.
6. **Error branch** -> if the selected item can no longer be loaded (for example, it was deleted in another tab), the UI informs that the resource is no longer available and keeps the palette open or redirects to the module list -> **Remains in the safest context**.

### Tree diagram

Any screen
-> Ctrl/Cmd+K
  -> Type search term
    -> Results available
      -> Select item
        -> Navigate to resource
          -> Resource accessible -> Open detail/list
          -> Resource unavailable -> Inform and redirect safely
    -> No results -> Show empty state and useful shortcuts

---

## 11. Switch theme Light/Dark/System

**Goal:** allow visual personalization with local persistence and immediate interface response.

### Steps

1. **Screen: Global header** -> the user clicks the theme selector -> the application opens a menu with **Light**, **Dark**, and **System** options -> **Remains on the same screen**.
2. **Screen: Theme menu** -> the user chooses an option -> the interface immediately applies the new theme across the application, including complex components such as charts, Monaco Editor, and React Flow -> **Remains on the same screen**.
3. **Immediate result** -> the visual state changes without reloading the page while preserving the current screen, filters, and unsaved drafts -> **Remains on the same screen**.
4. **Persistence** -> the application stores the preference in LocalStorage; if the user chooses **System**, the UI starts respecting operating system changes in future sessions -> **Remains on the same screen**.
5. **Error branch** -> if any component does not support immediate switching, the UI should apply a coherent visual fallback and log the issue without breaking user navigation -> **Remains on the same screen**.

### Tree diagram

Header
-> Open theme selector
  -> Light -> Apply and persist
  -> Dark -> Apply and persist
  -> System -> Follow OS and persist
    -> Isolated component failure -> Apply fallback without interrupting flow

---

## 12. Error flow: WireMock server offline/unreachable (degraded application state)

**Goal:** guarantee predictable behavior when the administrative API is unavailable, preserving user context and avoiding inconsistent destructive actions.

### Steps

1. **Screen: any module that depends on remote data** -> the application tries to query the WireMock administrative API -> the request fails because of timeout, DNS, connection refused, or persistent gateway error -> **Remains on the current screen**.
2. **Global result** -> the server status indicator in the header changes to **Offline/Degraded**, with a tooltip explaining the known cause and the timestamp of the last attempt -> **Remains on the same screen**.
3. **Current screen** -> components that depend on remote data replace infinite loading with an actionable error state, with **Try again**, **View details**, and, when possible, **Work with cached data** buttons -> **Remains on the same screen**.
4. **Continuation decision** -> if cached data is available, the UI displays it in read-only mode with an out-of-date badge; if there is no cache, it shows an empty state focused on recovery -> **Remains on the same screen**.
5. **Critical actions** -> creation, editing, deletion, import, recording, and settings changes are blocked or clearly marked as unavailable until the server responds again -> **Remains on the same screen**.
6. **In-progress flows** -> if the user is editing a stub, reviewing recordings, or changing a file when the connection drops, the application preserves the local draft and informs that saving was postponed/failed -> **Remains on the working screen**.
7. **Recovery** -> the user clicks **Try again** or the application performs automatic polling again -> when connectivity returns, the modules synchronize data, clear error badges, and re-enable write actions -> **Remains on or refreshes the same screen**.
8. **Persistent branch** -> if the outage lasts longer than a defined threshold, the UI offers a link to operational documentation, the configured endpoint, and basic diagnostic steps -> **Remains in a controlled degraded state**.

### Tree diagram

Any remote module
-> Communication failure with WireMock
  -> Update global status to Offline/Degraded
    -> Local cache exists
      -> Display read-only mode
    -> No cache
      -> Display error with retry action
    -> User attempts a write action
      -> Block action and preserve draft
    -> Connectivity returns
      -> Synchronize data and re-enable actions

---

## Final notes

The flows above should guide the construction of complete journeys, automated tests, and usability criteria. Whenever possible, navigation should preserve context (filters, tabs, drafts, and scroll position), reduce user rework, and provide clear feedback about success, error, processing, and degraded state.

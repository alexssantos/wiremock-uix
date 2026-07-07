# 11. Acceptance Criteria

## Document objective

This document consolidates testable acceptance criteria for WireMock Studio Open Source, organized by functional module. The format is Gherkin-like, in English, to support alignment across product, design, development, QA, and automation.

## Conventions

- Each criterion represents observable, verifiable behavior.
- Scenarios should be validated both on the happy path and on the main error-path deviations.
- Whenever applicable, consider both integration with the WireMock administrative API (`/__admin`) and React UI behavior.

---

## Dashboard

### AC-DASH-01 — Display core cards when the dashboard loads
**Given** that the WireMock server is online and contains mappings, requests, near misses, scenarios, and recording status data  
**When** the user opens the Dashboard module  
**Then** the interface must display cards for Total Stubs, Requests Received, Unmatched Requests, Near Misses, Scenarios, Recording Status, Server Version, and Memory Usage, with populated values or an explicit fallback when any datum is unavailable.

### AC-DASH-02 — Refresh metrics via polling without reloading the page
**Given** that the user is viewing the Dashboard  
**When** new requests reach WireMock between two configured polling cycles  
**Then** the affected cards and charts must reflect the new numbers without reloading the full page and without losing filters or visual context.

### AC-DASH-03 — Display a requests-per-minute chart with coherent aggregation
**Given** that requests exist at different timestamps  
**When** the Dashboard builds the requests-per-minute chart  
**Then** the time series must group events correctly by time window and represent gaps without distorting chronological order.

### AC-DASH-04 — Display HTTP method and status code distribution
**Given** that the request journal contains requests with different methods and response status codes  
**When** the user views the distribution charts  
**Then** the sum of the displayed segments must match the total number of requests for the selected period.

### AC-DASH-05 — Navigate from actionable cards
**Given** that the Dashboard displays cards for Unmatched Requests and Near Misses  
**When** the user clicks one of those cards  
**Then** the application must navigate to the corresponding module with a filter already applied that matches the selected card context.

### AC-DASH-06 — Handle partial dashboard data failures
**Given** that one or more Dashboard queries fail while the application remains accessible  
**When** the dashboard finishes loading  
**Then** affected widgets must display a localized error state with a retry option, without blocking the widgets that loaded successfully.

---

## Stub Mappings

### AC-STUB-01 — List mappings with essential information
**Given** that stub mappings exist in WireMock  
**When** the user opens the Stub Mappings module  
**Then** the list must show at least method, URL pattern, relevant description/tags, priority, associated scenario, favorite state, and available item actions.

### AC-STUB-02 — Search mappings by free text
**Given** that the list contains multiple stubs with different URLs, tags, and descriptions  
**When** the user enters a search term  
**Then** the list must be refined by relevant matches in those fields and clearly indicate when no result is found.

### AC-STUB-03 — Filter mappings by structured attributes
**Given** that stubs exist with different methods, tags, favorites, and scenarios  
**When** the user applies structured filters  
**Then** the list must combine all active filters correctly and show a consistent count of returned items.

### AC-STUB-04 — Paginate large mapping volumes
**Given** that the environment contains more stubs than fit on a single page  
**When** the user navigates between pages or loads more results  
**Then** the application must keep sorting, filters, and search active without duplicating or losing records during the transition.

### AC-STUB-05 — Create a stub through the wizard with required steps
**Given** that the user started creating a new stub  
**When** they progress through the Request, Response, Metadata, and Preview steps  
**Then** the interface must block final submission while any required field is missing or the JSON is invalid.

### AC-STUB-06 — Validate Request fields before advancing
**Given** that the user is on the Request step of the wizard  
**When** they fail to provide a method or a valid URL/URL Pattern rule  
**Then** the system must highlight the invalid fields and block navigation to the next step.

### AC-STUB-07 — Validate `bodyFileName` references in the Response step
**Given** that the user configured a response using `bodyFileName`  
**When** the specified file does not exist in `__files`  
**Then** the interface must warn about the issue before saving and provide a path to fix it.

### AC-STUB-08 — Display JSON preview faithful to the form
**Given** that the user filled out the wizard steps  
**When** they open the Preview step  
**Then** the JSON shown in the editor must fully reflect the current form state, including metadata, matchers, and response settings.

### AC-STUB-09 — Save a new stub with cache invalidation
**Given** that the preview is valid and the server is online  
**When** the user clicks Save during creation  
**Then** the application must persist the mapping, display visual confirmation, and refresh the list without requiring a manual browser refresh.

### AC-STUB-10 — Edit an existing stub while preserving its identifier
**Given** that an existing stub was opened in edit mode  
**When** the user changes its fields and saves  
**Then** the application must update the same server record, preserve the original `id`, and reflect the change in the list.

### AC-STUB-11 — Duplicate a stub without changing the original
**Given** that the user selected Duplicate on an existing stub  
**When** they save the copy after any adjustments  
**Then** a new stub must be created with a different identifier and the original must remain unchanged.

### AC-STUB-12 — Delete a stub with destructive confirmation
**Given** that the user wants to remove a stub  
**When** they trigger Delete and confirm the operation  
**Then** the application must remove the item from the list, display a success toast, and prevent silent deletion without explicit confirmation.

### AC-STUB-13 — Import a valid JSON mapping collection
**Given** that the user selected a JSON file with multiple valid mappings  
**When** they complete the import flow  
**Then** the application must send the batch to the server, present a summary of the result, and refresh the list with the imported items.

### AC-STUB-14 — Reject invalid or incompatible JSON imports
**Given** that the user tried to import a malformed file or one incompatible with the expected schema  
**When** client-side validation runs  
**Then** the system must block submission to the server and explain which errors must be corrected.

### AC-STUB-15 — Export one or more stubs to reusable JSON
**Given** that the user selected a stub or a filtered set of stubs  
**When** they trigger Export  
**Then** the application must generate JSON suitable for later reuse, preserving relevant WireMock fields and without corrupting special characters.

### AC-STUB-16 — Mark and unmark favorites
**Given** that the stub list is loaded  
**When** the user marks or unmarks a stub as a favorite  
**Then** the interface must immediately reflect the new state and allow later filtering by favorites.

### AC-STUB-17 — Maintain local edit/version history
**Given** that the user has saved or edited a stub more than once in the browser  
**When** they open the item’s local history  
**Then** the application must display locally stored versions with date/time information and allow comparative inspection between them.

### AC-STUB-18 — Compare JSON between versions or between original and duplicate
**Given** that two comparable JSON representations of a stub exist  
**When** the user triggers comparison  
**Then** the UI must show a clear diff by line/key, highlighting additions, removals, and modifications without losing readable indentation.

### AC-STUB-19 — Preserve drafts when saving fails
**Given** that the user finished a valid stub in the wizard  
**When** the API returns an error while saving  
**Then** the completed draft must remain available in the interface for a retry, JSON copy, or export.

### AC-STUB-20 — Signal functional conflicts before publishing
**Given** that the new stub has a URL/matcher very similar to another stub with the same priority  
**When** the user reviews the preview or tries to save  
**Then** the application must warn about possible behavior overlap without improperly blocking an intentional save.

---

## Requests

### AC-REQ-01 — List requests with essential operational columns
**Given** that the request journal is enabled and contains records  
**When** the user opens the Requests module  
**Then** the table must display Time, Method, URL, Matched, Status, Stub, Duration, and Client IP.

### AC-REQ-02 — Filter requests by match status and other attributes
**Given** that matched and unmatched requests exist  
**When** the user applies filters by match state, method, status, or text  
**Then** the list must return only items compatible with all active filters.

### AC-REQ-03 — Open a drawer with complete details
**Given** that the request list is visible  
**When** the user selects a row  
**Then** the interface must open a drawer containing headers, cookies, query, body, response, and raw JSON for the selected request.

### AC-REQ-04 — Re-execute a request via replay
**Given** that a recorded request contains enough data to be replayed  
**When** the user triggers Replay  
**Then** the application must resend the request according to the supported configuration and present the new execution result to the user.

### AC-REQ-05 — Generate a stub from a captured request
**Given** that the user opened the details of a request  
**When** they click Generate Stub  
**Then** the creation wizard must open with the Request step prefilled from the captured data.

### AC-REQ-06 — Export a request or filtered set
**Given** that the user selected a specific request or a filtered subset  
**When** they trigger Export  
**Then** the system must generate a reusable artifact containing the exportable data without omitting fields relevant for auditing.

### AC-REQ-07 — Delete request-journal entries with appropriate confirmation
**Given** that the user wants to clear an individual request or a set of requests  
**When** they confirm deletion  
**Then** removed items must no longer appear in the list and the UI must report that the operation succeeded.

### AC-REQ-08 — Support pagination or infinite scroll without breaking context
**Given** that more requests exist than the initial load limit  
**When** the user loads more results or advances to another page  
**Then** the UI must preserve filters, sorting, and logical navigation position without visually duplicating records.

---

## Near Misses

### AC-NM-01 — Show a near-miss list sortable by similarity
**Given** that unmatched requests exist with close candidate matches  
**When** the user opens Near Misses  
**Then** the list must show similarity score/distance and allow sorting to prioritize the most promising cases.

### AC-NM-02 — Show a visual diff between received request and expected pattern
**Given** that a near miss has been opened in detail  
**When** the UI renders the comparison  
**Then** differences in method, URL, query, headers, and body must be visually highlighted by category.

### AC-NM-03 — Fix an existing stub from a near miss
**Given** that the near miss points to an already registered candidate stub  
**When** the user chooses Fix Stub  
**Then** the application must open editing for the candidate stub with enough context to adjust the divergent matcher.

### AC-NM-04 — Generate a new stub when the divergence indicates new behavior
**Given** that near-miss analysis shows the case should not change the current stub  
**When** the user chooses Generate Stub  
**Then** the application must start a new creation flow using the observed request data as its basis.

### AC-NM-05 — Refresh state after a successful fix
**Given** that a stub was updated and saved from a near miss  
**When** the near-miss list refreshes  
**Then** the fixed item must disappear or have its status changed consistently with the new expected match.

---

## Scenarios

### AC-SCN-01 — Render a graph with the initial STARTED state
**Given** that stateful stubs are registered  
**When** the user opens the Scenarios module  
**Then** the visual editor must represent the `STARTED` state and the other states/transitions derived from the existing mappings.

### AC-SCN-02 — Allow visual creation and editing of transitions
**Given** that the user is in the scenario editor  
**When** they create or change a transition between two states  
**Then** the UI must require a coherent definition of required state, next state, and associated stub.

### AC-SCN-03 — Block publishing of structurally invalid scenarios
**Given** that the scenario contains an orphan state, a transition without a target, or an equivalent inconsistency  
**When** the user tries to save  
**Then** the application must highlight the problems in the graph and block publishing until they are fixed.

### AC-SCN-04 — Reset a scenario to the initial state
**Given** that a scenario has executed transitions and is in a state different from STARTED  
**When** the user triggers Reset State  
**Then** the server and the interface must again reflect the scenario’s initial state.

### AC-SCN-05 — Visually reflect the current state during tests
**Given** that test requests are being executed against a scenario  
**When** a valid transition occurs  
**Then** the editor must highlight the active state and the traversed transition in a way the user can clearly understand.

---

## Recording

### AC-REC-01 — Validate minimum proxy settings before starting
**Given** that the user wants to start a recording session  
**When** `Proxy URL` is missing or invalid  
**Then** the Start button must not begin the session and the interface must explain what needs to be corrected.

### AC-REC-02 — Start and signal an active recording session
**Given** that the proxy settings are valid  
**When** the user clicks Start  
**Then** WireMock must enter recording mode and the interface must clearly change status to Recording.

### AC-REC-03 — Pause and resume without losing session context
**Given** that a recording session is in progress  
**When** the user triggers Pause and later resumes capture  
**Then** the interface must preserve the current batch and correctly reflect switching between Paused and Recording states.

### AC-REC-04 — Generate a reviewable snapshot of captures
**Given** that interactions were captured during the session  
**When** the user triggers Snapshot  
**Then** the application must present a review of the generated stubs before permanently persisting them.

### AC-REC-05 — Allow cleanup and generalization before saving
**Given** that the snapshot contains stubs with variable headers or overly specific matchers  
**When** the user reviews the captured items  
**Then** they must be able to edit, delete, or selectively approve stubs before saving them to the server.

### AC-REC-06 — End a session with a consistent summary
**Given** that the user finished capturing  
**When** they trigger Stop  
**Then** the session must end, status must return to a neutral state, and the interface must display a summary of approved, discarded, or pending captures.

---

## Settings

### AC-SET-01 — Load current global settings values
**Given** that the WireMock server is accessible  
**When** the user opens Settings  
**Then** the form must reflect the current values for Global Delay, Proxy, Extensions, Persistence, Request Journal, and Max Requests.

### AC-SET-02 — Validate numeric and structured fields before saving
**Given** that the user changed a setting  
**When** a field receives an invalid value, such as a negative delay or a non-numeric maximum limit  
**Then** the system must block saving and flag the error on the corresponding field.

### AC-SET-03 — Apply a saved setting without requiring a manual reload
**Given** that the user saved a valid change in Settings  
**When** the API confirms persistence  
**Then** the interface must show confirmation and immediately update impacted modules wherever possible.

### AC-SET-04 — Revert visual state when saving fails
**Given** that an error occurred while saving a setting  
**When** the operation returns an API failure  
**Then** the UI must report that the change was not applied and preserve form context for correction or retry.

### AC-SET-05 — Make the operational impact of critical settings visible
**Given** that the user changed a parameter such as Global Delay or Request Journal  
**When** the change completes successfully  
**Then** the application must make the new behavior observable in dependent modules such as Requests, Logs, or Dashboard.

---

## Files

### AC-FILE-01 — Upload a file to __files with immediate feedback
**Given** that the user is in the Files module  
**When** they upload a valid file  
**Then** the item must appear in the tree/list as soon as the server confirms the operation.

### AC-FILE-02 — Handle filename conflicts on upload
**Given** that a file with the same path/name already exists at the destination  
**When** the user tries to upload a new file with the same name  
**Then** the interface must request overwrite confirmation or a rename alternative before completing the operation.

### AC-FILE-03 — Edit a text file in the integrated editor
**Given** that the user opened a supported text file  
**When** they change the content and save  
**Then** the new version must be persisted and reloaded in the preview/editor without requiring external navigation.

### AC-FILE-04 — Display a coherent preview by file type
**Given** that the user selected a file in `__files`  
**When** the file is textual  
**Then** the application must open a text editor/preview; **and when** it is an image, it must show a visual preview without attempting inappropriate text rendering.

### AC-FILE-05 — Delete a file with an impact warning
**Given** that a file may be referenced by `bodyFileName` in one or more stubs  
**When** the user triggers Delete  
**Then** the destructive confirmation must warn about the potential impact before permanent removal.

---

## Logs

### AC-LOG-01 — Display a chronological timeline of events
**Given** that WireMock and the application generated traceable events  
**When** the user opens Logs  
**Then** the screen must display a chronologically ordered timeline with enough information for operational diagnosis.

### AC-LOG-02 — Filter logs by HTTP method
**Given** that the timeline contains events associated with different methods  
**When** the user applies a method filter  
**Then** only events compatible with that filter must remain visible.

### AC-LOG-03 — Combine status, time-range, and type filters
**Given** that the user needs to investigate a specific subset of events  
**When** they combine status, time range, and type filters  
**Then** the timeline must apply all filters together and keep a consistent result count.

### AC-LOG-04 — Refresh the timeline without losing active filters
**Given** that Logs uses polling or manual refresh  
**When** new events arrive while filters are applied  
**Then** the list must update while keeping the active filters and without unexpectedly repositioning the user.

### AC-LOG-05 — Handle no-event and load-error states
**Given** that no events exist for the filtered period or the query fails  
**When** the timeline finishes processing the search  
**Then** the UI must clearly distinguish an empty state from an error state, offering a retry action where appropriate.

---

## Cross-cutting UX requirements

### AC-UX-01 — Switch between Light, Dark, and System themes with local persistence
**Given** that the user is in any application module  
**When** they change the theme in the global selector  
**Then** the new preference must be applied immediately, persisted in LocalStorage, and reapplied on future visits.

### AC-UX-02 — Preserve usability in responsive layouts
**Given** that the user accesses the application on a narrow viewport or a mobile/tablet device  
**When** they navigate across the main modules  
**Then** menus, tables, drawers, and forms must remain usable without truncating critical actions.

### AC-UX-03 — Provide relevant keyboard shortcuts
**Given** that the user is operating via keyboard  
**When** they trigger supported shortcuts such as Ctrl/Cmd+K  
**Then** the application must respond with the corresponding action without conflicting with text inputs or browser navigation.

### AC-UX-04 — Confirm destructive actions before execution
**Given** that the user attempts to delete a stub, request, file, or another destructive resource  
**When** they trigger the operation  
**Then** the interface must display explicit confirmation before executing the API call.

### AC-UX-05 — Show toast feedback for relevant operations
**Given** that the user completed a create, edit, import, export, delete, or operational error flow  
**When** the operation finishes  
**Then** the application must show a contextual success, warning, or error toast with an objective, actionable message.

### AC-UX-06 — Differentiate loading, empty, and error states
**Given** that any module depends on asynchronous loading  
**When** the query is in progress, returns no data, or fails  
**Then** the interface must display, respectively, skeleton/loading UI, an instructive empty state, or an error state with retry, without visual ambiguity.

### AC-UX-07 — Preserve drafts and context during transient failures
**Given** that the user is editing a stub, file, settings, or recording review  
**When** a transient network failure or temporary WireMock outage occurs  
**Then** the application must preserve as much local context as possible and avoid silent loss of work in progress.

---

## Final notes

The criteria above should serve as the basis for manual testing, automated integration/E2E suites, and readiness validation. Any implementation that only partially covers the flows, but does not satisfy these observable behaviors, must be considered functionally incomplete.

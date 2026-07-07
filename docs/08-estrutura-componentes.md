# 08 — React Component Structure

> Part of the Complete Technical Specification for **WireMock Studio Open Source**
> Full index in [`README.md`](./README.md)
> Complements [`01-arquitetura-frontend.md`](./01-arquitetura-frontend.md) with a feature-by-feature component breakdown.

---

## 1. Root Components (`app/`)

```
<App>
├── <QueryProvider>              # QueryClientProvider
│   └── <ThemeProvider>          # Light/Dark/System
│       └── <RouterProvider>     # React Router data router
│           └── <RootLayout>
│               ├── <AppHeader />
│               ├── <AppSidebar />
│               └── <Outlet />   # renders the active Page
└── <Toaster />                  # sonner, mounted once at the root
```

## 2. `widgets/app-header`

```tsx
<AppHeader>
  <Logo />
  <GlobalSearch />              // cmdk — Cmd/Ctrl+K, searches stubs/requests/scenarios
  <ServerStatusIndicator />     // green/red dot + version, based on useServerHealth()
  <ThemeToggle />               // Light/Dark/System dropdown
  {/* No built-in authentication in v1 — placeholder "About/Help" menu instead of a user menu */}
  <HelpMenu />
</AppHeader>
```

**Main props**: none (self-contained widget, consumes hooks internally).

## 3. `widgets/app-sidebar`

```tsx
<AppSidebar collapsed={isCollapsed} onToggle={...}>
  <NavItem icon={LayoutDashboard} to="/dashboard" label="Dashboard" />
  <NavItem icon={Webhook} to="/mappings" label="Stub Mappings" badge={totalMappings} />
  <NavItem icon={Activity} to="/requests" label="Requests" badge={unmatchedCount} badgeVariant="warning" />
  <NavItem icon={Crosshair} to="/near-misses" label="Near Misses" />
  <NavItem icon={GitBranch} to="/scenarios" label="Scenarios" />
  <NavItem icon={Radio} to="/recording" label="Recording" active={isRecording} />
  <NavItem icon={Settings} to="/settings" label="Settings" />
  <NavItem icon={FolderOpen} to="/files" label="Files" />
  <NavItem icon={ScrollText} to="/logs" label="Logs" />
</AppSidebar>
```

The active `NavItem` is derived from `useLocation()` (React Router), not from its own state.

## 4. Feature: Stub Mappings

### 4.1 Listing Page

```tsx
<StubMappingsListPage>
  <PageHeader title="Stub Mappings" actions={<CreateStubMappingButton />} />
  <StubMappingTable>              {/* widgets/stub-mapping-table */}
    <TableToolbar>
      <SearchInput />              {/* debounce 300ms, synced with the URL */}
      <MethodFilter />
      <FavoritesFilter />
      <BulkActionsMenu />          {/* delete selected, export selected */}
    </TableToolbar>
    <DataTable columns={stubMappingColumns} data={mappings} />
    <TablePagination />
  </StubMappingTable>
</StubMappingsListPage>
```

Columns (`stubMappingColumns`): `<FavoriteToggle>`, `<HttpMethodBadge>`, URL/Pattern, Response Status, Priority, Scenario, `<RowActionsMenu>` (Edit, Duplicate, Export, Delete).

### 4.2 Create/Edit Wizard

```tsx
<StubMappingEditorPage>
  <StubMappingWizard mode="create" | "edit" defaultValues={...}>
    <WizardTabs>
      <TabsList>
        <TabsTrigger value="request">Request</TabsTrigger>
        <TabsTrigger value="response">Response</TabsTrigger>
        <TabsTrigger value="metadata">Metadata</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <RequestTab>
        <MethodSelect /> <UrlMatchModeSelect /> <UrlInput />
        <HeaderMatchersEditor />
        <QueryParamMatchersEditor />
        <CookieMatchersEditor />
        <BodyPatternsEditor />        {/* matcher list: equalTo, contains, matchesJsonPath, ... */}
        <BasicAuthFields />
        <PriorityInput />
      </RequestTab>

      <ResponseTab>
        <StatusCodeInput /> <StatusMessageInput />
        <ResponseHeadersEditor />
        <BodyModeToggle />            {/* Text | JSON | Base64 | File */}
        <JsonEditor />                {/* Monaco, conditional on BodyMode */}
        <DelaySettings />             {/* fixedDelay | distribution */}
        <ChunkedDribbleSettings />
        <FaultSelect />
        <ProxySettings />             {/* proxyBaseUrl, transformers */}
      </ResponseTab>

      <MetadataTab>
        <NameInput /> <TagsInput />
        <ScenarioFields />            {/* scenarioName, requiredState, newState */}
        <PersistentToggle />
        <MetadataEditor />            {/* free-form JSON, Monaco */}
      </MetadataTab>

      <PreviewTab>
        <JsonEditor readOnly value={generatedStubMappingJson} />
        <ValidationErrorsList />
        <CopyToClipboardButton />
      </PreviewTab>
    </WizardTabs>

    <WizardFooter>
      <CancelButton /> <SaveButton loading={isPending} />
    </WizardFooter>
  </StubMappingWizard>
</StubMappingEditorPage>
```

**Form state**: `useStubMappingForm()` (RHF + Zod resolver) shared across all 4 tabs via RHF's `FormProvider` — each tab uses `useFormContext()`.

### 4.3 Other Module Features

- `DeleteStubMappingDialog` — confirmation `AlertDialog`, used in both the listing and the editor.
- `DuplicateStubMappingAction` — clones the object, opens the wizard in `create` mode with prefilled `defaultValues` and removed `id`.
- `ImportMappingsDialog` — `.json` file upload, preview of what will be imported, and an "overwrite existing" option.
- `ExportStubMappingsAction` — downloads a `.json` file (one mapping or all selected mappings).
- `FavoriteToggle` — star icon, saves/removes from LocalStorage (`useFavoriteStubMappings`).

## 5. Feature: Requests

```tsx
<RequestsPage>
  <PageHeader title="Requests" actions={<ClearJournalButton />} />
  <RequestTable>
    <TableToolbar>
      <SearchInput /> <MethodFilter /> <MatchedFilter /> <DateRangeFilter /> <LiveTailToggle />
    </TableToolbar>
    <DataTable columns={requestColumns} onRowClick={openDetailDrawer} />
    <InfiniteScrollTrigger />       {/* or TablePagination, to be decided during implementation */}
  </RequestTable>

  <RequestDetailDrawer open={!!selectedRequestId} onClose={...}>
    <Tabs>
      <TabsTrigger value="request">Request</TabsTrigger>
      <TabsTrigger value="response">Response</TabsTrigger>
      <TabsTrigger value="raw">Raw JSON</TabsTrigger>
    </Tabs>
    <DrawerActions>
      <ReplayRequestButton />
      <GenerateStubFromRequestButton />
      <ExportRequestButton />
      <DeleteRequestButton />
    </DrawerActions>
  </RequestDetailDrawer>
</RequestsPage>
```

## 6. Feature: Near Misses

```tsx
<NearMissesPage>
  <PageHeader title="Near Misses" />
  <NearMissList>
    <NearMissListItem similarityScore={0.87} />   {/* visual progress bar for the score */}
  </NearMissList>
  <NearMissDiffPanel>                              {/* widgets/near-miss-diff */}
    <DiffViewer left={expectedRequestPattern} right={actualRequest} />
    <GenerateStubFromNearMissButton />
  </NearMissDiffPanel>
</NearMissesPage>
```

## 7. Feature: Scenarios

```tsx
<ScenariosPage>
  <PageHeader title="Scenarios" actions={<ResetAllScenariosButton />} />
  <ScenarioSelector />                {/* list of existing scenarios */}
  <ScenarioGraph>                     {/* widgets/scenario-graph, React Flow */}
    <StateNode data={{ name: 'Started', isCurrent: true }} />
    <TransitionEdge label="requiredState → newState" />
  </ScenarioGraph>
  <ScenarioSidePanel>
    <ResetScenarioButton />
    <RelatedStubMappingsList />        {/* stubs associated with this scenario */}
  </ScenarioSidePanel>
</ScenariosPage>
```

## 8. Feature: Recording

```tsx
<RecordingPage>
  <RecordingStatusCard status={recordingStatus} />   {/* NeverStarted | Recording | Stopped */}
  <RecordingControls>
    <StartRecordingDialog>          {/* configures targetBaseUrl, filters, captureHeaders */}
    <PauseButton /> <StopButton /> <SnapshotButton />
  </RecordingControls>
  <RecordedStubsPreviewList>         {/* after stop/snapshot, review before persisting */}
    <StubPreviewItem editable />
  </RecordedStubsPreviewList>
</RecordingPage>
```

## 9. Feature: Settings

```tsx
<SettingsPage>
  <SettingsForm>                      {/* RHF + Zod */}
    <FixedDelayInput /> <DelayDistributionFields />
    <ProxyPassThroughSwitch />
    <RequestJournalMaxSizeInput />
    <ExtensionsList readOnly />
  </SettingsForm>
</SettingsPage>
```

## 10. Feature: Files

```tsx
<FilesPage>
  <FileTree />                        {/* recursive __files tree */}
  <FileEditorPanel>
    <JsonEditor language={detectedLanguage} />   {/* JSON/XML/HTML/TXT */}
    <ImagePreview />                              {/* when the file is an image */}
    <SaveFileButton /> <DeleteFileButton />
  </FileEditorPanel>
  <UploadFileDialog />
</FilesPage>
```

## 11. Feature: Logs

```tsx
<LogsPage>
  <LogsFilterSidebar>
    <MethodFilter /> <StatusFilter /> <TimeRangeFilter /> <TypeFilter />
  </LogsFilterSidebar>
  <LogsTimeline>
    <LogsTimelineItem />
  </LogsTimeline>
</LogsPage>
```

## 12. Shared Components (`shared/ui`) — Props Contracts

```ts
// http-method-badge.tsx
type HttpMethodBadgeProps = { method: HttpMethod; className?: string };

// status-code-badge.tsx
type StatusCodeBadgeProps = { status: number; className?: string };

// json-editor.tsx
type JsonEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  language?: 'json' | 'xml' | 'html' | 'plaintext';
  readOnly?: boolean;
  height?: number | string;
  onValidate?: (markers: MonacoMarker[]) => void;
};

// diff-viewer.tsx
type DiffViewerProps = { original: string; modified: string; language?: string };

// metadata-editor.tsx
type MetadataEditorProps = { value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void };

// empty-state.tsx
type EmptyStateProps = { icon: LucideIcon; title: string; description?: string; action?: ReactNode };

// page-header.tsx
type PageHeaderProps = { title: string; description?: string; actions?: ReactNode; breadcrumbs?: BreadcrumbItem[] };
```

## 13. Composition Rules

- Components in `widgets` and `features` **do not fetch directly** — they always go through `entities` hooks.
- A `pages` component is as "dumb" as possible: it only composes widgets/features and passes route data (params/query string).
- Tables always use `@tanstack/react-table` internally, encapsulated in a reusable generic component `shared/ui/data-table.tsx`, reused by `StubMappingTable`, `RequestTable`, and others.

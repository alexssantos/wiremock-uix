# WireMock Dashboard UI Specification

> Target: **WireMock Server v3.9.1**

## Goal

Build a modern web application for complete WireMock management using
exclusively the official administrative API
(`/__admin`).

## Stack

-   React
-   TypeScript
-   Vite
-   shadcn/ui
-   Tailwind CSS
-   TanStack Query
-   React Router
-   React Hook Form
-   Zod
-   Monaco Editor
-   React Flow
-   Recharts
-   Lucide Icons

## Layout

    +-------------------------------------------------------------+
    | Header                                                      |
    | Logo | Search | Server Status | Theme | User                |
    +-------------------+-----------------------------------------+
    | Sidebar           |                                         |
    | Dashboard         |                                         |
    | Stub Mappings     |                                         |
    | Requests          |              Main Content               |
    | Near Misses       |                                         |
    | Scenarios         |                                         |
    | Recording         |                                         |
    | Settings          |                                         |
    | Files             |                                         |
    | Logs              |                                         |
    +-------------------+-----------------------------------------+

## Themes

-   Light
-   Dark
-   System

Persisted in LocalStorage.

------------------------------------------------------------------------

# Dashboard

## Cards

-   Total Stubs
-   Received Requests
-   Unmatched Requests
-   Near Misses
-   Scenarios
-   Recording Status
-   Server Version
-   Memory Usage

## Charts

-   Requests per minute
-   HTTP Methods
-   Status Codes
-   Top URLs

------------------------------------------------------------------------

# Implementation Plan

## Stage 1 --- Stub Mappings

### Endpoints

-   GET /\_\_admin/mappings
-   GET /\_\_admin/mappings/{id}
-   POST /\_\_admin/mappings
-   PUT /\_\_admin/mappings/{id}
-   DELETE /\_\_admin/mappings/{id}
-   POST /\_\_admin/mappings/import
-   POST /\_\_admin/mappings/find-by-metadata
-   DELETE /\_\_admin/mappings
-   POST /\_\_admin/mappings/reset

### Features

-   Listing
-   Search
-   Filters
-   Pagination
-   CRUD
-   Duplicate
-   Clone
-   Import
-   Export
-   Favorites
-   History
-   JSON Comparison

### Wizard

#### Request

-   Method
-   URL
-   URL Pattern
-   Headers
-   Cookies
-   Query Params
-   Body
-   Multipart
-   Authentication
-   Priority

#### Response

-   Status
-   Headers
-   Body
-   Body File
-   Delay
-   Random Delay
-   Chunked Dribble
-   Fault

#### Metadata

-   Tags
-   Scenario
-   Persistent
-   Description
-   Custom Metadata

#### Preview

-   Monaco Editor
-   Pretty JSON
-   Validation
-   Generate JSON

------------------------------------------------------------------------

## Stage 2 --- Requests

### Endpoints

-   GET /\_\_admin/requests
-   POST /\_\_admin/requests/find
-   DELETE /\_\_admin/requests
-   GET /\_\_admin/requests/unmatched

### Features

Table:

-   Time
-   Method
-   URL
-   Matched
-   Status
-   Stub
-   Duration
-   Client IP

Drawer:

-   Headers
-   Cookies
-   Query
-   Body
-   Response
-   Raw JSON

Actions:

-   Replay
-   Generate Stub
-   Export
-   Delete

------------------------------------------------------------------------

## Stage 3 --- Near Misses

### Endpoints

-   GET /\_\_admin/requests/unmatched/near-misses
-   POST /\_\_admin/near-misses/request
-   POST /\_\_admin/near-misses/request-pattern

### Features

-   Similarity List
-   Distance Score
-   Diff between Expected and Received Request
-   Automatic Correction
-   Generate Stub

------------------------------------------------------------------------

## Stage 4 --- Scenarios

React Flow

-   States
-   Transitions
-   STARTED
-   Required State
-   Next State

------------------------------------------------------------------------

## Stage 5 --- Recording

### Features

-   Start
-   Pause
-   Stop
-   Snapshot

Settings

-   Proxy URL
-   Capture Headers
-   Capture Body
-   Ignore Hosts

------------------------------------------------------------------------

## Stage 6 --- Settings

-   Global Delay
-   Proxy
-   Extensions
-   Persistence
-   Request Journal
-   Max Requests

------------------------------------------------------------------------

## Stage 7 --- Files

`__files` explorer

-   JSON
-   XML
-   HTML
-   TXT
-   Images

Integrated editor.

------------------------------------------------------------------------

## Stage 8 --- Logs

Timeline

Filters

-   Method
-   Status
-   Time
-   Type

------------------------------------------------------------------------

# Shared Components

-   JSON Editor
-   Diff Viewer
-   Metadata Editor
-   HTTP Badge
-   Status Badge
-   Request Viewer
-   Import Wizard
-   Export Wizard

------------------------------------------------------------------------

# Services

    WiremockApi

    MappingService
    RequestService
    NearMissService
    ScenarioService
    RecordingService
    SettingsService
    FileService

------------------------------------------------------------------------

# UX Requirements

-   Instant search
-   Skeleton loading
-   Optimistic updates
-   Toasts
-   Undo
-   Confirmation for destructive actions
-   Responsiveness
-   Dark/Light Mode
-   Filter persistence
-   Keyboard shortcuts

------------------------------------------------------------------------

# Future Roadmap

-   Visual Matcher Editor
-   AI for Stub Generation
-   Versioning
-   Git Sync
-   Collections
-   Tags
-   Test Runner
-   Live Monitoring
-   Analytics

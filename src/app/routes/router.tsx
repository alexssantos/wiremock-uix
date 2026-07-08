import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "@/app/layouts/RootLayout";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { StubMappingsListPage } from "@/pages/stub-mappings/StubMappingsListPage";
import { StubMappingEditorPage } from "@/pages/stub-mappings/StubMappingEditorPage";
import { RequestsPage } from "@/pages/requests/RequestsPage";
import { NearMissesPage } from "@/pages/near-misses/NearMissesPage";
import { ScenariosPage } from "@/pages/scenarios/ScenariosPage";
import { RecordingPage } from "@/pages/recording/RecordingPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { FilesPage } from "@/pages/files/FilesPage";
import { LogsPage } from "@/pages/logs/LogsPage";
import { TemplatesPage } from "@/pages/templates/TemplatesPage";
import { TemplateEditorPage } from "@/pages/templates/TemplateEditorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "mappings", element: <StubMappingsListPage /> },
      { path: "mappings/new", element: <StubMappingEditorPage /> },
      { path: "mappings/:id", element: <StubMappingEditorPage /> },
      { path: "templates", element: <TemplatesPage /> },
      { path: "templates/new", element: <TemplateEditorPage /> },
      { path: "templates/:id", element: <TemplateEditorPage /> },
      { path: "requests", element: <RequestsPage /> },
      { path: "near-misses", element: <NearMissesPage /> },
      { path: "scenarios", element: <ScenariosPage /> },
      { path: "recording", element: <RecordingPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "files/*", element: <FilesPage /> },
      { path: "logs", element: <LogsPage /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);

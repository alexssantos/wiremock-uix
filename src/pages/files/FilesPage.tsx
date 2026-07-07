import { AlertCircleIcon, FolderOpenIcon } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFiles } from "@/entities/file";
import { UploadFileDialog } from "@/features/upload-file";
import { FileEditorPanel } from "@/widgets/file-editor-panel";
import { FileTree } from "@/widgets/file-tree";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

function decodeWildcardPath(path: string | undefined) {
  if (!path) {
    return undefined;
  }

  try {
    return path
      .split("/")
      .map((segment) => decodeURIComponent(segment))
      .join("/");
  } catch {
    return path;
  }
}

function encodeWildcardPath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The operation could not be completed. Please try again.";
}

export function FilesPage() {
  const navigate = useNavigate();
  const params = useParams();
  const filesQuery = useFiles();
  const routeFilePath = decodeWildcardPath(params["*"]);

  const selectedFilePath = useMemo(() => {
    if (!routeFilePath || !filesQuery.data) {
      return undefined;
    }

    return filesQuery.data.files.some((file) => file.name === routeFilePath) ? routeFilePath : undefined;
  }, [filesQuery.data, routeFilePath]);

  const headerActions = <UploadFileDialog onUploaded={(filePath) => navigate(`/files/${encodeWildcardPath(filePath)}`)} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Files" description="Browse, preview, and edit the contents of WireMock __files." actions={headerActions} />

      {filesQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Could not load the files.</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(filesQuery.error)}</p>
            <Button className="mt-2" type="button" variant="outline" onClick={() => void filesQuery.refetch()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : filesQuery.isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="h-[32rem] animate-pulse bg-muted" />
          <Card className="h-[32rem] animate-pulse bg-muted" />
        </div>
      ) : !filesQuery.data || filesQuery.data.files.length === 0 ? (
        <EmptyState
          action={<UploadFileDialog buttonLabel="Create your first file" onUploaded={(filePath) => navigate(`/files/${encodeWildcardPath(filePath)}`)} />}
          description="Upload a file to populate WireMock __files and start working with the virtual tree."
          icon={FolderOpenIcon}
          title="No files found."
        />
      ) : (
        <div className="space-y-4">
          {routeFilePath && !selectedFilePath ? (
            <Alert>
              <AlertCircleIcon />
              <AlertTitle>Selected file not found</AlertTitle>
              <AlertDescription>The requested file is no longer available in WireMock.</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <FileTree
              nodes={filesQuery.data.tree}
              selectedPath={selectedFilePath}
              onSelect={(filePath) => navigate(`/files/${encodeWildcardPath(filePath)}`)}
            />
            <FileEditorPanel selectedFilePath={selectedFilePath} onDeleteSuccess={() => navigate("/files")} />
          </div>
        </div>
      )}
    </div>
  );
}

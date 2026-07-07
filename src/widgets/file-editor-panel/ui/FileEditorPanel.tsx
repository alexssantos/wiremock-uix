import { AlertCircleIcon, FileTextIcon, ImageIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDeleteFile, useFileContent, useSaveFile } from "@/entities/file";
import { env } from "@/shared/config/env";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { JsonEditor } from "@/shared/ui/json-editor";

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp"]);

function isImageFile(filePath: string) {
  const extension = filePath.split(".").pop()?.toLowerCase();
  return Boolean(extension && IMAGE_EXTENSIONS.has(extension));
}

function detectLanguage(filePath: string): "json" | "xml" | "html" | "plaintext" {
  const extension = filePath.split(".").pop()?.toLowerCase();

  if (extension === "json") {
    return "json";
  }

  if (extension === "xml") {
    return "xml";
  }

  if (extension === "html" || extension === "htm") {
    return "html";
  }

  return "plaintext";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The operation could not be completed. Please try again.";
}

function buildFilePreviewUrl(filePath: string) {
  const encodedSegments = filePath.split("/").map((segment) => encodeURIComponent(segment));
  return `${env.wiremockBaseUrl}/__files/${encodedSegments.join("/")}`;
}

type FileEditorPanelProps = {
  selectedFilePath?: string;
  onDeleteSuccess?: (filePath: string) => void;
};

export function FileEditorPanel({ selectedFilePath, onDeleteSuccess }: FileEditorPanelProps) {
  const saveFile = useSaveFile();
  const deleteFile = useDeleteFile();
  const [draft, setDraft] = useState("");

  const imageFileSelected = selectedFilePath ? isImageFile(selectedFilePath) : false;
  const fileIdForQuery = selectedFilePath && !imageFileSelected ? selectedFilePath : "";
  const fileContentQuery = useFileContent(fileIdForQuery);

  const fileLanguage = useMemo(() => {
    if (!selectedFilePath) {
      return "plaintext";
    }

    return detectLanguage(selectedFilePath);
  }, [selectedFilePath]);

  useEffect(() => {
    if (!selectedFilePath) {
      setDraft("");
      return;
    }

    if (!imageFileSelected && fileContentQuery.data !== undefined) {
      setDraft(fileContentQuery.data);
    }
  }, [fileContentQuery.data, imageFileSelected, selectedFilePath]);

  if (!selectedFilePath) {
    return (
      <Card className="min-h-[32rem]">
        <CardContent className="flex h-full items-center justify-center py-16">
          <EmptyState
            icon={FileTextIcon}
            title="Select a file to get started."
            description="Choose a file from the tree to view, preview, or edit its contents."
          />
        </CardContent>
      </Card>
    );
  }

  const sourceContent = fileContentQuery.data ?? "";
  const isDirty = !imageFileSelected && draft !== sourceContent;

  const handleSave = async () => {
    if (!selectedFilePath || imageFileSelected) {
      return;
    }

    await saveFile.mutateAsync({ fileId: selectedFilePath, content: draft });
  };

  const handleDelete = async () => {
    await deleteFile.mutateAsync(selectedFilePath);
    onDeleteSuccess?.(selectedFilePath);
  };

  return (
    <Card className="min-h-[32rem]">
      <CardHeader className="border-b">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="break-all text-base">{selectedFilePath}</CardTitle>
            <Badge variant="outline">{imageFileSelected ? "Preview" : fileLanguage.toUpperCase()}</Badge>
          </div>
          <CardDescription>
            {imageFileSelected
              ? "Image files are displayed as a live preview from __files."
              : "Edit the file contents and save them back to WireMock."}
          </CardDescription>
        </div>
        <CardAction className="flex flex-wrap gap-2">
          <Button disabled={imageFileSelected || !isDirty || saveFile.isPending || fileContentQuery.isLoading} onClick={() => void handleSave()}>
            <SaveIcon />
            {saveFile.isPending ? "Saving..." : "Save"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={deleteFile.isPending} variant="destructive">
                <Trash2Icon />
                {deleteFile.isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete file</AlertDialogTitle>
                <AlertDialogDescription>
                  Do you want to delete this file? This action is permanent.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => void handleDelete()}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {imageFileSelected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="size-4" />
              <span>Preview-only mode</span>
            </div>
            <div className="overflow-hidden rounded-lg border bg-muted/20 p-4">
              <img alt={selectedFilePath} className="max-h-[calc(100vh-24rem)] w-full object-contain" src={buildFilePreviewUrl(selectedFilePath)} />
            </div>
          </div>
        ) : fileContentQuery.isLoading ? (
          <div className="h-[calc(100vh-24rem)] min-h-[20rem] animate-pulse rounded-lg bg-muted" />
        ) : fileContentQuery.isError ? (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Could not load the file.</AlertTitle>
            <AlertDescription>
              <p>{getErrorMessage(fileContentQuery.error)}</p>
              <Button className="mt-2" type="button" variant="outline" onClick={() => void fileContentQuery.refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {isDirty ? <p className="text-sm text-muted-foreground">You have unsaved changes.</p> : null}
            <JsonEditor height="calc(100vh - 24rem)" language={fileLanguage} value={draft} onChange={setDraft} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

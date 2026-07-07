import { UploadIcon } from "lucide-react";
import { useState } from "react";
import { useUploadFile } from "@/entities/file";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

type UploadFileDialogProps = {
  onUploaded?: (filePath: string) => void;
  buttonLabel?: string;
};

export function UploadFileDialog({ onUploaded, buttonLabel = "Upload file" }: UploadFileDialogProps) {
  const uploadFile = useUploadFile();
  const [open, setOpen] = useState(false);
  const [targetPath, setTargetPath] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | undefined>();

  const resetState = () => {
    setTargetPath("");
    setSelectedFile(null);
    setValidationMessage(undefined);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetState();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setValidationMessage("Choose a local file to upload.");
      return;
    }

    const normalizedPath = targetPath.trim();
    if (!normalizedPath) {
      setValidationMessage("Enter a target file path.");
      return;
    }

    const result = await uploadFile.mutateAsync({ file: selectedFile, targetPath: normalizedPath });
    onUploaded?.(result.fileId);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UploadIcon />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>
            Choose a local file and the target path inside <code>__files</code>. Use <code>/</code> to create virtual
            folders.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="target-file-path">Target file path</Label>
            <Input
              id="target-file-path"
              placeholder="examples/response.json"
              value={targetPath}
              onChange={(event) => {
                setTargetPath(event.target.value);
                setValidationMessage(undefined);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="local-file">Local file</Label>
            <Input
              id="local-file"
              type="file"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setSelectedFile(nextFile);
                setValidationMessage(undefined);

                if (nextFile && !targetPath) {
                  setTargetPath(nextFile.name);
                }
              }}
            />
          </div>

          {validationMessage ? <p className="text-sm text-destructive">{validationMessage}</p> : null}

          <DialogFooter>
            <Button disabled={uploadFile.isPending} type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={uploadFile.isPending} type="submit">
              {uploadFile.isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

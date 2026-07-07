import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteFile, saveFileContent } from "@/entities/file/api/file-api";
import { queryKeys } from "@/shared/api/query-keys";

type SaveFileInput = {
  fileId: string;
  content: string;
};

type UploadFileInput = {
  file: File;
  targetPath: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The operation could not be completed. Please try again.";
}

export function useSaveFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, fileId }: SaveFileInput) => {
      await saveFileContent(fileId, content);
      return { content, fileId };
    },
    onSuccess: async ({ content, fileId }) => {
      queryClient.setQueryData(queryKeys.files.detail(fileId), content);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.files.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.files.detail(fileId) }),
      ]);
      toast.success("File saved successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      await deleteFile(fileId);
      return fileId;
    },
    onSuccess: async (fileId) => {
      queryClient.removeQueries({ queryKey: queryKeys.files.detail(fileId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.files.list() });
      toast.success("File deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, targetPath }: UploadFileInput) => {
      const normalizedTargetPath = targetPath.trim();
      const content = await file.text();
      await saveFileContent(normalizedTargetPath, content);
      return {
        content,
        fileId: normalizedTargetPath,
      };
    },
    onSuccess: async ({ content, fileId }) => {
      queryClient.setQueryData(queryKeys.files.detail(fileId), content);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.files.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.files.detail(fileId) }),
      ]);
      toast.success("File uploaded successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

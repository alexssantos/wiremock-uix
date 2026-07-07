import { useQuery } from "@tanstack/react-query";
import { fetchAllFileNames, fetchFileContent } from "@/entities/file/api/file-api";
import { buildFileTree } from "@/entities/file/model/build-file-tree";
import { queryKeys } from "@/shared/api/query-keys";

export function useFiles() {
  return useQuery({
    queryKey: queryKeys.files.list(),
    queryFn: ({ signal }) => fetchAllFileNames(signal),
    select: (files) => ({
      files,
      tree: buildFileTree(files.map((file) => file.name)),
    }),
  });
}

export function useFileContent(fileId: string) {
  return useQuery({
    queryKey: queryKeys.files.detail(fileId),
    queryFn: ({ signal }) => fetchFileContent(fileId, signal),
    enabled: Boolean(fileId),
  });
}

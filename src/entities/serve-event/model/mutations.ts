import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteAllRequests, deleteRequestById } from "@/entities/serve-event/api/serve-event-api";
import { queryKeys } from "@/shared/api/query-keys";

async function invalidateRequestQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.requests.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.nearMisses.all }),
  ]);
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRequestById(id),
    onSuccess: async () => {
      toast.success("Request deleted.");
      await invalidateRequestQueries(queryClient);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete the request.");
    },
  });
}

export function useClearRequestJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAllRequests(),
    onSuccess: async () => {
      toast.success("Request journal cleared.");
      await invalidateRequestQueries(queryClient);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to clear the request journal.");
    },
  });
}

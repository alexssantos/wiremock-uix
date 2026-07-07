import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateGlobalSettings } from "@/entities/settings/api/settings-api";
import type { GlobalSettings } from "@/entities/settings/model/types";
import { queryKeys } from "@/shared/api/query-keys";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The operation could not be completed. Please try again.";
}

export function useUpdateGlobalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: GlobalSettings) => updateGlobalSettings(settings),
    onSuccess: async (_data, settings) => {
      queryClient.setQueryData(queryKeys.settings.global(), settings);
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings.global() });
      toast.success("Settings updated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

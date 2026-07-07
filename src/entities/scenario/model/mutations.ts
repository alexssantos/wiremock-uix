import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resetAllScenarios } from "@/entities/scenario/api/scenario-api";
import { queryKeys } from "@/shared/api/query-keys";

export function useResetAllScenarios() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetAllScenarios(),
    onSuccess: async () => {
      toast.success("All scenarios were reset.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.scenarios.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to reset the scenarios.";
}

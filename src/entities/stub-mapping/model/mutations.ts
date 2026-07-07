import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/api/query-keys";
import {
  createStubMapping,
  deleteStubMapping,
  importStubMappings,
  updateStubMapping,
} from "@/entities/stub-mapping/api/stub-mapping-api";
import type { ImportStubMappingsRequest, StubMapping, StubMappingsListResponse } from "@/entities/stub-mapping/model/types";

type QuerySnapshot = Array<[QueryKey, StubMappingsListResponse | undefined]>;

type CreateContext = {
  optimisticId: string;
  previous: QuerySnapshot;
};

type UpdateVariables = {
  id: string;
  stubMapping: StubMapping;
};

type UpdateContext = {
  previous: QuerySnapshot;
  previousDetail?: StubMapping;
};

type DeleteContext = {
  previous: QuerySnapshot;
  previousDetail?: StubMapping;
};

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function restoreSnapshots(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshots: QuerySnapshot,
) {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}

function updateListCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (response: StubMappingsListResponse) => StubMappingsListResponse,
) {
  queryClient.setQueriesData<StubMappingsListResponse>({ queryKey: queryKeys.stubMappings.lists() }, (current) => {
    if (!current) {
      return current;
    }

    return updater(current);
  });
}

function stripIdentity(stubMapping: StubMapping): StubMapping {
  const duplicate = { ...stubMapping };
  delete duplicate.id;
  delete duplicate.uuid;
  return duplicate;
}

export function useCreateStubMapping() {
  const queryClient = useQueryClient();

  return useMutation<StubMapping, unknown, StubMapping, CreateContext>({
    mutationFn: (stubMapping) => createStubMapping(stubMapping),
    onMutate: async (stubMapping) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.stubMappings.lists() });
      const previous = queryClient.getQueriesData<StubMappingsListResponse>({ queryKey: queryKeys.stubMappings.lists() });
      const optimisticId = stubMapping.id ?? stubMapping.uuid ?? `optimistic-${Date.now()}`;
      const optimisticStubMapping: StubMapping = {
        ...stubMapping,
        id: optimisticId,
        uuid: stubMapping.uuid ?? optimisticId,
      };

      updateListCaches(queryClient, (current) => ({
        ...current,
        mappings: [optimisticStubMapping, ...current.mappings],
        meta: {
          ...current.meta,
          total: current.meta.total + 1,
        },
      }));

      return {
        optimisticId,
        previous,
      };
    },
    onError: (error, _stubMapping, context) => {
      if (context) {
        restoreSnapshots(queryClient, context.previous);
      }

      toast.error(getErrorMessage(error, "Unable to create the stub mapping. The optimistic update was reverted."));
    },
    onSuccess: (createdStubMapping, _stubMapping, context) => {
      updateListCaches(queryClient, (current) => ({
        ...current,
        mappings: current.mappings.map((mapping) =>
          mapping.id === context.optimisticId || mapping.uuid === context.optimisticId ? createdStubMapping : mapping,
        ),
      }));

      const detailId = createdStubMapping.id ?? createdStubMapping.uuid;
      if (detailId) {
        queryClient.setQueryData(queryKeys.stubMappings.detail(detailId), createdStubMapping);
      }

      toast.success("Stub mapping created successfully.");
    },
    onSettled: (createdStubMapping) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stubMappings.lists() });

      const detailId = createdStubMapping?.id ?? createdStubMapping?.uuid;
      if (detailId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.stubMappings.detail(detailId) });
      }
    },
  });
}

export function useUpdateStubMapping() {
  const queryClient = useQueryClient();

  return useMutation<StubMapping, unknown, UpdateVariables, UpdateContext>({
    mutationFn: ({ id, stubMapping }) => updateStubMapping(id, stubMapping),
    onMutate: async ({ id, stubMapping }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.stubMappings.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.stubMappings.detail(id) });

      const previous = queryClient.getQueriesData<StubMappingsListResponse>({ queryKey: queryKeys.stubMappings.lists() });
      const previousDetail = queryClient.getQueryData<StubMapping>(queryKeys.stubMappings.detail(id));

      updateListCaches(queryClient, (current) => ({
        ...current,
        mappings: current.mappings.map((mapping) =>
          mapping.id === id || mapping.uuid === id
            ? {
                ...mapping,
                ...stubMapping,
                id: stubMapping.id ?? mapping.id,
                uuid: stubMapping.uuid ?? mapping.uuid,
              }
            : mapping,
        ),
      }));

      queryClient.setQueryData(queryKeys.stubMappings.detail(id), {
        ...(previousDetail ?? {}),
        ...stubMapping,
        id: stubMapping.id ?? id,
        uuid: stubMapping.uuid ?? previousDetail?.uuid,
      });

      return {
        previous,
        previousDetail,
      };
    },
    onError: (error, variables, context) => {
      if (context) {
        restoreSnapshots(queryClient, context.previous);
        queryClient.setQueryData(queryKeys.stubMappings.detail(variables.id), context.previousDetail);
      }

      toast.error(getErrorMessage(error, "Unable to update the stub mapping. The optimistic update was reverted."));
    },
    onSuccess: (updatedStubMapping) => {
      const detailId = updatedStubMapping.id ?? updatedStubMapping.uuid;
      if (detailId) {
        queryClient.setQueryData(queryKeys.stubMappings.detail(detailId), updatedStubMapping);
      }

      toast.success("Stub mapping updated successfully.");
    },
    onSettled: (_updatedStubMapping, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stubMappings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stubMappings.detail(variables.id) });
    },
  });
}

export function useDeleteStubMapping() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string, DeleteContext>({
    mutationFn: (id) => deleteStubMapping(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.stubMappings.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.stubMappings.detail(id) });

      const previous = queryClient.getQueriesData<StubMappingsListResponse>({ queryKey: queryKeys.stubMappings.lists() });
      const previousDetail = queryClient.getQueryData<StubMapping>(queryKeys.stubMappings.detail(id));

      updateListCaches(queryClient, (current) => ({
        ...current,
        mappings: current.mappings.filter((mapping) => mapping.id !== id && mapping.uuid !== id),
        meta: {
          ...current.meta,
          total: Math.max(0, current.meta.total - 1),
        },
      }));

      queryClient.removeQueries({ queryKey: queryKeys.stubMappings.detail(id) });

      return {
        previous,
        previousDetail,
      };
    },
    onError: (error, id, context) => {
      if (context) {
        restoreSnapshots(queryClient, context.previous);
        queryClient.setQueryData(queryKeys.stubMappings.detail(id), context.previousDetail);
      }

      toast.error(getErrorMessage(error, "Unable to delete the stub mapping. The optimistic update was reverted."));
    },
    onSuccess: () => {
      toast.success("Stub mapping deleted.");
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stubMappings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stubMappings.detail(id) });
    },
  });
}

export function useDuplicateStubMapping() {
  const queryClient = useQueryClient();

  return useMutation<StubMapping, unknown, StubMapping>({
    mutationFn: (stubMapping) => createStubMapping(stripIdentity(stubMapping)),
    onSuccess: (duplicatedStubMapping) => {
      const detailId = duplicatedStubMapping.id ?? duplicatedStubMapping.uuid;
      if (detailId) {
        queryClient.setQueryData(queryKeys.stubMappings.detail(detailId), duplicatedStubMapping);
      }

      toast.success("Stub mapping duplicated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to duplicate the stub mapping."));
    },
    onSettled: (duplicatedStubMapping) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stubMappings.lists() });

      const detailId = duplicatedStubMapping?.id ?? duplicatedStubMapping?.uuid;
      if (detailId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.stubMappings.detail(detailId) });
      }
    },
  });
}

export function useImportStubMappings() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, ImportStubMappingsRequest>({
    mutationFn: (payload) => importStubMappings(payload),
    onSuccess: () => {
      toast.success("Stub mappings imported successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to import the stub mappings."));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stubMappings.lists() });
    },
  });
}

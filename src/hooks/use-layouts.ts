import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLayoutsList,
  getAdminLayouts,
  getLayout,
  createLayout,
  updateLayout,
  deleteLayout,
  type CreateLayoutPayload,
  type UpdateLayoutPayload,
} from "@/services/layouts";

// Query keys
export const layoutKeys = {
  all: ["layouts"] as const,
  lists: () => [...layoutKeys.all, "list"] as const,
  list: (filters?: {
    type?: string;
    includeAdmin?: string;
    includeUser?: string;
    page?: number;
    limit?: number;
    tags?: string[];
  }) => [...layoutKeys.lists(), filters] as const,
  adminList: (filters?: { page?: number; limit?: number }) =>
    [...layoutKeys.all, "admin", "list", filters] as const,
  detail: (id: string) => [...layoutKeys.all, id] as const,
};

// Get layouts list query
export const useLayoutsList = (filters?: {
  type?: string;
  includeAdmin?: string;
  includeUser?: string;
  page?: number;
  limit?: number;
  tags?: string[];
}) => {
  return useQuery({
    queryKey: layoutKeys.list(filters),
    queryFn: () => getLayoutsList(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get admin layouts query
export const useAdminLayoutsList = (filters?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: layoutKeys.adminList(filters),
    queryFn: () => getAdminLayouts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get layout query
export const useLayout = (layoutId: string | null) => {
  return useQuery({
    queryKey: layoutId
      ? layoutKeys.detail(layoutId)
      : ["layout", "null"],
    queryFn: () => {
      if (!layoutId) {
        throw new Error("Layout ID is required");
      }
      return getLayout(layoutId);
    },
    enabled: !!layoutId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create layout mutation
export const useCreateLayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLayoutPayload) => createLayout(payload),
    onSuccess: () => {
      // Invalidate layouts list
      queryClient.invalidateQueries({ queryKey: layoutKeys.all });
    },
  });
};

// Update layout mutation
export const useUpdateLayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateLayoutPayload;
    }) => updateLayout(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate specific layout
      queryClient.invalidateQueries({
        queryKey: layoutKeys.detail(variables.id),
      });
      // Invalidate layouts list
      queryClient.invalidateQueries({ queryKey: layoutKeys.all });
    },
  });
};

// Delete layout mutation
export const useDeleteLayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLayout(id),
    onSuccess: () => {
      // Invalidate layouts list
      queryClient.invalidateQueries({ queryKey: layoutKeys.all });
    },
  });
};


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTheme,
  getThemesList,
  getAdminThemesList,
  getTheme,
  updateTheme,
  deleteTheme,
  type CreateThemePayload,
  type UpdateThemePayload,
  type ListThemesParams,
} from "@/services/themes";

// Query keys
export const themeKeys = {
  all: ["themes"] as const,
  lists: () => [...themeKeys.all, "list"] as const,
  list: (params?: ListThemesParams) => [...themeKeys.lists(), params] as const,
  admin: {
    all: () => [...themeKeys.all, "admin"] as const,
    lists: () => [...themeKeys.admin.all(), "list"] as const,
    list: (params?: Omit<ListThemesParams, "includeAdmin" | "includeUser">) =>
      [...themeKeys.admin.lists(), params] as const,
  },
  detail: (id: string) => [...themeKeys.all, "detail", id] as const,
};

/**
 * List themes query
 */
export const useThemesList = (params?: ListThemesParams) => {
  return useQuery({
    queryKey: themeKeys.list(params),
    queryFn: async () => {
      try {
        return await getThemesList(params);
      } catch (error: any) {
        throw new Error(
          error.message || "Failed to load themes. Please try again."
        );
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * List admin themes query (no authentication required for reading)
 */
export const useAdminThemesList = (
  params?: Omit<ListThemesParams, "includeAdmin" | "includeUser">
) => {
  return useQuery({
    queryKey: themeKeys.admin.list(params),
    queryFn: async () => {
      try {
        return await getAdminThemesList(params);
      } catch (error: any) {
        throw new Error(
          error.message || "Failed to load admin themes. Please try again."
        );
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Get single theme query
 */
export const useTheme = (id: string | null) => {
  return useQuery({
    queryKey: id ? themeKeys.detail(id) : ["theme", "null"],
    queryFn: async () => {
      if (!id) {
        throw new Error("Theme ID is required");
      }
      try {
        return await getTheme(id);
      } catch (error: any) {
        throw new Error(
          error.message || "Failed to load theme. Please try again."
        );
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Create theme mutation
 */
export const useCreateTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateThemePayload) => {
      try {
        return await createTheme(payload);
      } catch (error: any) {
        throw new Error(error.message || "Failed to create theme");
      }
    },
    onSuccess: () => {
      // Invalidate all themes list queries to refetch (including all params variations)
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: themeKeys.admin.lists() });
    },
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Update theme mutation
 */
export const useUpdateTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateThemePayload;
    }) => {
      try {
        return await updateTheme(id, payload);
      } catch (error: any) {
        throw new Error(error.message || "Failed to update theme");
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate themes list and detail queries
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: themeKeys.detail(variables.id),
      });
    },
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Delete theme mutation
 */
export const useDeleteTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await deleteTheme(id);
      } catch (error: any) {
        throw new Error(error.message || "Failed to delete theme");
      }
    },
    onSuccess: () => {
      // Invalidate themes list queries to refetch
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
    },
    retry: 1,
    retryDelay: 1000,
  });
};

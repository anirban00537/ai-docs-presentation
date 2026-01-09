import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  layoutsService, 
  type LayoutTemplate, 
  type CreateLayoutPayload, 
  type UpdateLayoutPayload 
} from "@/services/layouts";
import { toast } from "sonner";

export const layoutKeys = {
  all: ["layouts"] as const,
  lists: () => [...layoutKeys.all, "list"] as const,
  list: (filters?: any) => [...layoutKeys.lists(), filters] as const,
  admin: () => [...layoutKeys.all, "admin"] as const,
  details: () => [...layoutKeys.all, "detail"] as const,
  detail: (id: string) => [...layoutKeys.details(), id] as const,
};

export const useAdminLayouts = () => {
  return useQuery({
    queryKey: layoutKeys.admin(),
    queryFn: async () => {
      const response = await layoutsService.getAdminLayouts();
      return response.data;
    },
  });
};

export const useUserLayouts = () => {
  return useQuery({
    queryKey: layoutKeys.list(),
    queryFn: async () => {
      const response = await layoutsService.getUserLayouts();
      return response.data || [];
    },
  });
};

// Alias for useUserLayouts to maintain backward compatibility
export const useLayouts = useUserLayouts;

export const useLayout = (id: string | null | undefined) => {
  return useQuery({
    queryKey: layoutKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await layoutsService.getLayout(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export function useCreateLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLayoutPayload) => layoutsService.createLayout(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: layoutKeys.lists() });
      toast.success("Layout created successfully!");
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create layout");
    },
  });
}

export function useUpdateLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateLayoutPayload) => layoutsService.updateLayout(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: layoutKeys.lists() });
      queryClient.invalidateQueries({ queryKey: layoutKeys.detail(variables.id) });
      toast.success("Layout updated successfully!");
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update layout");
    },
  });
}

export function useDeleteLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => layoutsService.deleteLayout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layoutKeys.lists() });
      toast.success("Layout deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete layout");
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPresentationsList,
  getPresentation,
  createPresentation,
  updatePresentation,
  updatePresentationTitle,
  deletePresentation,
  createSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
  type CreatePresentationPayload,
  type UpdatePresentationPayload,
  type CreateSlidePayload,
  type UpdateSlidePayload,
} from "@/services/presentation";

// Query keys
export const presentationKeys = {
  all: ["presentations"] as const,
  lists: () => [...presentationKeys.all, "list"] as const,
  list: (filters?: { page?: number; limit?: number }) =>
    [...presentationKeys.lists(), filters] as const,
  detail: (id: string) => [...presentationKeys.all, id] as const,
};

// Get presentations list query
export const usePresentationsList = (filters?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: presentationKeys.list(filters),
    queryFn: () => getPresentationsList(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get presentation query
export const usePresentation = (presentationId: string | null) => {
  return useQuery({
    queryKey: presentationId
      ? presentationKeys.detail(presentationId)
      : ["presentation", "null"],
    queryFn: () => {
      if (!presentationId) {
        throw new Error("Presentation ID is required");
      }
      return getPresentation(presentationId);
    },
    enabled: !!presentationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create presentation mutation
export const useCreatePresentation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePresentationPayload) =>
      createPresentation(payload),
    onSuccess: () => {
      // Invalidate presentations list
      queryClient.invalidateQueries({ queryKey: presentationKeys.all });
    },
  });
};

// Update presentation mutation
export const useUpdatePresentation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePresentationPayload;
    }) => updatePresentation(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate specific presentation
      queryClient.invalidateQueries({
        queryKey: presentationKeys.detail(variables.id),
      });
      // Invalidate presentations list
      queryClient.invalidateQueries({ queryKey: presentationKeys.all });
    },
  });
};

// Update presentation title mutation
export const useUpdatePresentationTitle = () => {
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updatePresentationTitle(id, title),
    // No query invalidation needed - Redux is the source of truth
    // The title is already updated in Redux before the API call
  });
};

// Delete presentation mutation
export const useDeletePresentation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePresentation(id),
    onSuccess: () => {
      // Invalidate presentations list
      queryClient.invalidateQueries({ queryKey: presentationKeys.all });
    },
  });
};

// Create slide mutation
export const useAddSlide = () => {
  return useMutation({
    mutationFn: ({
      presentationId,
      payload,
    }: {
      presentationId: string;
      payload: CreateSlidePayload;
    }) => createSlide(presentationId, payload),
    // No query invalidation needed - Redux is the source of truth
    // The slide is already in Redux and ID is updated via updateSlideId
  });
};

// Update slide mutation
export const useUpdateSlide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      presentationId,
      slideId,
      payload,
    }: {
      presentationId: string;
      slideId: string;
      payload: UpdateSlidePayload;
    }) => updateSlide(presentationId, slideId, payload),
    onSuccess: (data, variables) => {
      // Invalidate specific presentation
      queryClient.invalidateQueries({
        queryKey: presentationKeys.detail(variables.presentationId),
      });
    },
  });
};

// Delete slide mutation
export const useDeleteSlide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      presentationId,
      slideId,
    }: {
      presentationId: string;
      slideId: string;
    }) => deleteSlide(presentationId, slideId),
    onSuccess: (data, variables) => {
      // Invalidate specific presentation
      queryClient.invalidateQueries({
        queryKey: presentationKeys.detail(variables.presentationId),
      });
    },
  });
};

// Reorder slides mutation
export const useReorderSlides = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      presentationId,
      slideOrders,
    }: {
      presentationId: string;
      slideOrders: { slideId: string; order: number }[];
    }) => reorderSlides(presentationId, slideOrders),
    onSuccess: (data, variables) => {
      // Invalidate specific presentation
      queryClient.invalidateQueries({
        queryKey: presentationKeys.detail(variables.presentationId),
      });
    },
  });
};

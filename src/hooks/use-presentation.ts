import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPresentation,
  createPresentation,
  updatePresentation,
  deletePresentation,
  addSlide,
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
  detail: (id: string) => [...presentationKeys.all, id] as const,
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

// Add slide mutation
export const useAddSlide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      presentationId,
      payload,
    }: {
      presentationId: string;
      payload: CreateSlidePayload;
    }) => addSlide(presentationId, payload),
    onSuccess: (data, variables) => {
      // Invalidate specific presentation to refetch with new slide
      queryClient.invalidateQueries({
        queryKey: presentationKeys.detail(variables.presentationId),
      });
    },
  });
};

// Update slide mutation
export const useUpdateSlide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slideId,
      payload,
    }: {
      slideId: string;
      payload: UpdateSlidePayload;
    }) => updateSlide(slideId, payload),
    onSuccess: () => {
      // We need to invalidate the presentation that contains this slide
      // Since we don't have presentationId here, we invalidate all presentations
      // In a real app, you might want to pass presentationId or use a different approach
      queryClient.invalidateQueries({ queryKey: presentationKeys.all });
    },
  });
};

// Delete slide mutation
export const useDeleteSlide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slideId: string) => deleteSlide(slideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presentationKeys.all });
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

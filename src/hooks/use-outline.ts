import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOutline,
  savePrompt,
  updateOutline,
  generateOutlineStream,
  generateSlidesFromOutline,
  generateAndCreateSlides,
  type CreateOutlineDto,
  type UpdateOutlineDto,
  type StreamChunk,
  type SlideGenerationChunk,
} from "@/services/presentation";

// Query keys
export const outlineKeys = {
  all: ["outlines"] as const,
  detail: (id: string) => [...outlineKeys.all, id] as const,
};

// Get outline query
export const useOutline = (outlineId: string | null) => {
  return useQuery({
    queryKey: outlineId ? outlineKeys.detail(outlineId) : ["outline", "null"],
    queryFn: () => {
      if (!outlineId) {
        throw new Error("Outline ID is required");
      }
      return getOutline(outlineId);
    },
    enabled: !!outlineId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Save prompt mutation
export const useSavePrompt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOutlineDto) => savePrompt(payload),
    onSuccess: (data) => {
      if (data.success && data.data?.id) {
        // Prefetch the outline
        queryClient.prefetchQuery({
          queryKey: outlineKeys.detail(data.data.id),
          queryFn: () => getOutline(data.data.id),
        });
      }
    },
  });
};

// Update outline mutation
export const useUpdateOutline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOutlineDto }) =>
      updateOutline(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate specific outline
      queryClient.invalidateQueries({
        queryKey: outlineKeys.detail(variables.id),
      });
    },
  });
};

// Generate outline stream hook
export const useGenerateOutlineStream = () => {
  return useMutation({
    mutationFn: ({
      outlineId,
      onChunk,
    }: {
      outlineId: string;
      onChunk: (chunk: StreamChunk) => void;
    }) => generateOutlineStream(outlineId, onChunk),
  });
};

// Generate slides from outline hook
export const useGenerateSlidesFromOutline = () => {
  return useMutation({
    mutationFn: ({
      outlineId,
      onChunk,
    }: {
      outlineId: string;
      onChunk: (chunk: SlideGenerationChunk) => void;
    }) => generateSlidesFromOutline(outlineId, onChunk),
  });
};

// Generate and create slides from presentation hook
export const useGenerateAndCreateSlides = () => {
  return useMutation({
    mutationFn: ({
      presentationId,
      onChunk,
    }: {
      presentationId: string;
      onChunk: (chunk: SlideGenerationChunk) => void;
    }) => generateAndCreateSlides(presentationId, onChunk),
  });
};

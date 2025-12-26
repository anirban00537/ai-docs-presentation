import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOutline,
  savePrompt,
  updateOutline,
  generateAndCreateSlides,
  type CreateOutlineDto,
  type UpdateOutlineDto,
  type SlideGenerationChunk,
} from "@/services/presentation";
import { useAppDispatch } from "@/store/hooks";
import { fetchCreditBalance } from "@/store/slices/subscriptionSlice";

// Query keys
export const outlineKeys = {
  all: ["outlines"] as const,
  detail: (id: string) => [...outlineKeys.all, id] as const,
};

// Get outline query - refetches credits when outline completes
export const useOutline = (outlineId: string | null) => {
  const dispatch = useAppDispatch();
  const hasRefreshedCredits = useRef(false);

  const query = useQuery({
    queryKey: outlineId ? outlineKeys.detail(outlineId) : ["outline", "null"],
    queryFn: () => {
      if (!outlineId) {
        throw new Error("Outline ID is required");
      }
      return getOutline(outlineId);
    },
    enabled: !!outlineId,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: (q) => {
      const status = (q.state.data as any)?.data?.status;
      return status === "generating" ? 3000 : false;
    },
  });

  // Refetch credits when outline completes
  const status = query.data?.data?.status;
  useEffect(() => {
    if (status === "completed" && !hasRefreshedCredits.current) {
      hasRefreshedCredits.current = true;
      dispatch(fetchCreditBalance());
    }
  }, [status, dispatch]);

  return query;
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

// Generate slides from outline hook


// Generate and create slides from presentation hook
export const useGenerateAndCreateSlides = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({
      presentationId,
      onChunk,
    }: {
      presentationId: string;
      onChunk: (chunk: SlideGenerationChunk) => void;
    }) => generateAndCreateSlides(presentationId, onChunk),
    onSuccess: () => {
      dispatch(fetchCreditBalance());
    },
    onError: (error: any) => {
      // This catches any errors that weren't handled by onChunk
      console.error("[useGenerateAndCreateSlides] Mutation error:", error);
    },
  });
};


import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parse as parsePartialJson } from "partial-json";
import {
  getOutline,
  savePrompt,
  updateOutline,
  generateAndCreateSlides,
  updatePresentation,
  type CreateOutlineDto,
  type UpdateOutlineDto,
  type SlideGenerationChunk,
  type StreamChunk,
  type OutlineResponse,
  generateOutlineStream,
} from "@/services/presentation";
import { useAppDispatch } from "@/store/hooks";
import { fetchCreditBalance } from "@/store/slices/subscriptionSlice";
import { useAdminThemesList } from "./use-themes";
import { type ThemeResponse } from "@/services/themes";

// Query keys
export const outlineKeys = {
  all: ["outlines"] as const,
  detail: (id: string) => [...outlineKeys.all, id] as const,
};

// Get outline query
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
    staleTime: 0,
    refetchInterval: (q) => {
      const status = (q.state.data as any)?.data?.status;
      return status === "generating" ? 3000 : false;
    },
  });

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
      queryClient.invalidateQueries({
        queryKey: outlineKeys.detail(variables.id),
      });
    },
  });
};

// Generate outline stream hook
export const useGenerateOutlineStream = () => {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: ({
      outlineId,
      onChunk,
    }: {
      outlineId: string;
      onChunk: (chunk: StreamChunk) => void;
    }) => generateOutlineStream(outlineId, onChunk),
    onSuccess: () => {
      dispatch(fetchCreditBalance());
    },
    onError: (error: any) => {
      console.error("[useGenerateOutlineStream] Mutation error:", error);
    },
  });
};

// Generate and create slides hook
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
      console.error("[useGenerateAndCreateSlides] Mutation error:", error);
    },
  });
};

/**
 * Consolidated hook for the Outline Editor Page logic
 */
export const useOutlineEditor = (outlineId: string) => {
  // Queries & Mutations
  const {
    data: outlineResponse,
    isLoading,
    error: outlineError,
    refetch,
  } = useOutline(outlineId);
  const updateOutlineMutation = useUpdateOutline();
  const generateOutlineStreamMutation = useGenerateOutlineStream();
  const { data: themesResponse, isLoading: themesLoading } = useAdminThemesList();

  // State
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [completedOutline, setCompletedOutline] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeResponse | null>(null);
  const [themeSaveStatus, setThemeSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Refs
  const hasStartedStreaming = useRef(false);
  const hasAutoSelectedTheme = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Derived Values
  const outline = outlineResponse?.data || null;
  const themes = useMemo(() => themesResponse?.data?.list || [], [themesResponse]);
  
  const error = outlineError?.message || 
    (outlineResponse && !outlineResponse.success ? outlineResponse.message : null);

  const presentationId = outlineResponse?.data?.presentationId || outline?.presentationId;
  const presentationUrl = presentationId && outlineId 
    ? `/presentation/${presentationId}?outlineId=${outlineId}` 
    : null;

  // 1. Auto-start streaming
  useEffect(() => {
    if (outline && outline.status === 'generating' && !hasStartedStreaming.current && !outline.outlines?.length) {
      hasStartedStreaming.current = true;
      setIsStreaming(true);
      
      generateOutlineStreamMutation.mutate({
        outlineId,
        onChunk: (chunk) => {
          if (chunk.type === 'chunk' && chunk.accumulated) {
            setStreamingContent(chunk.accumulated);
          } else if (chunk.type === 'complete') {
            if (chunk.data) setCompletedOutline(chunk.data);
            setIsStreaming(false);
            refetch();
          } else if (chunk.type === 'error') {
            setIsStreaming(false);
            console.error("Streaming error:", chunk.message);
          }
        }
      });
    }
  }, [outline, outlineId, generateOutlineStreamMutation, refetch]);

  // 2. Computed Outline Data (Merging stream vs fetched)
  const outlineData = useMemo(() => {
    // A. Explicit completed data
    if (completedOutline) {
        let displayTitle = completedOutline.title;
         if (!displayTitle || displayTitle.match(/^[\.\s]+$/)) {
             displayTitle = outline?.title || "Untitled Presentation";
         }
        return {
            title: displayTitle,
            outlines: completedOutline.outlines
        };
    }

    // B. Streaming data
    if (isStreaming && streamingContent) {
        try {
            const partial = parsePartialJson(streamingContent);
            if (partial && partial.outlines) {
                let displayTitle = partial.title || outline?.title || "Generating...";
                if (displayTitle.match(/^[\.\s]+$/)) displayTitle = "Generating...";
                return {
                    title: displayTitle,
                    outlines: partial.outlines
                };
            }
        } catch (e) {
            // Ignore parse errors
        }
    }

    // C. Fetched data
    if (outline?.outlines && Array.isArray(outline.outlines)) {
      return {
        title: outline.title || "Untitled Presentation",
        outlines: outline.outlines as any,
      };
    }
    return null;
  }, [outline?.title, outline?.outlines, isStreaming, streamingContent, completedOutline]);

  // 3. Theme Logic
  const saveThemeToPresentation = useCallback(async (theme: ThemeResponse) => {
    if (!presentationId) return;
    setThemeSaveStatus('saving');
    try {
      await updatePresentation(presentationId, { globalTheme: theme.themeData });
      setThemeSaveStatus('saved');
      setTimeout(() => setThemeSaveStatus('idle'), 2000);
    } catch (err) {
      console.error("Failed to save theme:", err);
      setThemeSaveStatus('idle');
    }
  }, [presentationId]);

  useEffect(() => {
    if (!hasAutoSelectedTheme.current && themes.length > 0 && presentationId && !selectedTheme) {
      hasAutoSelectedTheme.current = true;
      const randomIndex = Math.floor(Math.random() * themes.length);
      const randomTheme = themes[randomIndex];
      setSelectedTheme(randomTheme);
      saveThemeToPresentation(randomTheme);
    }
  }, [themes, presentationId, selectedTheme, saveThemeToPresentation]);

  // 4. Regeneration Logic
  const handleRegenerate = useCallback((newPrompt: string, newSlideCount: number) => {
    setIsStreaming(true);
    setStreamingContent("");
    setCompletedOutline(null);
    hasStartedStreaming.current = true;

    updateOutlineMutation.mutate(
      {
        id: outlineId,
        payload: {
          prompt: newPrompt,
          numberOfSlides: newSlideCount,
          outlines: [] 
        }
      },
      {
        onSuccess: () => {
             generateOutlineStreamMutation.mutate({
                outlineId,
                onChunk: (chunk) => {
                  if (chunk.type === 'chunk' && chunk.accumulated) {
                    setStreamingContent(chunk.accumulated);
                  } else if (chunk.type === 'complete') {
                    if (chunk.data) setCompletedOutline(chunk.data);
                    setIsStreaming(false);
                    refetch();
                  } else if (chunk.type === 'error') {
                    setIsStreaming(false);
                    console.error("Streaming error:", chunk.message);
                  }
                }
             });
        }
      }
    );
  }, [outlineId, updateOutlineMutation, generateOutlineStreamMutation, refetch]);

  // 5. Debounced Save Logic
  const debouncedSave = useCallback((updatedOutline: OutlineResponse) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setSaveStatus('saving');
        updateOutlineMutation.mutate(
          { id: outlineId, payload: updatedOutline },
          {
            onSuccess: () => {
              setSaveStatus('saved');
              setTimeout(() => setSaveStatus('idle'), 2000);
            },
            onError: () => setSaveStatus('idle')
          }
        );
      }, 1500);
    }, [outlineId, updateOutlineMutation]);

  return {
    // Data
    outline,
    outlineData,
    themes,
    selectedTheme,
    presentationUrl,
    displayError: error,
    
    // Status
    isLoading,
    isStreaming,
    themesLoading,
    saveStatus,
    themeSaveStatus,
    
    // Actions
    handleRegenerate,
    debouncedSave,
    setSelectedTheme,
    saveThemeToPresentation,
  };
};


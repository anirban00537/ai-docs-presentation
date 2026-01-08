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
import { useRouter } from "next/navigation";

// Query keys
export const outlineKeys = {
  all: ["outlines"] as const,
  detail: (id: string) => [...outlineKeys.all, id] as const,
};

// --- Sub-Hook: Outline Generation (Streaming) ---
export const useOutlineGeneration = () => {
  const dispatch = useAppDispatch();
  const generateOutlineStreamMutation = useGenerateOutlineStream();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [completedOutline, setCompletedOutline] = useState<any>(null);
  const hasStartedStreaming = useRef(false);

  const startGeneration = useCallback((outlineId: string) => {
    // Prevent double-start
    if (isGenerating) return;
    
    setIsGenerating(true);
    setStreamingContent("");
    setCompletedOutline(null);
    hasStartedStreaming.current = true;

    generateOutlineStreamMutation.mutate({
      outlineId,
      onChunk: (chunk) => {
        if (chunk.type === 'chunk' && chunk.accumulated) {
           setStreamingContent(chunk.accumulated);
        } else if (chunk.type === 'complete') {
           if (chunk.data) {
               setCompletedOutline(chunk.data);
           }
           setIsGenerating(false);
           // Refresh credits on completion
           dispatch(fetchCreditBalance());
        } else if (chunk.type === 'error') {
           setIsGenerating(false);
           console.error("Streaming error:", chunk.message);
        }
      }
    });
  }, [isGenerating, generateOutlineStreamMutation, dispatch]);

  const resetGeneration = useCallback(() => {
      setIsGenerating(false);
      setStreamingContent("");
      setCompletedOutline(null);
      hasStartedStreaming.current = false;
  }, []);

  return {
    isGenerating,
    streamingContent,
    completedOutline,
    startGeneration,
    resetGeneration,
    hasStartedStreaming
  };
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
// --- Main Hook: Outline Editor ---
export const useOutlineEditor = (outlineId: string) => {
  const router = useRouter();
  const updateOutlineMutation = useUpdateOutline();

  // 1. Data Fetching
  const {
    data: outlineResponse,
    isLoading,
    error: outlineError,
    refetch,
  } = useOutline(outlineId);

  const { data: themesResponse } = useAdminThemesList();
  
  // 2. Generation Hook
  const { 
    isGenerating: isStreaming, 
    streamingContent, 
    completedOutline, 
    startGeneration,
    resetGeneration 
  } = useOutlineGeneration();

  // 3. Local State
  const [selectedTheme, setSelectedTheme] = useState<ThemeResponse | null>(null);
  const [themeSaveStatus, setThemeSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Refs
  const hasAutoSelectedTheme = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Derived Values
  const outline = outlineResponse?.data || null;
  const themes = useMemo(() => themesResponse?.data?.list || [], [themesResponse]);
  
  const displayError = outlineError?.message || 
    (outlineResponse && !outlineResponse.success ? outlineResponse.message : null);

  const presentationId = outlineResponse?.data?.presentationId || outline?.presentationId;
  const presentationUrl = presentationId && outlineId 
    ? `/presentation/${presentationId}?outlineId=${outlineId}` 
    : null;

  // Auto-start streaming logic
  useEffect(() => {
    // Only start if: 
    // 1. We have outline data
    // 2. Status is 'generating'
    // 3. We haven't started streaming yet (handled by hook, but double check here)
    // 4. outline.outlines is empty (meaning we need to generate content)
    if (outline && outline.status === 'generating' && !outline.outlines?.length && !isStreaming && !streamingContent) {
       startGeneration(outlineId);
    }
  }, [outline, outlineId, isStreaming, streamingContent, startGeneration]);

  // When stream completes, refetch to ensure we have canonical DB state
  useEffect(() => {
      if (completedOutline) {
          refetch();
      }
  }, [completedOutline, refetch]);

  // Computed Outline Data (Merging stream vs fetched)
  const outlineData = useMemo(() => {
    // A. Explicit completed data (Prioritize this)
    if (completedOutline) {
        let displayTitle = completedOutline.title;
         if (!displayTitle || displayTitle.match(/^[\.\s]+$/)) {
             displayTitle = outline?.title || "Untitled Presentation";
         }
        // Filter empty outlines
        const validOutlines = (completedOutline.outlines || []).filter((o: any) => o.content && o.content.trim());
        return {
            title: displayTitle,
            outlines: validOutlines
        };
    }

    // B. Streaming data (Use if we have content)
    if (streamingContent) {
        try {
            const partial = parsePartialJson(streamingContent);
            if (partial && partial.outlines && partial.outlines.length > 0) {
                let displayTitle = partial.title || outline?.title || "Generating...";
                if (displayTitle.match(/^[\.\s]+$/)) displayTitle = "Generating...";
                return {
                    title: displayTitle,
                    outlines: partial.outlines
                };
            }
        } catch (e) {
            // Ignore parse errors, fall through to DB data
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
  }, [outline?.title, outline?.outlines, streamingContent, completedOutline]);

  // Theme Logic
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

  // Regenerate Handler
  const handleRegenerate = (newPrompt: string, newSlideCount: number) => {
    resetGeneration();
    updateOutlineMutation.mutate(
      {
        id: outlineId,
        payload: {
          prompt: newPrompt,
          numberOfSlides: newSlideCount,
          outlines: [] // Clear previous outlines
        }
      },
      {
        onSuccess: () => {
             startGeneration(outlineId);
        }
      }
    );
  };

  // Debounced auto-save
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
    displayError,
    
    // Status
    isLoading,
    isStreaming,
    themesLoading: false, // themesLoading was removed from useOutlineEditor, assuming it's not needed or handled elsewhere
    saveStatus,
    themeSaveStatus,
    
    // Actions
    handleRegenerate,
    debouncedSave,
    setSelectedTheme,
    saveThemeToPresentation,
    refetch
  };
};


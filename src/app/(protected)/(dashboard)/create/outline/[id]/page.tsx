"use client";

import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useOutline, useUpdateOutline } from "@/app/(protected)/presentation/[id]/hooks/use-outline";
import { useAdminThemesList } from "@/app/(protected)/presentation/[id]/hooks/use-themes";
import { updatePresentation } from "@/services/presentation";
import { OutlineViewer } from "@/components/outline-viewer";
import { Button } from "@/components/ui/button";
import { IconFileText, IconSparkles, IconArrowLeft, IconCheck, IconLoader2, IconPalette, IconChevronDown } from "@tabler/icons-react";
import type { OutlineResponse } from "@/services/presentation";
import type { ThemeResponse } from "@/services/themes";
import { cn } from "@/lib/utils";

export default function OutlinePage() {
  const params = useParams();
  const router = useRouter();
  const outlineId = params.id as string;

  // TanStack Query hooks
  const {
    data: outlineResponse,
    isLoading,
    error: outlineError,
  } = useOutline(outlineId);
  const updateOutlineMutation = useUpdateOutline();

  // Fetch admin themes
  const { data: themesResponse, isLoading: themesLoading } = useAdminThemesList();
  const themes = useMemo(() => themesResponse?.data?.list || [], [themesResponse]);

  // Theme selection state
  const [selectedTheme, setSelectedTheme] = useState<ThemeResponse | null>(null);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [themeSaveStatus, setThemeSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const hasAutoSelectedTheme = useRef(false);

  const outline = outlineResponse?.data || null;
  // Only show error if there's a query error or API returned failure
  const error =
    outlineError?.message ||
    (outlineResponse && !outlineResponse.success
      ? outlineResponse.message
      : null);
  const displayError = error;

  // Get outline data from the fetched outline
  const outlineData = React.useMemo(() => {
    if (outline?.outlines && Array.isArray(outline.outlines)) {
      return {
        title: outline.title || "Untitled Presentation",
        outlines: outline.outlines as any,
      };
    }
    return null;
  }, [outline?.title, outline?.outlines]);

  // Get presentationId early for theme saving
  const presentationId =
    outlineResponse?.data?.presentationId || outline?.presentationId;

  // Auto-select random theme on page load
  useEffect(() => {
    if (
      !hasAutoSelectedTheme.current &&
      themes.length > 0 &&
      presentationId &&
      !selectedTheme
    ) {
      hasAutoSelectedTheme.current = true;
      const randomIndex = Math.floor(Math.random() * themes.length);
      const randomTheme = themes[randomIndex];
      setSelectedTheme(randomTheme);
      
      // Auto-save the random theme to presentation
      saveThemeToPresentation(randomTheme);
    }
  }, [themes, presentationId, selectedTheme]);

  // Save theme to presentation
  const saveThemeToPresentation = async (theme: ThemeResponse) => {
    if (!presentationId) return;
    
    setThemeSaveStatus('saving');
    try {
      await updatePresentation(presentationId, {
        globalTheme: theme.themeData,
      });
      setThemeSaveStatus('saved');
      setTimeout(() => setThemeSaveStatus('idle'), 2000);
    } catch (err) {
      console.error("Failed to save theme:", err);
      setThemeSaveStatus('idle');
    }
  };

  // Handle theme selection
  const handleThemeSelect = (theme: ThemeResponse) => {
    setSelectedTheme(theme);
    setThemeDropdownOpen(false);
    saveThemeToPresentation(theme);
  };

  // Ref for theme dropdown to handle click outside
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    if (themeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [themeDropdownOpen]);

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced auto-save function
  const debouncedSave = useCallback(
    (updatedOutline: OutlineResponse) => {
      // Clear any existing timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }

      // Set debounce timer
      debounceTimerRef.current = setTimeout(() => {
        setSaveStatus('saving');
        
        updateOutlineMutation.mutate(
          {
            id: outlineId,
            payload: updatedOutline,
          },
          {
            onSuccess: () => {
              setSaveStatus('saved');
              // Reset to idle after showing saved status
              savedTimeoutRef.current = setTimeout(() => {
                setSaveStatus('idle');
              }, 2000);
            },
            onError: (err: any) => {
              console.error("Failed to auto-save outline:", err);
              setSaveStatus('idle');
            },
          }
        );
      }, 1500); // 1.5 second debounce
    },
    [outlineId, updateOutlineMutation]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  // Build presentation URL for navigation
  const presentationUrl =
    presentationId && outlineId
      ? `/presentation/${presentationId}?outlineId=${outlineId}`
      : null;

  if (isLoading) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-primary/5 via-white to-secondary/10">
        <div className="relative w-full max-w-4xl px-4">
          <div className="animate-pulse space-y-6">
            <div className="rounded-[32px] p-8 bg-white/40 border border-secondary/20 shadow-sm backdrop-blur-md">
              <div className="h-8 w-3/4 bg-secondary/10 rounded-xl" />
              <div className="h-4 w-full bg-secondary/10 rounded-xl mt-4" />
              <div className="h-4 w-2/3 bg-secondary/10 rounded-xl mt-2" />
            </div>
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="rounded-[32px] p-8 bg-white/40 border border-secondary/20 shadow-sm backdrop-blur-md"
              >
                <div className="h-6 w-1/2 bg-secondary/10 rounded-xl" />
                <div className="h-4 w-full bg-secondary/10 rounded-xl mt-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (displayError && !outline) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden">
        <div className="relative w-full max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-destructive/30 p-6 text-sm text-destructive"
            style={{
              backgroundColor: "rgba(254, 202, 202, 0.3)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
            }}
          >
            {displayError}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] bg-gradient-to-b from-primary/5 via-white to-secondary/10">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30 pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30 pointer-events-none translate-y-1/2" />

      {/* === SCROLLABLE CONTENT LAYER === */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col gap-8 px-4 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
              Refine your <span className="text-primary italic">outline</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground/80 mt-3 font-medium max-w-2xl">
              Review and customize your presentation structure. Your changes are saved automatically.
            </p>
          </div>
          
          {/* Auto-save Status Indicator */}
          <AnimatePresence mode="wait">
            {saveStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 text-xs mt-4"
              >
                {saveStatus === 'saving' && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <IconLoader2 size={12} className="text-muted-foreground/60" />
                    </motion.div>
                    <span className="text-muted-foreground/60 font-medium">Syncing changes...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <IconCheck size={12} className="text-green-500/70" />
                    <span className="text-green-600/70 font-medium">Draft preserved</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Theme Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative"
        >
          <div className="relative rounded-[32px] p-6 z-20 bg-white/40 border border-secondary/20 shadow-sm transition-all duration-300 hover:shadow-depth-3 hover:bg-white">
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10 text-primary shadow-sm">
                  <IconPalette size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Presentation Theme</h3>
                  <p className="text-sm text-muted-foreground/80">
                    {selectedTheme ? selectedTheme.name : "Select a theme for your slides"}
                  </p>
                </div>
              </div>
              
              {/* Theme dropdown */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  disabled={themesLoading}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200",
                    "bg-white border border-secondary/20 shadow-sm hover:shadow-md hover:scale-[1.02]",
                    "text-sm font-medium text-foreground"
                  )}
                >
                  {themesLoading ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : selectedTheme ? (
                    <>
                      {/* Theme color preview */}
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded-full border border-black/5 shadow-sm"
                          style={{ backgroundColor: selectedTheme.themeData?.primary || "#8B5CF6" }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-black/5 shadow-sm"
                          style={{ backgroundColor: selectedTheme.themeData?.cardBackground || "#ffffff" }}
                        />
                      </div>
                      <span className="max-w-[120px] truncate font-semibold">{selectedTheme.name}</span>
                    </>
                  ) : (
                    <span>Choose theme</span>
                  )}
                  <IconChevronDown 
                    size={16} 
                    className={cn(
                      "transition-transform duration-200 text-muted-foreground",
                      themeDropdownOpen && "rotate-180"
                    )}
                  />
                </button>
                
                {/* Dropdown menu */}
                <AnimatePresence>
                  {themeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-y-auto rounded-2xl z-50 bg-white/95 backdrop-blur-xl border border-secondary/20 shadow-xl p-2"
                    >
                      <div className="space-y-1">
                        {themes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => handleThemeSelect(theme)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150",
                              "text-left hover:bg-secondary/10",
                              selectedTheme?.id === theme.id && "bg-primary/5 text-primary"
                            )}
                          >
                            {/* Theme color swatches */}
                            <div className="flex gap-1 shrink-0">
                              <div 
                                className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                                style={{ backgroundColor: theme.themeData?.primary || "#8B5CF6" }}
                              />
                              <div 
                                className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                                style={{ backgroundColor: theme.themeData?.cardBackground || "#ffffff" }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-bold truncate",
                                selectedTheme?.id === theme.id ? "text-primary" : "text-foreground"
                              )}>
                                {theme.name}
                              </p>
                              {theme.description && (
                                <p className="text-xs text-muted-foreground truncate opacity-80">
                                  {theme.description}
                                </p>
                              )}
                            </div>
                            {selectedTheme?.id === theme.id && (
                              <IconCheck size={16} className="text-primary shrink-0" />
                            )}
                          </button>
                        ))}
                        {themes.length === 0 && !themesLoading && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No themes available
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
            </div>
          </div>
        </motion.div>

        {/* Prompt Display Box */}
        {outline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-[32px] p-8 overflow-hidden bg-white/40 border border-secondary/20 shadow-sm transition-all duration-300 hover:shadow-depth-3 hover:bg-white"
          >
            <div className="relative flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10 text-primary shadow-sm">
                <IconFileText size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-lg font-bold text-foreground mb-3">
                  Your Prompt
                </h2>
                <p className="text-foreground/80 whitespace-pre-wrap text-base leading-relaxed">
                  {outline.prompt}
                </p>
                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/10 font-semibold text-secondary-foreground">
                    {outline.numberOfSlides} slides
                  </span>
                </div>
              </div>
            </div>
            
            {outline.status === "generating" && !outlineData && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <IconSparkles size={16} className="text-purple-500" />
                </motion.div>
                Generating outline... Please wait.
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Error Display */}
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-destructive/30 p-4 text-sm text-destructive"
            style={{
              backgroundColor: "rgba(254, 202, 202, 0.3)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
            }}
          >
            {displayError}
          </motion.div>
        )}

        {/* Outline Viewer */}
        {outlineData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="relative rounded-[32px] p-8 overflow-hidden bg-white/40 border border-secondary/20 shadow-sm transition-all duration-300 hover:shadow-depth-3 hover:bg-white">
              <div className="relative">
                <OutlineViewer
                  outline={outlineData}
                  isLoading={isLoading}
                  editable={true}
                  onUpdate={(updatedOutline) => {
                    // Auto-save with debounce
                    debouncedSave(updatedOutline);
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 justify-end items-center"
            >
              <Button
                onClick={() => router.push("/home")}
                variant="outline"
                className="rounded-xl px-6 h-12 gap-2 bg-white/50 border-secondary/20 hover:bg-white text-base font-medium shadow-sm hover:shadow-md transition-all duration-300"
              >
                <IconArrowLeft size={18} />
                Back
              </Button>
              {presentationUrl && presentationUrl !== "#" ? (
                <Link href={presentationUrl}>
                  <Button
                    disabled={updateOutlineMutation.isPending}
                    className="rounded-xl px-8 h-12 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-coral-glow hover:scale-105 transition-all duration-300"
                  >
                    <IconSparkles size={20} />
                    Create Presentation
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled={true}
                  className="rounded-xl px-8 h-12 gap-2 bg-primary/50 text-primary-foreground text-base font-bold cursor-not-allowed"
                >
                  <IconSparkles size={20} />
                  Create Presentation
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Loading State - Show when outline is generating */}
        {outline?.status === "generating" && !outlineData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="rounded-2xl p-6 animate-pulse"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--card) 35%, transparent)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  boxShadow: `
                    0 1px 0 0 color-mix(in srgb, var(--foreground) 10%, transparent) inset,
                    0 8px 32px rgba(0, 0, 0, 0.08)
                  `,
                }}
              >
                <div className="h-6 w-2/3 bg-muted/50 rounded-xl" />
                <div className="h-4 w-full bg-muted/50 rounded-xl mt-3" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

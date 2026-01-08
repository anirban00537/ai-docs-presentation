"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useOutlineEditor } from "@/app/(protected)/presentation/[id]/hooks/use-outline";
import { OutlineViewer } from "@/components/outline-viewer";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconArrowLeft, IconCheck, IconLoader2, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { PromptBox } from "@/components/ui/prompt-input";

export default function OutlinePage() {
  const params = useParams();
  const outlineId = params.id as string;

  // Use the consolidated hook for all logic
  const {
    outline,
    outlineData,
    themes,
    selectedTheme,
    presentationUrl,
    displayError,
    
    // Status
    isLoading,
    isStreaming,
    saveStatus,
    themeSaveStatus,
    
    // Actions
    handleRegenerate,
    debouncedSave,
    setSelectedTheme,
    saveThemeToPresentation,
  } = useOutlineEditor(outlineId);

  // UI-only state
  const [showAllThemes, setShowAllThemes] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (isStreaming && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isStreaming, outlineData?.outlines?.length]);

  if (isLoading && !isStreaming && !outlineData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
         <IconLoader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-80px)] bg-gradient-to-b from-primary/40 to-secondary/40 flex flex-col items-center py-8">
      {/* Container */}
      <div className="w-full max-w-5xl px-6 py-8 bg-white/60 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[32px] flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                 <Link href="/home">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                        <IconArrowLeft size={16} /> Back
                    </Button>
                 </Link>
                 <h1 className="text-xl font-bold font-serif text-primary">Generate</h1>
                 <div className="w-[70px]" /> {/* Spacer for centering */}
            </div>

            {/* Prompt Input Area */}
            <div className="bg-white/80 border border-secondary/10 rounded-[24px] shadow-sm p-4">
                <PromptBox 
                    defaultValue={outline?.prompt || ""} 
                    onSubmit={handleRegenerate}
                    className="border-none shadow-none bg-transparent"
                />
            </div>
        </div>

        {/* Outline Content */}
        {!outlineData && !isStreaming ? (
            <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-secondary/20 rounded-3xl">
                Enter a prompt above to generate your outline
            </div>
        ) : (
            <div className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Outline</h2>
                    {saveStatus === 'saving' && <span className="text-xs text-muted-foreground flex gap-1 items-center"><IconLoader2 size={10} className="animate-spin"/> Saving...</span>}
                 </div>
                 
                 <div className="border border-secondary/10 rounded-[24px] overflow-hidden shadow-sm">
                    <OutlineViewer
                        outline={outlineData || { title: "Generating...", outlines: [] }}
                        isLoading={false}
                        editable={!isStreaming}
                        onUpdate={debouncedSave}
                    />
                 </div>
                 {/* Auto-scroll anchor */}
                 <div ref={bottomRef} className="h-4 w-full" />
            </div>
        )}

        {/* Theme customization */}
        <div className="space-y-4 border-t border-secondary/10 pt-8">
            <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-semibold text-foreground">Customize your style</h3>
                 {selectedTheme && <span className="text-xs text-primary font-medium">{selectedTheme.name}</span>}
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                 {themes.slice(0, showAllThemes ? undefined : 6).map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => {
                            setSelectedTheme(theme);
                            saveThemeToPresentation(theme);
                        }}
                        className={cn(
                            "group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-200",
                            selectedTheme?.id === theme.id 
                                ? "bg-primary/5 border-primary/50 shadow-sm ring-1 ring-primary/20 scale-105" 
                                : "bg-white/40 border-secondary/20 hover:border-primary/30 hover:bg-white hover:scale-105"
                        )}
                    >
                        {/* Theme Preview Box */}
                        <div className="w-full aspect-[4/3] rounded-lg shadow-sm overflow-hidden relative border border-black/5">
                             <div className="absolute inset-0" style={{ backgroundColor: theme.themeData?.cardBackground || '#fff' }} />
                             <div className="absolute top-0 right-0 w-1/2 h-1/2 rounded-bl-full" style={{ backgroundColor: theme.themeData?.primary || '#8B5CF6' }} />
                             <div className="absolute bottom-2 left-2 text-[8px] font-bold" style={{ color: theme.themeData?.headingColor || '#000' }}>Title</div>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground truncate w-full text-center">
                            {theme.name}
                        </span>
                        {selectedTheme?.id === theme.id && (
                            <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5 shadow-sm">
                                <IconCheck size={8} />
                            </div>
                        )}
                    </button>
                 ))}
            </div>
            
            {themes.length > 6 && (
                <div className="flex justify-center mt-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAllThemes(!showAllThemes)}
                        className="text-xs text-muted-foreground hover:text-primary h-8"
                    >
                        {showAllThemes ? (
                            <><IconChevronDown className="rotate-180 mr-1" size={14} /> Show Less</>
                        ) : (
                            <><IconChevronDown className="mr-1" size={14} /> Show All Themes ({themes.length})</>
                        )}
                    </Button>
                </div>
            )}
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end pt-4">
            <Link href={presentationUrl || "#"}>
                <Button 
                    disabled={!presentationUrl || isStreaming}
                    className="rounded-full h-12 px-8 shadow-coral-glow hover:scale-105 transition-transform font-bold text-base bg-primary text-primary-foreground"
                >
                    {isStreaming ? (
                        <>
                           <IconLoader2 size={18} className="mr-2 animate-spin" /> Generating...
                        </>
                    ) : (
                        <>
                           <IconSparkles size={18} className="mr-2" /> Create Presentation
                        </>
                    )}
                </Button>
            </Link>
        </div>

      </div>
    </div>
  );
}

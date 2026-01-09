"use client";

import React, { useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useOutlineEditor } from "@/app/(protected)/presentation/[id]/hooks/use-outline";
import { OutlineViewer } from "@/components/outline-viewer";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";
import { LoaderOverlay } from "@/components/ui/loader-overlay";

// Sub-components
import { OutlineHeader } from "@/components/outline/OutlineHeader";
import { ThemeSelector } from "@/components/outline/ThemeSelector";

export default function OutlinePage() {
  const params = useParams();
  const outlineId = params.id as string;

  const {
    outline,
    outlineData,
    themes,
    selectedTheme,
    presentationUrl,
    
    // Status
    isLoading,
    isStreaming,
    generationSpeed,
    streamingContent,
    saveStatus,
    
    // Actions
    handleRegenerate,
    debouncedSave,
    setSelectedTheme,
    saveThemeToPresentation,
  } = useOutlineEditor(outlineId);

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
      <div className="w-full max-w-5xl px-6 py-8 bg-white/60 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[32px] flex flex-col gap-8">
        
        <OutlineHeader prompt={outline?.prompt || ""} onRegenerate={handleRegenerate} />

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
                 <div ref={bottomRef} className="h-4 w-full" />
            </div>
        )}

        <ThemeSelector 
          themes={themes} 
          selectedTheme={selectedTheme} 
          onSelectTheme={(theme) => {
            setSelectedTheme(theme);
            saveThemeToPresentation(theme);
          }} 
        />

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
      
      <LoaderOverlay 
        isLoading={isStreaming} 
        message="Generating Outline..." 
        streamSpeed={generationSpeed}
        theme={selectedTheme}
        progress={{
          current: streamingContent ? streamingContent.length : 0,
          total: 0,
          message: "Generating Outline..."
        }}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { OutlineViewer } from "@/components/outline-viewer";
import type { OutlineResponse } from "@/services/presentation";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [outline, setOutline] = useState<OutlineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOutlineGenerated = (
    generatedOutline: OutlineResponse | null,
    errorMessage: string | null
  ) => {
    // If both are null, it means loading started
    if (generatedOutline === null && errorMessage === null) {
      setIsLoading(true);
      setError(null);
      setOutline(null);
    } else if (errorMessage) {
      setError(errorMessage);
      setOutline(null);
      setIsLoading(false);
    } else if (generatedOutline) {
      setOutline(generatedOutline);
      setError(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-3xl flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            How Can I Help You
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a presentation outline from your prompt
          </p>
        </div>

        <div className="w-full space-y-4">
          <PromptBox
            name="message"
            onOutlineGenerated={handleOutlineGenerated}
          />

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {outline && (
          <div className="mt-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <OutlineViewer outline={outline} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}

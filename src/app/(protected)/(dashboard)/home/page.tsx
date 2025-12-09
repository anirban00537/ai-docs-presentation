"use client";

import React, { useState } from "react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);

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
            onError={(errorMessage) => setError(errorMessage)}
          />

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

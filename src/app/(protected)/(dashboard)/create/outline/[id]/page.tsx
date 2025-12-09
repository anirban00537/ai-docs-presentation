"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOutline, generateOutlineStream, updateOutline } from "@/services/presentation";
import type { Outline, OutlineResponse, StreamChunk } from "@/services/presentation";
import { OutlineViewer } from "@/components/outline-viewer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OutlinePage() {
  const params = useParams();
  const router = useRouter();
  const outlineId = params.id as string;

  const [outline, setOutline] = useState<Outline | null>(null);
  const [outlineData, setOutlineData] = useState<OutlineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const titleRef = useRef<string>('');
  const outlinesRef = useRef<Array<{ content: string }>>([]);

  const startGeneration = async () => {
    if (!outlineId) return;

    setIsGenerating(true);
    setIsLoading(false); // Stop initial loading state
    setError(null);
    setOutlineData(null);
    titleRef.current = '';
    outlinesRef.current = [];

    try {
      await generateOutlineStream(outlineId, (chunk) => {
        if (chunk.type === 'title' && chunk.data) {
          titleRef.current = chunk.data;
          setOutlineData({
            title: chunk.data,
            outlines: [],
          });
        } else if (chunk.type === 'outline' && chunk.data) {
          const index = chunk.index ?? outlinesRef.current.length;
          // Create a new array with the updated item
          const updatedOutlines = [...outlinesRef.current];
          updatedOutlines[index] = chunk.data;
          outlinesRef.current = updatedOutlines; // Update the ref
          setOutlineData({
            title: titleRef.current || 'Untitled Presentation',
            outlines: updatedOutlines,
          });
        } else if (chunk.type === 'complete' && chunk.data) {
          setOutlineData(chunk.data);
          setIsGenerating(false);
          setIsLoading(false);
        } else if (chunk.type === 'error') {
          setError(chunk.message || 'Failed to generate outline');
          setIsGenerating(false);
          setIsLoading(false);
        }
      });
    } catch (err: any) {
      setError(err?.message || 'An error occurred while generating outline');
      setIsGenerating(false);
    }
  };

  // Fetch outline on mount
  useEffect(() => {
    const fetchOutline = async () => {
      try {
        const response = await getOutline(outlineId);
        if (response.success && response.data) {
          setOutline(response.data);
          
          // If outline is already completed, set the data
          if (response.data.status === 'completed' && response.data.outlines) {
            setOutlineData({
              title: response.data.title || 'Untitled Presentation',
              outlines: response.data.outlines as any,
            });
            setIsLoading(false);
          } else if (response.data.status === 'generating') {
            // Auto-start generation if status is generating
            startGeneration();
          } else {
            setIsLoading(false);
          }
        } else {
          setError(response.message || 'Failed to fetch outline');
          setIsLoading(false);
        }
      } catch (err: any) {
        setError(err?.message || 'An error occurred');
        setIsLoading(false);
      }
    };

    if (outlineId) {
      fetchOutline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outlineId]);

  const handleSave = async () => {
    if (!outlineData || !outlineId) return;

    setIsSaving(true);
    try {
      const response = await updateOutline(outlineId, {
        title: outlineData.title,
        outlines: outlineData.outlines,
      });

      if (response.success) {
        // Show success message or redirect
        alert('Outline saved successfully!');
      } else {
        setError(response.message || 'Failed to save outline');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-32 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !outline) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-4xl">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* Prompt Display Box */}
        {outline && (
          <div className="rounded-xl bg-card border p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">
              Your Prompt
            </h2>
            <p className="text-foreground whitespace-pre-wrap">{outline.prompt}</p>
            <div className="mt-4 text-xs text-muted-foreground">
              Number of slides: {outline.numberOfSlides}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
            {outline?.status === 'failed' && (
              <Button
                onClick={startGeneration}
                className="mt-2"
                variant="outline"
                size="sm"
              >
                Retry Generation
              </Button>
            )}
          </div>
        )}

        {/* Outline Viewer */}
        {outlineData && (
          <div className="space-y-4">
            <OutlineViewer
              outline={outlineData}
              isLoading={isGenerating}
              editable={true}
              onUpdate={(updatedOutline) => {
                setOutlineData(updatedOutline);
              }}
            />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving || isGenerating}
                variant="default"
              >
                {isSaving ? 'Saving...' : 'Save Outline'}
              </Button>
              <Button
                onClick={() => router.push('/home')}
                variant="outline"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && !outlineData && (
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse bg-muted rounded" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl bg-card p-6 shadow-sm border space-y-2"
                >
                  <div className="h-6 w-2/3 animate-pulse bg-muted rounded" />
                  <div className="h-4 w-full animate-pulse bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


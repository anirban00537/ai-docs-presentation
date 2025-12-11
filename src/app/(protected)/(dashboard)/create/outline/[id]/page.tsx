"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useOutline,
  useUpdateOutline,
  useGenerateOutlineStream,
} from "@/hooks/use-outline";
import type { OutlineResponse } from "@/services/presentation";
import { OutlineViewer } from "@/components/outline-viewer";
import { Button } from "@/components/ui/button";

export default function OutlinePage() {
  const params = useParams();
  const router = useRouter();
  const outlineId = params.id as string;

  const [outlineData, setOutlineData] = useState<OutlineResponse | null>(null);
  const titleRef = useRef<string>("");
  const outlinesRef = useRef<Array<{ content: string }>>([]);
  const hasStartedGeneration = useRef(false);

  // TanStack Query hooks
  const {
    data: outlineResponse,
    isLoading,
    error: outlineError,
  } = useOutline(outlineId);
  const updateOutlineMutation = useUpdateOutline();
  const generateStreamMutation = useGenerateOutlineStream();

  const outline = outlineResponse?.data || null;
  // Only show error if there's a query error or API returned failure
  const error =
    outlineError?.message ||
    (outlineResponse && !outlineResponse.success
      ? outlineResponse.message
      : null);
  console.log(outlineResponse?.data?.presentationId, "outlineResponse");

  // Also check for stream mutation errors
  const streamError = generateStreamMutation.isError
    ? generateStreamMutation.error?.message
    : null;
  const displayError = error || streamError;

  const startGeneration = React.useCallback(async () => {
    if (
      !outlineId ||
      hasStartedGeneration.current ||
      generateStreamMutation.isPending
    )
      return;
    hasStartedGeneration.current = true;

    setOutlineData(null);
    titleRef.current = "";
    outlinesRef.current = [];

    generateStreamMutation.mutate({
      outlineId,
      onChunk: (chunk) => {
        if (chunk.type === "title" && chunk.data) {
          titleRef.current = chunk.data;
          setOutlineData({
            title: chunk.data,
            outlines: [],
          });
        } else if (chunk.type === "outline" && chunk.data) {
          const index = chunk.index ?? outlinesRef.current.length;
          // Create a new array with the updated item
          const updatedOutlines = [...outlinesRef.current];
          updatedOutlines[index] = chunk.data;
          outlinesRef.current = updatedOutlines; // Update the ref
          setOutlineData({
            title: titleRef.current || "Untitled Presentation",
            outlines: updatedOutlines,
          });
        } else if (chunk.type === "complete" && chunk.data) {
          setOutlineData(chunk.data);
        } else if (chunk.type === "error") {
          console.error("Stream error:", chunk.message);
        }
      },
    });
  }, [outlineId, generateStreamMutation]);

  // Auto-start generation if status is generating
  useEffect(() => {
    if (
      outline?.status === "generating" &&
      !hasStartedGeneration.current &&
      !generateStreamMutation.isPending
    ) {
      // Defer the call to avoid synchronous setState in effect
      setTimeout(() => {
        startGeneration();
      }, 0);
    } else if (outline?.status === "completed" && outline.outlines) {
      // Defer setState to avoid synchronous setState in effect
      setTimeout(() => {
        setOutlineData({
          title: outline.title || "Untitled Presentation",
          outlines: outline.outlines as any,
        });
      }, 0);
    }
  }, [
    outline?.status,
    outline?.outlines,
    outline?.title,
    startGeneration,
    generateStreamMutation.isPending,
  ]);

  const handleSave = async () => {
    if (!outlineData || !outlineId) return;

    updateOutlineMutation.mutate(
      {
        id: outlineId,
        payload: {
          title: outlineData.title,
          outlines: outlineData.outlines,
        },
      },
      {
        onSuccess: () => {
          alert("Outline saved successfully!");
        },
        onError: (err: any) => {
          console.error("Failed to save outline:", err);
        },
      }
    );
  };

  const handleCreatePresentation = () => {
    if (!outlineId) return;
    // Redirect to editor with outlineId - editor will handle creation and generation
    router.push(
      `/presentation/${outlineResponse?.data?.presentationId}?outlineId=${outlineId}`
    );
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

  if (displayError && !outline) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-4xl">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {displayError}
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
            <p className="text-foreground whitespace-pre-wrap">
              {outline.prompt}
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              Number of slides: {outline.numberOfSlides}
            </div>
          </div>
        )}

        {/* Error Display */}
        {displayError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {displayError}
            {outline?.status === "failed" && (
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
              isLoading={generateStreamMutation.isPending}
              editable={true}
              onUpdate={(updatedOutline) => {
                setOutlineData(updatedOutline);
              }}
            />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                onClick={handleSave}
                disabled={
                  updateOutlineMutation.isPending ||
                  generateStreamMutation.isPending
                }
                variant="default"
              >
                {updateOutlineMutation.isPending ? "Saving..." : "Save Outline"}
              </Button>
              <Button
                onClick={handleCreatePresentation}
                disabled={
                  updateOutlineMutation.isPending ||
                  generateStreamMutation.isPending
                }
                variant="default"
                className="bg-primary text-primary-foreground"
              >
                Create Presentation
              </Button>
              <Button onClick={() => router.push("/home")} variant="outline">
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {generateStreamMutation.isPending && !outlineData && (
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

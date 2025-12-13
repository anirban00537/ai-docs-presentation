"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useOutline, useUpdateOutline } from "@/hooks/use-outline";
import { OutlineViewer } from "@/components/outline-viewer";
import { Button } from "@/components/ui/button";

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

  // Get presentationId for Link href
  const presentationId =
    outlineResponse?.data?.presentationId || outline?.presentationId;
  const presentationUrl =
    presentationId && outlineId
      ? `/presentation/${presentationId}?outlineId=${outlineId}`
      : null;

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
            {outline.status === "generating" && !outlineData && (
              <div className="mt-4 text-sm text-muted-foreground">
                Generating outline... Please wait.
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {displayError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {displayError}
          </div>
        )}

        {/* Outline Viewer */}
        {outlineData && (
          <div className="space-y-4">
            <OutlineViewer
              outline={outlineData}
              isLoading={isLoading}
              editable={true}
              onUpdate={(updatedOutline) => {
                // Update is handled by the mutation, which will refetch
                updateOutlineMutation.mutate({
                  id: outlineId,
                  payload: updatedOutline,
                });
              }}
            />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                onClick={handleSave}
                disabled={updateOutlineMutation.isPending}
                variant="default"
              >
                {updateOutlineMutation.isPending ? "Saving..." : "Save Outline"}
              </Button>
              {presentationUrl && presentationUrl !== "#" ? (
                <Link href={presentationUrl}>
                  <Button
                    disabled={updateOutlineMutation.isPending}
                    variant="default"
                    className="bg-primary text-primary-foreground"
                  >
                    Create Presentation
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled={true}
                  variant="default"
                  className="bg-primary text-primary-foreground"
                >
                  Create Presentation
                </Button>
              )}
              <Button onClick={() => router.push("/home")} variant="outline">
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Loading State - Show when outline is generating */}
        {outline?.status === "generating" && !outlineData && (
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

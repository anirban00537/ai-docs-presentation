"use client";

import React from "react";
import { useSearchParams, useParams } from "next/navigation";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { motion } from "framer-motion";
import {
  SlideCard,
  SlidesSidebar,
  PresentationTopBar,
  FloatingSidebar,
} from "@/app/(protected)/presentation/[id]/editor";
import { BlockFocusProvider } from "@/app/(protected)/presentation/[id]/editor/BlockFocusContext";
import { useEditorPage } from "./hooks/useEditorPage";
import { useAppSelector } from "@/store/hooks";
import { selectPresentation } from "@/store/slices/slidesSlice";
import { useCreateLayout } from "@/hooks/use-layouts";
import { Button } from "@/components/ui/button";
import { IconDownload, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { convertReduxSlideToApi } from "@/lib/editor/adapters";
import {
  IconFileText,
  IconHash,
  IconMessageCircle,
  IconTarget,
  IconQuote,
  IconTimeline,
  IconGripVertical,
} from "@tabler/icons-react";

// Block type icon mapping
const getBlockTypeIcon = (type: string) => {
  switch (type) {
    case "number-card":
      return <IconHash size={18} />;
    case "testimonial":
      return <IconMessageCircle size={18} />;
    case "cta":
      return <IconTarget size={18} />;
    case "quote":
      return <IconQuote size={18} />;
    case "timeline":
      return <IconTimeline size={18} />;
    default:
      return <IconFileText size={18} />;
  }
};

const getBlockTypeLabel = (type: string) => {
  switch (type) {
    case "number-card":
      return "Number Card";
    case "testimonial":
      return "Testimonial";
    case "cta":
      return "CTA Banner";
    case "quote":
      return "Quote";
    case "timeline":
      return "Timeline";
    case "prosemirror":
      return "Text Block";
    default:
      return type;
  }
};

// --- Main Page Component ---
const GammaPage = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const presentationId = params?.id as string;
  const outlineId = searchParams.get("outlineId");

  const {
    slides,
    theme,
    sensors,
    activeBlock,
    isBlockDragging,
    draggingBlockType,
    handleDragStart,
    handleDragEnd,
    customCollisionDetection,
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
  } = useEditorPage({ presentationId, outlineId });

  const presentation = useAppSelector(selectPresentation);
  const createLayoutMutation = useCreateLayout();

  const isDark = theme.themeType === "dark";

  const handleSaveAsLayout = async (slide?: (typeof slides)[0]) => {
    if (!presentation) {
      toast.error("Presentation not found");
      return;
    }

    // If a specific slide is provided, save only that slide
    // Otherwise, save all slides
    const slidesToSave = slide
      ? [slide]
      : slides.filter((s) => s && s.rows && Array.isArray(s.rows));

    if (slidesToSave.length === 0) {
      toast.error("No slides to save as layout");
      return;
    }

    // Convert slides to API format
    const layoutSlides = slidesToSave.map((s, index) => ({
      ...convertReduxSlideToApi(s),
      order: index,
    }));

    const layoutName = slide
      ? `${presentation.title || "Untitled"} - Slide ${
          slides.indexOf(slide) + 1
        } Layout`
      : `${presentation.title || "Untitled Presentation"} - Layout`;

    createLayoutMutation.mutate(
      {
        name: layoutName,
        description: slide
          ? `Single slide layout saved from presentation: ${
              presentation.title || "Untitled"
            }`
          : `Layout saved from presentation: ${
              presentation.title || "Untitled"
            }`,
        data: {
          slides: layoutSlides,
          theme: theme,
        },
        type: "user",
        tags: [],
      },
      {
        onSuccess: () => {
          toast.success("Layout saved successfully!");
        },
        onError: (error: any) => {
          console.error("Failed to save layout:", error);
          toast.error(error?.message || "Failed to save layout");
        },
      }
    );
  };

  return (
    <>
      <GoogleFontsLoader />
      <PresentationTopBar />
      <div
        className="min-h-screen overflow-y-auto pt-16"
        style={{
          backgroundColor: theme.pageBackground,
          backgroundImage: `radial-gradient(circle at 20% 18%, ${theme.primary}14, transparent 32%), radial-gradient(circle at 80% 12%, ${theme.primary}10, transparent 28%)`,
        }}
      >
        {/* Slides Sidebar */}
        <SlidesSidebar
          slides={slides.filter(
            (slide) => slide && slide.rows && Array.isArray(slide.rows)
          )}
          onUpdateBlock={handleUpdateBlock}
          onDeleteRow={handleDeleteRow}
          onAddColumn={handleAddColumn}
          onAddRowAtTop={handleAddRowAtTop}
          onAddRowAtBottom={handleAddRowAtBottom}
          onUpdateColumnWidths={handleUpdateColumnWidths}
        />

        <div className="max-w-[1200px] mx-auto p-8 pr-20">
          {/* All Slides */}
          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Block Focus Provider for keyboard navigation */}
            <BlockFocusProvider>
              {/* Blocks Panel needs to be inside DndContext for drag to work */}
              <FloatingSidebar presentationId={presentationId} />

              <div className="flex flex-col gap-8">
                {slides
                  .filter(
                    (slide) => slide && slide.rows && Array.isArray(slide.rows)
                  )
                  .map((slide) => (
                    <div
                      key={slide.id}
                      data-slide-id={slide.id}
                      className="group relative"
                    >
                      <SlideCard
                        slide={slide}
                        onUpdateBlock={handleUpdateBlock}
                        onDeleteRow={handleDeleteRow}
                        onAddColumn={handleAddColumn}
                        onAddRowAtTop={handleAddRowAtTop}
                        onAddRowAtBottom={handleAddRowAtBottom}
                        onUpdateColumnWidths={handleUpdateColumnWidths}
                      />
                      {/* Save as Layout Button - Shows on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center mt-4">
                        <Button
                          onClick={() => handleSaveAsLayout(slide)}
                          disabled={createLayoutMutation.isPending}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          style={{
                            borderColor: theme.primary,
                            color: theme.primary,
                          }}
                        >
                          {createLayoutMutation.isPending ? (
                            <>
                              <IconLoader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <IconDownload className="h-4 w-4" />
                              Save as Layout
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </BlockFocusProvider>

            {/* Enhanced Drag Overlay with better ghosting */}
            <DragOverlay
              dropAnimation={{
                duration: 250,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}
            >
              {activeBlock && (
                <motion.div
                  initial={{ scale: 1, opacity: 1, rotate: 0 }}
                  animate={{ scale: 1.02, opacity: 0.95, rotate: 1 }}
                  className="rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(30, 30, 35, 0.98)"
                      : "rgba(255, 255, 255, 0.98)",
                    border: `2px solid ${theme.primary}`,
                    boxShadow: `0 20px 60px -10px rgba(0,0,0,0.3), 0 0 0 1px ${theme.primary}20`,
                    maxWidth: "320px",
                  }}
                >
                  {/* Drag ghost header */}
                  <div
                    className="px-4 py-3 flex items-center gap-3"
                    style={{
                      backgroundColor: `${theme.primary}15`,
                      borderBottom: `1px solid ${theme.primary}20`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: theme.primary,
                        color: "#fff",
                      }}
                    >
                      {getBlockTypeIcon(activeBlock.type || "prosemirror")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-semibold"
                        style={{
                          color: isDark ? "#e5e7eb" : "#1f2937",
                        }}
                      >
                        {getBlockTypeLabel(activeBlock.type || "prosemirror")}
                      </div>
                      <div
                        className="text-xs"
                        style={{
                          color: isDark
                            ? "rgba(255,255,255,0.5)"
                            : "rgba(0,0,0,0.5)",
                        }}
                      >
                        Drop to reposition
                      </div>
                    </div>
                    <IconGripVertical
                      size={20}
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.4)"
                          : "rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                  {/* Animated drop indicator */}
                  <div className="h-1 w-full overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: theme.primary }}
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>
                </motion.div>
              )}
              {isBlockDragging && draggingBlockType && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(30, 30, 35, 0.98)"
                      : "rgba(255, 255, 255, 0.98)",
                    border: `2px solid ${theme.primary}`,
                    boxShadow: `0 20px 60px -10px rgba(0,0,0,0.3)`,
                  }}
                >
                  <div
                    className="px-4 py-3 flex items-center gap-3"
                    style={{
                      backgroundColor: `${theme.primary}15`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: theme.primary,
                        color: "#fff",
                      }}
                    >
                      {getBlockTypeIcon(draggingBlockType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-semibold"
                        style={{
                          color: isDark ? "#e5e7eb" : "#1f2937",
                        }}
                      >
                        {getBlockTypeLabel(draggingBlockType)}
                      </div>
                      <div
                        className="text-xs"
                        style={{
                          color: isDark
                            ? "rgba(255,255,255,0.5)"
                            : "rgba(0,0,0,0.5)",
                        }}
                      >
                        Drop to add block
                      </div>
                    </div>
                  </div>
                  {/* Animated shimmer */}
                  <div className="h-1 w-full overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: theme.primary }}
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </>
  );
};

export default GammaPage;

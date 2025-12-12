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
import { NumberCardIcon } from "@/app/(protected)/presentation/[id]/editor/icons/layout-icons";
import { useEditorPage } from "./hooks/useEditorPage";
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

  const isDark = theme.themeType === "dark";

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
                    <div key={slide.id} data-slide-id={slide.id}>
                      <SlideCard
                        slide={slide}
                        onUpdateBlock={handleUpdateBlock}
                        onDeleteRow={handleDeleteRow}
                        onAddColumn={handleAddColumn}
                        onAddRowAtTop={handleAddRowAtTop}
                        onAddRowAtBottom={handleAddRowAtBottom}
                        onUpdateColumnWidths={handleUpdateColumnWidths}
                      />
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

"use client";

import React from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SlideCard,
  FloatingSidebar,
  SmartLayoutIcon,
  SlidesSidebar,
  PresentationTopBar,
} from "@/components/editor";
import { NumberCardIcon } from "@/components/editor/icons/layout-icons";
import { useEditorPage } from "./hooks/useEditorPage";

// --- Main Page Component ---
const GammaPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const presentationId = params?.id as string;
  const outlineId = searchParams.get("outlineId");

  const {
    slides,
    theme,
    activeSlideId,
    isLayoutPanelOpen,
    setIsLayoutPanelOpen,
    isGeneratingSlides,
    slideGenerationProgress,
    sensors,
    activeBlock,
    isLayoutDragging,
    draggingLayoutColumnCount,
    draggingLayoutBlockType,
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
    handleAddSlide,
  } = useEditorPage({ presentationId, outlineId });

  return (
    <>
      <GoogleFontsLoader />
      <PresentationTopBar />
      <div
        className="min-h-screen overflow-y-auto pt-16"
        style={{
          backgroundColor: theme.pageBackground,
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
        />

        <div className="max-w-[1200px] mx-auto p-8 pr-20">
          {/* All Slides */}
          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-8">
              {slides
                .filter(
                  (slide) => slide && slide.rows && Array.isArray(slide.rows)
                )
                .map((slide, index) => (
                  <div key={slide.id} data-slide-id={slide.id}>
                    <SlideCard
                      slide={slide}
                      index={index}
                      totalSlides={slides.length}
                      onUpdateBlock={handleUpdateBlock}
                      onDeleteRow={handleDeleteRow}
                      onAddColumn={handleAddColumn}
                      onAddRowAtTop={handleAddRowAtTop}
                      onAddRowAtBottom={handleAddRowAtBottom}
                      onDeleteSlide={() => {}}
                      isLayoutDragging={isLayoutDragging}
                      activeLayoutSlideId={null}
                    />
                  </div>
                ))}
            </div>

            {/* Floating Sidebar */}
            <FloatingSidebar
              isLayoutPanelOpen={isLayoutPanelOpen}
              onToggleLayoutPanel={() =>
                setIsLayoutPanelOpen(!isLayoutPanelOpen)
              }
              presentationId={presentationId}
            />

            {/* Drag Overlay */}
            <DragOverlay>
              {activeBlock && (
                <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-2xl opacity-90 max-w-[300px]">
                  <div className="flex items-center gap-2 text-blue-600">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                    <span className="text-sm font-medium">Moving block...</span>
                  </div>
                </div>
              )}
              {isLayoutDragging && draggingLayoutColumnCount && (
                <div className="bg-white border-2 border-blue-400 rounded-xl p-4 shadow-2xl opacity-90">
                  <div className="flex items-center gap-2 text-blue-600">
                    <SmartLayoutIcon />
                    <span className="text-sm font-medium">
                      {draggingLayoutColumnCount} Columns
                    </span>
                  </div>
                </div>
              )}
              {isBlockDragging && draggingBlockType && (
                <div className="bg-white border-2 border-blue-400 rounded-xl p-4 shadow-2xl opacity-90">
                  <div className="flex items-center gap-2 text-blue-600">
                    {draggingBlockType === "number-card" && <NumberCardIcon />}
                    <span className="text-sm font-medium">
                      {draggingBlockType === "number-card"
                        ? "Number Card"
                        : draggingBlockType}
                    </span>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </>
  );
};

export default GammaPage;

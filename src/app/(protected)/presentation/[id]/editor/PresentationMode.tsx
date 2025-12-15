"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { SlideCard } from "./SlideCard";
import { Theme, Slide } from "@/store/slices/slidesSlice";

interface PresentationModeProps {
  isPresenting: boolean;
  slides: Slide[];
  currentSlideIndex: number;
  theme: Theme;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onClose: () => void;
  onUpdateBlock: (slideId: string, blockId: string, content: any) => void;
  onDeleteRow: (slideId: string, rowId: string) => void;
  onAddColumn: (slideId: string, rowId: string, afterBlockId: string) => void;
  onAddRowAtTop: (slideId: string) => void;
  onAddRowAtBottom: (slideId: string) => void;
  onUpdateColumnWidths: (slideId: string, rowId: string, columnWidths: number[]) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  isPresenting,
  slides,
  currentSlideIndex,
  theme,
  containerRef,
  onPrevSlide,
  onNextSlide,
  onClose,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
  onUpdateColumnWidths,
}) => {
  const isDark = theme.themeType === "dark";

  return (
    <AnimatePresence>
      {isPresenting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          ref={containerRef}
          className="fixed inset-0 z-[100] overflow-y-auto"
          style={{
            backgroundColor: theme.pageBackground,
          }}
        >
          {/* Minimal gradient overlay */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${theme.primary}08 0%, transparent 50%)`,
            }}
          />

          {/* Minimal Navigation Controls */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl"
              style={{
                backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)",
              }}
            >
              <button
                onClick={onPrevSlide}
                disabled={currentSlideIndex === 0}
                className="p-1.5 rounded-full transition-all disabled:opacity-30"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                <IconChevronLeft size={18} />
              </button>

              <span
                className="text-sm font-medium tabular-nums min-w-[3rem] text-center"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                {currentSlideIndex + 1} / {slides.length}
              </span>

              <button
                onClick={onNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-1.5 rounded-full transition-all disabled:opacity-30"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                <IconChevronRight size={18} />
              </button>

              <div
                className="w-px h-4 mx-1"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}
              />

              <button
                onClick={onClose}
                className="p-1.5 rounded-full transition-all hover:opacity-70"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                <IconX size={18} />
              </button>
            </motion.div>
          </div>

          {/* Current Slide */}
          <div
            className="min-h-screen w-full flex items-center justify-center p-8"
            style={{ fontFamily: `${theme.fontFamily}, sans-serif` }}
          >
            <AnimatePresence mode="wait">
              {slides[currentSlideIndex] && (
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <SlideCard
                    slide={slides[currentSlideIndex]}
                    onUpdateBlock={onUpdateBlock}
                    onDeleteRow={onDeleteRow}
                    onAddColumn={onAddColumn}
                    onAddRowAtTop={onAddRowAtTop}
                    onAddRowAtBottom={onAddRowAtBottom}
                    onUpdateColumnWidths={onUpdateColumnWidths}
                    enableDragHints={false}
                    readOnly={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

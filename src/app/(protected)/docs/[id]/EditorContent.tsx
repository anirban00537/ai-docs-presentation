"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CardCanvas,
  CardNavigator,
  EditorHeader,
  DocView,
  EditorBackground,
  BlockSelectionProvider,
  ToolbarPanel,
  EditorThemeProvider,
  EditorDndProvider,
  useEditorTheme,
  ScalableCardContainer,
} from "@/app/(protected)/docs/[id]/editor";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { LoadingOverlay } from "@/app/(protected)/docs/[id]/editor";
import { LoaderOverlay } from "@/components/ui";
import { useEditorPage } from "./hooks/useEditorPage";
import { useDocMode } from "./hooks/useDocMode";
import { useAppSelector } from "@/store/hooks";
import { selectDoc, selectActiveCardId } from "@/store/slices/cardsSlice";
import { useUndoRedoKeyboardShortcuts } from "@/app/(protected)/docs/[id]/hooks/useUndoRedo";
import DragOverlayWrapper from "./DragOverlayWrapper";
import { Card } from "@/store/slices/cardsSlice";
import { CARD_MAX_WIDTH } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-auth";


const EditorContent = ({ docId, outlineId }: { docId: string, outlineId: string | null }) => {
  const {
    cards,
    commandBus,
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
    handleAddCard,
    handleDeleteCard,
    isLoadingDoc,
    isGeneratingCards,
    cardGenerationProgress,
    cardGenerationSpeed,
  } = useEditorPage({ docId, outlineId });

  const theme = useEditorTheme();
  const doc = useAppSelector(selectDoc);
  const activeCardId = useAppSelector(selectActiveCardId);
  const isDark = theme.themeType === "dark";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: user } = useProfile();
  
  // Determine if we're in read-only mode
  const isReadOnly = !user && doc?.shareEnabled === true;
  
  // Mobile UI States
  const [isMobileNavigatorOpen, setIsMobileNavigatorOpen] = useState(false);

  useUndoRedoKeyboardShortcuts();

  const {
    isPresenting,
    currentCardIndex,
    docContainerRef,
    startDoc,
    stopDoc,
    goToNextCard,
    goToPrevCard,
  } = useDocMode({
    cardsCount: cards.length,
    cards: cards.filter((card: Card) => card && card.rows && Array.isArray(card.rows)),
    docId,
  });

  useEffect(() => {
    if (activeCardId && !isPresenting && !isGeneratingCards) {
      setTimeout(() => {
        const cardElement = document.querySelector(`[data-card-id="${activeCardId}"]`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      
      // Close mobile navigator when a card is selected
      setIsMobileNavigatorOpen(false);
    }
  }, [activeCardId, isPresenting]);

  useEffect(() => {
    if (isGeneratingCards && cards.length > 0) {
      const timeoutId = setTimeout(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          // Scroll to the absolute bottom of the container during generation.
          // This follows streaming changes closely and keeps the latest content in view.
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "auto"
          });
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isGeneratingCards, cards]); // Watch 'cards' to follow streaming content updates

  const showLoading = isLoadingDoc && !isGeneratingCards;

  if (showLoading) {
    return (
      <>
        <GoogleFontsLoader />
        <LoadingOverlay isGenerating={false} progress={null} />
      </>
    );
  }

  return (
    <>
      <GoogleFontsLoader />

      <DocView
        isPresenting={isPresenting}
        cards={cards}
        currentCardIndex={currentCardIndex}
        theme={theme}
        containerRef={docContainerRef}
        onPrevCard={goToPrevCard}
        onNextCard={goToNextCard}
        onClose={stopDoc}
        onUpdateBlock={handleUpdateBlock}
        onDeleteRow={handleDeleteRow}
        onAddColumn={handleAddColumn}
        onAddRowAtTop={handleAddRowAtTop}
        onAddRowAtBottom={handleAddRowAtBottom}
        onUpdateColumnWidths={handleUpdateColumnWidths}
      />

      <EditorHeader 
        onPresentClick={startDoc} 
        onMenuClick={() => setIsMobileNavigatorOpen(!isMobileNavigatorOpen)}
        isReadOnly={isReadOnly}
      />

      <div className="fixed inset-0 pt-14 flex overflow-hidden">
        <EditorBackground theme={theme} />

        {/* Desktop Sidebar */}
        {!isReadOnly && (
          <div className="hidden lg:flex h-full">
            <CardNavigator
              cards={cards.filter(
                (card: Card) => card && card.rows && Array.isArray(card.rows)
              )}
              onUpdateBlock={handleUpdateBlock}
              onDeleteRow={handleDeleteRow}
              onAddColumn={handleAddColumn}
              onAddRowAtTop={handleAddRowAtTop}
              onAddRowAtBottom={handleAddRowAtBottom}
              onUpdateColumnWidths={handleUpdateColumnWidths}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileNavigatorOpen && (
            <div className="lg:hidden fixed inset-0 z-[100]">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileNavigatorOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-0 left-0 bottom-0 w-[240px] bg-white dark:bg-[#121216] shadow-2xl"
              >
                <div className="h-full w-full overflow-hidden">
                   <CardNavigator
                      cards={cards.filter(
                        (card: Card) => card && card.rows && Array.isArray(card.rows)
                      )}
                      onUpdateBlock={handleUpdateBlock}
                      onDeleteRow={handleDeleteRow}
                      onAddColumn={handleAddColumn}
                      onAddRowAtTop={handleAddRowAtTop}
                      onAddRowAtBottom={handleAddRowAtBottom}
                      onUpdateColumnWidths={handleUpdateColumnWidths}
                      onAddCard={handleAddCard}
                      onDeleteCard={handleDeleteCard}
                      isMobile={true}
                    />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto w-full relative">
            <div className="w-full max-w-[1400px] mx-auto px-4 py-8 flex flex-col items-center min-h-full">
              {isReadOnly ? (
                // Read-only view - no editing capabilities
                <div className="flex flex-col w-full items-center pb-32 gap-3">
                  {cards
                    .filter(
                      (card: Card) => card && card.rows && Array.isArray(card.rows)
                    )
                    .map((card: Card, index: number) => (
                      <motion.div
                        key={card.id}
                        data-card-id={card.id}
                        data-card-index={index}
                        className="w-full max-w-full relative"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <div
                          className="absolute -left-10 top-0 text-xs font-bold opacity-30 select-none hidden xl:block"
                          style={{ color: theme.bodyColor }}
                        >
                          {index + 1}
                        </div>

                        <ScalableCardContainer>
                          <CardCanvas
                            card={card}
                            onUpdateBlock={() => {}}
                            onDeleteRow={() => {}}
                            onAddColumn={() => {}}
                            onAddRowAtTop={() => {}}
                            onAddRowAtBottom={() => {}}
                            onUpdateColumnWidths={() => {}}
                            readOnly={true}
                          />
                        </ScalableCardContainer>
                      </motion.div>
                    ))}
                </div>
              ) : (
                // Full editing mode
                <EditorDndProvider cards={cards} commandBus={commandBus}>
                  <BlockSelectionProvider>
                    <ToolbarPanel docId={docId} />

                    <div className="flex flex-col w-full items-center pb-32 gap-3">
                      {cards
                        .filter(
                          (card: Card) => card && card.rows && Array.isArray(card.rows)
                        )
                        .map((card: Card, index: number) => (
                          <motion.div
                            key={card.id}
                            data-card-id={card.id}
                            data-card-index={index}
                            className="w-full max-w-full relative"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                          >
                            <div
                              className="absolute -left-10 top-0 text-xs font-bold opacity-30 select-none hidden xl:block"
                              style={{ color: theme.bodyColor }}
                            >
                              {index + 1}
                            </div>

                            <ScalableCardContainer>
                              <CardCanvas
                                card={card}
                                onUpdateBlock={handleUpdateBlock}
                                onDeleteRow={handleDeleteRow}
                                onAddColumn={handleAddColumn}
                                onAddRowAtTop={handleAddRowAtTop}
                                onAddRowAtBottom={handleAddRowAtBottom}
                                onUpdateColumnWidths={handleUpdateColumnWidths}
                              />
                            </ScalableCardContainer>
                          </motion.div>
                        ))}
                    </div>
                  </BlockSelectionProvider>

                  <DragOverlayWrapper />
                </EditorDndProvider>
              )}
            </div>
          </div>
        </div>
      </div>

      <LoaderOverlay
        isLoading={isGeneratingCards}
        progress={cardGenerationProgress}
        theme={theme}
        mode={isDark ? "dark" : "light"}
        streamSpeed={cardGenerationSpeed}
      />
    </>
  );
};

export default EditorContent;
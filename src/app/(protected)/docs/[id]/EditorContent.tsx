"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  const lastScrolledCardId = useRef<string | null>(null);

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

  // Determine valid cards once to ensure consistency
  const validCards = useMemo(() => {
    return cards.filter(
      (card: Card) => card && card.rows && Array.isArray(card.rows)
    );
  }, [cards]);

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: validCards.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 600, // Estimate card height + buffer
    overscan: 3, // Render 3 items outside viewport for smoother scrolling
  });

  useEffect(() => {
    if (activeCardId && !isPresenting && !isGeneratingCards) {
      // Only scroll if the active card has changed to prevent jumps while typing
      if (activeCardId !== lastScrolledCardId.current) {
        const index = validCards.findIndex((c: Card) => c.id === activeCardId);
        if (index !== -1) {
          // Use virtualizer to scroll to the card
          rowVirtualizer.scrollToIndex(index, { align: "center", behavior: "smooth" });
          lastScrolledCardId.current = activeCardId;
          
          // Close mobile navigator when a card is selected
          setIsMobileNavigatorOpen(false);
        }
      }
    } else if (!activeCardId) {
      lastScrolledCardId.current = null;
    }
  }, [activeCardId, isPresenting, validCards, rowVirtualizer, isGeneratingCards]);

  useEffect(() => {
    if (!isGeneratingCards || validCards.length === 0) return;
    
    // Continuously scroll to bottom during content generation
    // This ensures new content is always visible as it streams in
    const scrollToBottom = () => {
      const scrollElement = scrollContainerRef.current;
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "auto",
        });
      }
    };
    
    // Initial scroll
    scrollToBottom();
    
    // Set up interval to keep scrolling as content grows
    const intervalId = setInterval(scrollToBottom, 200);
    
    return () => clearInterval(intervalId);
  }, [isGeneratingCards, validCards.length]);

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
                <div className="flex flex-col w-full items-center pb-32">
                  <div
                    className="relative w-full"
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                      const card = validCards[virtualItem.index];
                      // Just in case
                      if (!card) return null;

                      return (
                        <div
                          key={card.id}
                          ref={rowVirtualizer.measureElement}
                          data-index={virtualItem.index}
                          className="absolute top-0 w-full flex justify-center pb-3"
                          style={{
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <motion.div
                            data-card-id={card.id}
                            data-card-index={virtualItem.index}
                            className="w-full max-w-full relative"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div
                              className="absolute -left-10 top-0 text-xs font-bold opacity-30 select-none hidden xl:block"
                              style={{ color: theme.bodyColor }}
                            >
                              {virtualItem.index + 1}
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Full editing mode
                <EditorDndProvider cards={cards} commandBus={commandBus}>
                  <BlockSelectionProvider>
                    <ToolbarPanel docId={docId} />

                    <div className="flex flex-col w-full items-center pb-32">
                      <div
                        className="relative w-full"
                        style={{
                          height: `${rowVirtualizer.getTotalSize()}px`,
                        }}
                      >
                        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                          const card = validCards[virtualItem.index];
                          if (!card) return null;

                          return (
                            <div
                              key={card.id}
                              ref={rowVirtualizer.measureElement}
                              data-index={virtualItem.index}
                              className="absolute top-0 w-full flex justify-center pb-3"
                              style={{
                                transform: `translateY(${virtualItem.start}px)`,
                              }}
                            >
                              <motion.div
                                data-card-id={card.id}
                                data-card-index={virtualItem.index}
                                className="w-full max-w-full relative"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div
                                  className="absolute -left-10 top-0 text-xs font-bold opacity-30 select-none hidden xl:block"
                                  style={{ color: theme.bodyColor }}
                                >
                                  {virtualItem.index + 1}
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
                            </div>
                          );
                        })}
                      </div>
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
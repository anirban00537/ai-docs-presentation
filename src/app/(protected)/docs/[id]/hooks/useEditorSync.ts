"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCards, selectTheme, Card } from "@/store/slices/cardsSlice";
import { useUpdateCard, useUpdateDoc, useReorderCards } from "@/hooks/use-docs";
import { convertReduxCardToApi } from "@/lib/editor/adapters";

/**
 * Hook to automatically sync Redux state changes to the backend.
 * Replaces the cardsApiMiddleware with a cleaner, React-native implementation.
 */
export function useEditorSync(docId: string | null) {
  const cards = useAppSelector(selectCards);
  const theme = useAppSelector(selectTheme);
  
  const updateCardMutation = useUpdateCard();
  const updateDocMutation = useUpdateDoc();
  const reorderCardsMutation = useReorderCards();
  
  const prevCardsRef = useRef<Card[]>([]);
  const prevThemeRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!docId || cards.length === 0) return;

    // Detect what changed
    const changedCards = cards.filter(card => {
      const prev = prevCardsRef.current.find(pc => pc.id === card.id);
      if (!prev) return false; // Creation is handled by separate actions
      return JSON.stringify(prev) !== JSON.stringify(card);
    });

    const themeChanged = JSON.stringify(prevThemeRef.current) !== JSON.stringify(theme);

    // Detect reordering
    const cardsReordered = cards.length > 0 && 
      prevCardsRef.current.length === cards.length && 
      cards.some((c, i) => prevCardsRef.current[i] && c.id !== prevCardsRef.current[i].id);

    if (changedCards.length > 0 || themeChanged || cardsReordered) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        // Sync cards content
        for (const card of changedCards) {
          const apiData = convertReduxCardToApi(card);
          updateCardMutation.mutate({
            docId,
            cardId: card.id,
            payload: apiData,
          });
        }

        // Sync reordering
        if (cardsReordered) {
          const cardOrders = cards.map((c, i) => ({ cardId: c.id, order: i }));
          reorderCardsMutation.mutate({
            docId,
            cardOrders,
          });
        }

        // Sync theme
        if (themeChanged) {
          updateDocMutation.mutate({
            id: docId,
            payload: { globalTheme: theme },
          });
        }

        // Update refs
        prevCardsRef.current = JSON.parse(JSON.stringify(cards));
        prevThemeRef.current = JSON.parse(JSON.stringify(theme));
      }, 1000);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [cards, theme, docId, updateCardMutation, updateDocMutation, reorderCardsMutation]);

  // Initial ref set
  useEffect(() => {
    if (cards.length > 0 && prevCardsRef.current.length === 0) {
      prevCardsRef.current = JSON.parse(JSON.stringify(cards));
    }
    if (theme && !prevThemeRef.current) {
      prevThemeRef.current = JSON.parse(JSON.stringify(theme));
    }
  }, [cards, theme]);
}

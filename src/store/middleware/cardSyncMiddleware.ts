/**
 * Redux Middleware for Card Synchronization
 * 
 * This middleware intercepts specific Redux actions that modify card data
 * and queues them for syncing to the backend. It only syncs when there are
 * actual user-initiated changes, not on page load.
 * 
 * Architecture:
 * 1. Middleware intercepts actions that modify cards
 * 2. Tracks which cards are "dirty" (have pending changes)
 * 3. Debounces and batches API calls
 * 4. Only syncs cards that were explicitly modified
 */

import { Middleware } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { updateCard, reorderCards as reorderCardsApi, updateDoc } from "@/services/docs";
import { convertReduxCardToApi } from "@/lib/editor/adapters";

// Actions that should trigger a card sync (user modifications)
const CARD_MODIFYING_ACTIONS = [
  "cards/updateBlockContent",
  "cards/addBlockToRow",
  "cards/addRow",
  "cards/addRowToCard",
  "cards/addRowWithColumns",
  "cards/addRowWithColumnsAtIndex",
  "cards/addRowAtTop",
  "cards/deleteRow",
  "cards/setCardRows",
  "cards/replaceCardWithLayout",
  "cards/repositionBlock",
  "cards/moveBlock",
  "cards/reorderBlocksInRow",
  "cards/updateCardAccent",
  "cards/setCardAccentSize",
  "cards/addCardAccent",
  "cards/removeCardAccent",
  "cards/updateRowLayout",
  "cards/splitColumn",
  "cards/mergeColumns",
  "cards/deleteBlock",
];

// Actions that trigger reorder sync
const REORDER_ACTIONS = ["cards/reorderCards"];

// Actions that trigger theme sync
const THEME_ACTIONS = ["cards/setTheme"];

// Actions that should NOT trigger sync (loading data from API)
const LOADING_ACTIONS = [
  "cards/setCards",
  "cards/setDoc",
  "cards/setActiveCard",
  "cards/updateCardId",
  "cards/replaceCardWithServerData",
];

// Track dirty cards and pending syncs
interface SyncState {
  dirtyCardIds: Set<string>;
  pendingThemeSync: boolean;
  pendingReorderSync: boolean;
  docId: string | null;
  debounceTimer: NodeJS.Timeout | null;
}

const syncState: SyncState = {
  dirtyCardIds: new Set(),
  pendingThemeSync: false,
  pendingReorderSync: false,
  docId: null,
  debounceTimer: null,
};

// Debounce delay in ms
const SYNC_DEBOUNCE_MS = 1000;

/**
 * Extract card ID from action payload
 */
function getCardIdFromAction(action: any): string | null {
  if (!action.payload) return null;
  
  // Most actions have cardId directly
  if (action.payload.cardId) return action.payload.cardId;
  
  // Some actions might have it nested
  if (typeof action.payload === "string") return action.payload;
  
  return null;
}

/**
 * Perform the actual sync to backend
 */
async function performSync(state: RootState) {
  const { dirtyCardIds, pendingThemeSync, pendingReorderSync, docId } = syncState;
  
  if (!docId) {
    console.warn("[CardSyncMiddleware] No docId set, skipping sync");
    return;
  }
  // Handle redux-undo wrapper - cards slice may be wrapped
  const cardsState = state.cards as any;
  const cards = cardsState.present?.cards || cardsState.cards || [];
  const theme = cardsState.present?.theme || cardsState.theme;
  
  // Sync dirty cards
  if (dirtyCardIds.size > 0) {
    const cardIdsToSync = Array.from(dirtyCardIds);
    
    for (const cardId of cardIdsToSync) {
      const card = cards.find((c: any) => c.id === cardId);
      if (card) {
        try {
          const apiData = convertReduxCardToApi(card);
          await updateCard(docId, cardId, apiData);
        } catch (error) {
          console.error(`[CardSyncMiddleware] Failed to sync card ${cardId}:`, error);
        }
      }
    }
    
    // Clear synced cards
    syncState.dirtyCardIds.clear();
  }
  
  // Sync reorder
  if (pendingReorderSync) {
    try {
      const cardOrders = cards.map((c: any, i: number) => ({ cardId: c.id, order: i }));
      await reorderCardsApi(docId, cardOrders);
    } catch (error) {
      console.error("[CardSyncMiddleware] Failed to sync card order:", error);
    }
    syncState.pendingReorderSync = false;
  }
  
  // Sync theme
  if (pendingThemeSync) {
    try {
      await updateDoc(docId, { globalTheme: theme });
    } catch (error) {
      console.error("[CardSyncMiddleware] Failed to sync theme:", error);
    }
    syncState.pendingThemeSync = false;
  }
}

/**
 * Schedule a sync with debouncing
 */
function scheduleSync(getState: () => RootState) {
  // Clear existing timer
  if (syncState.debounceTimer) {
    clearTimeout(syncState.debounceTimer);
  }
  
  // Schedule new sync
  syncState.debounceTimer = setTimeout(() => {
    performSync(getState());
  }, SYNC_DEBOUNCE_MS);
}

/**
 * Set the current document ID for syncing
 */
export function setDocIdForSync(docId: string | null) {
  syncState.docId = docId;
  // Reset state when doc changes
  syncState.dirtyCardIds.clear();
  syncState.pendingThemeSync = false;
  syncState.pendingReorderSync = false;
  if (syncState.debounceTimer) {
    clearTimeout(syncState.debounceTimer);
    syncState.debounceTimer = null;
  }
}

/**
 * Force an immediate sync (useful before navigation)
 */
export function flushPendingSync(getState: () => RootState) {
  if (syncState.debounceTimer) {
    clearTimeout(syncState.debounceTimer);
    syncState.debounceTimer = null;
  }
  if (syncState.dirtyCardIds.size > 0 || syncState.pendingThemeSync || syncState.pendingReorderSync) {
    performSync(getState());
  }
}

/**
 * Check if there are pending changes
 */
export function hasPendingChanges(): boolean {
  return syncState.dirtyCardIds.size > 0 || syncState.pendingThemeSync || syncState.pendingReorderSync;
}

/**
 * The actual middleware
 */
export const cardSyncMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
  // Let the action go through first
  const result = next(action);
  
  // Skip if no docId set
  if (!syncState.docId) {
    return result;
  }
  
  const actionType = action.type as string;
  
  // Skip loading actions - they don't represent user changes
  if (LOADING_ACTIONS.includes(actionType)) {
    return result;
  }
  
  // Handle card-modifying actions
  if (CARD_MODIFYING_ACTIONS.includes(actionType)) {
    const cardId = getCardIdFromAction(action);
    if (cardId) {
      syncState.dirtyCardIds.add(cardId);
      scheduleSync(store.getState);
    }
  }
  
  // Handle reorder actions
  if (REORDER_ACTIONS.includes(actionType)) {
    syncState.pendingReorderSync = true;
    scheduleSync(store.getState);
  }
  
  // Handle theme actions
  if (THEME_ACTIONS.includes(actionType)) {
    syncState.pendingThemeSync = true;
    scheduleSync(store.getState);
  }
  
  return result;
};

export default cardSyncMiddleware;

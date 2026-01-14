import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDocsList,
  getDoc,
  createDoc,
  createDocFromPrompt,
  updateDoc,
  updateDocTitle,
  deleteDoc,
  createCard,
  updateCard,
  deleteCard,
  reorderCards,
  type CreateDocPayload,
  type CreateFromPromptPayload,
  type UpdateDocPayload,
  type CreateCardPayload,
  type UpdateCardPayload,
} from "@/services/docs";

// Query keys
export const docKeys = {
  all: ["docs"] as const,
  lists: () => [...docKeys.all, "list"] as const,
  list: (filters?: { page?: number; limit?: number }) =>
    [...docKeys.lists(), filters] as const,
  detail: (id: string) => [...docKeys.all, id] as const,
};

// Get docs list query
export const useDocsList = (filters?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: docKeys.list(filters),
    queryFn: () => getDocsList(filters),
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};

// Get doc query
export const useDoc = (docId: string | null) => {
  return useQuery({
    queryKey: docId
      ? docKeys.detail(docId)
      : ["doc", "null"],
    queryFn: () => {
      if (!docId) {
        throw new Error("Doc ID is required");
      }
      return getDoc(docId);
    },
    enabled: !!docId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create doc mutation
export const useCreateDoc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDocPayload) =>
      createDoc(payload),
    onSuccess: () => {
      // Invalidate docs list
      queryClient.invalidateQueries({ queryKey: docKeys.all });
    },
  });
};

// Create doc from prompt mutation
export const useCreateDocFromPrompt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFromPromptPayload) =>
      createDocFromPrompt(payload),
    onSuccess: () => {
      // Invalidate docs list
      queryClient.invalidateQueries({ queryKey: docKeys.all });
    },
  });
};

// Update doc mutation
export const useUpdateDoc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDocPayload;
    }) => updateDoc(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate specific doc
      queryClient.invalidateQueries({
        queryKey: docKeys.detail(variables.id),
      });
      // Invalidate docs list
      queryClient.invalidateQueries({ queryKey: docKeys.all });
    },
  });
};

// Update doc title mutation
export const useUpdateDocTitle = () => {
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateDocTitle(id, title),
    // No query invalidation needed - Redux is the source of truth
    // The title is already updated in Redux before the API call
  });
};

// Delete doc mutation
export const useDeleteDoc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDoc(id),
    onSuccess: () => {
      // Invalidate docs list
      queryClient.invalidateQueries({ queryKey: docKeys.all });
    },
  });
};

// Create card mutation
export const useAddCard = () => {
  return useMutation({
    mutationFn: ({
      docId,
      payload,
    }: {
      docId: string;
      payload: CreateCardPayload;
    }) => createCard(docId, payload),
    // No query invalidation needed - Redux is the source of truth
    // The card is already in Redux and ID is updated via updateCardId
  });
};

// Update card mutation
export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      cardId,
      payload,
    }: {
      docId: string;
      cardId: string;
      payload: UpdateCardPayload;
    }) => updateCard(docId, cardId, payload),
    onSuccess: (data, variables) => {
      // Invalidate specific doc
      queryClient.invalidateQueries({
        queryKey: docKeys.detail(variables.docId),
      });
    },
  });
};

// Delete card mutation
export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      cardId,
    }: {
      docId: string;
      cardId: string;
    }) => deleteCard(docId, cardId),
    onSuccess: (data, variables) => {
      // Invalidate specific doc
      queryClient.invalidateQueries({
        queryKey: docKeys.detail(variables.docId),
      });
    },
  });
};

// Reorder cards mutation
export const useReorderCards = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      cardOrders,
    }: {
      docId: string;
      cardOrders: { cardId: string; order: number }[];
    }) => reorderCards(docId, cardOrders),
    onSuccess: (data, variables) => {
      // Invalidate specific doc
      queryClient.invalidateQueries({
        queryKey: docKeys.detail(variables.docId),
      });
    },
  });
};

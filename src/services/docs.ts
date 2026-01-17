import { api } from "@/lib/api";
import { CONFIG } from "@/lib/config";
import type { ApiResponse } from "@/types/api.types";
import request from "@/lib/request";

// Supported document types
export const DOC_TYPES = ['presentation', 'carousel', 'resume', 'infographic', 'report'] as const;
export type DocType = typeof DOC_TYPES[number];

export interface OutlineItem {
  content: string;
}

export interface OutlineResponse {
  title: string;
  outlines: OutlineItem[];
}

export interface CreatePlanFromPromptDto {
  prompt: string;
  numberOfCards: number;
}

export type CreateFromPromptPayload = CreatePlanFromPromptDto;

export interface SavePromptResponse {
  id: string;
}

export interface StreamChunk {
  type: "start" | "chunk" | "title" | "outline" | "complete" | "error";
  content?: string;
  data?: any;
  index?: number;
  message?: string;
  accumulated?: string;
  delta?: string;
}

export interface CardGenerationChunk {
  type:
    | "start"
    | "card-start"
    | "card-progress"
    | "card-streaming"
    | "card"
    | "card-error"
    | "complete"
    | "error";
  cardNumber?: number;
  totalCards?: number;
  cardId?: string;
  data?: any;
  partialData?: any;
  rawChunk?: string;
  accumulatedText?: string;
  isComplete?: boolean;
  message?: string;
  estimatedSeconds?: number;
  stage?: 'initializing' | 'analyzing-layout' | 'generating-content' | 'saving-card';
  duration?: string;
}

// Doc interfaces
export interface Doc {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  docType?: DocType;
  globalTheme?: any;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
  version?: number;
  parentId?: string | null;
  forkedFrom?: string | null;
  sharedWith?: string[];
  ownerId?: string;
  shareEnabled?: boolean;
  deletedAt?: string | null;
  lastViewedAt?: string | null;
  // Outline fields (merged from Outline)
  prompt?: string;
  numberOfCards?: number;
  outlineStatus?: "none" | "generating" | "completed" | "failed";
  cards?: Card[];
  _count?: {
    cards: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ShareInfo {
  shareEnabled: boolean;
}

export interface SharedDoc {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  globalTheme: any;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export interface Card {
  id: string;
  docId: string;
  data: any; // JSON data containing rows/blocks
  order: number;
  outline?: any; // Individual outline data for this card
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocPayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  docType?: DocType;
  globalTheme?: any;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
  prompt?: string;
  numberOfCards?: number;
}

export interface UpdateDocPayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  docType?: DocType;
  globalTheme?: any;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
  prompt?: string;
  numberOfCards?: number;
  outlineStatus?: string;
}

export interface CreateCardPayload {
  data?: any;
  order?: number;
  outline?: any;
}

export interface UpdateCardPayload {
  data?: any;
  order?: number;
  outline?: any;
}

// Doc API functions
export const getDocsList = (filters?: { page?: number; limit?: number }) => 
  api.get<{ list: Doc[]; meta: any }>("/docs/list", { params: filters });

export const getDoc = (id: string) => 
  api.get<Doc>(`/docs/${id}/get`);

export const createDoc = (payload: CreateDocPayload) => 
  api.post<Doc>("/docs/create", payload);

export const createDocFromPrompt = (payload: CreatePlanFromPromptDto) => 
  api.post<Doc>("/docs/create-from-prompt", payload);

export const updateDoc = (id: string, payload: UpdateDocPayload) => 
  api.patch<Doc>(`/docs/${id}/update`, payload);

export const updateDocTitle = (id: string, title: string) => 
  api.patch<Doc>(`/docs/${id}/update-title`, { title });

export const deleteDoc = (id: string) => 
  api.delete<void>(`/docs/${id}/delete`);

export const createCard = (docId: string, payload: CreateCardPayload) => 
  api.post<Card>(`/docs/${docId}/cards/add`, payload);

export const updateCard = (docId: string, cardId: string, payload: UpdateCardPayload) => 
  api.patch<Card>(`/docs/${docId}/cards/${cardId}/update`, payload);

export const deleteCard = (docId: string, cardId: string) => 
  api.delete<void>(`/docs/${docId}/cards/${cardId}/delete`);

export const reorderCards = (
  docId: string,
  cardOrders: { cardId: string; order: number }[]
) => api.post<void>(`/docs/${docId}/cards/reorder`, { cardOrders });

export const savePrompt = (payload: CreatePlanFromPromptDto) => 
  api.post<SavePromptResponse>(`/docs/save-prompt`, payload);

// Reusable SSE Stream Handler
const handleSSEStream = async (url: string, onChunk: (chunk: any) => void) => {
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
    return "";
  };

  const token = getCookie("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    apisecretkeycheck: CONFIG.API_SECRET,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      onChunk({
        type: "error",
        message: `Request failed with status ${response.status}. Please try again.`,
      });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onChunk({ type: "error", message: "No response body received." });
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (value) buffer += decoder.decode(value, { stream: !done });
        
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const row = line.slice(6).trim();
            if (row) {
              try {
                const chunk = JSON.parse(row);
                onChunk(chunk);
                if (chunk.type === "error") {
                  reader.releaseLock();
                  return;
                }
              } catch (e) {
                console.error("SSE parse error", e);
              }
            }
          }
        }
        if (done) break;
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error: any) {
    onChunk({ type: "error", message: error.message });
  }
};

export const generateAndCreateCards = (docId: string, onChunk: (chunk: CardGenerationChunk) => void) => 
  handleSSEStream(`${CONFIG.API_URL}/docs/${docId}/cards/create`, onChunk);

export const generateOutlineStream = (docId: string, onChunk: (chunk: StreamChunk) => void) => 
  handleSSEStream(`${CONFIG.API_URL}/docs/${docId}/generate-outline`, onChunk);

// Share API functions
export const enableShare = (docId: string) => 
  api.post<ShareInfo>(`/docs/${docId}/share/enable`);

export const disableShare = (docId: string) => 
  api.post<ShareInfo>(`/docs/${docId}/share/disable`);

export const getShareInfo = (docId: string) => 
  api.get<ShareInfo>(`/docs/${docId}/share`);

// Public share API functions (no auth required)
export const getSharedDoc = (token: string) => 
  api.get<SharedDoc>(`/docs/public/share/${token}`);

export const getSharedDocCards = (token: string) => 
  api.get<Card[]>(`/docs/public/share/${token}/cards`);

// Export API functions
export const exportDocToPptx = async (docId: string): Promise<Blob> => {
  // For blob responses, use request directly to get the blob
  const response = await request.get(`/docs/${docId}/export/pptx`, {
    responseType: 'blob',
  });
  
  return response.data as Blob;
};

export const exportDocToPdf = async (docId: string): Promise<Blob> => {
  // For blob responses, use request directly to get the blob
  const response = await request.get(`/docs/${docId}/export/pdf`, {
    responseType: 'blob',
  });
  
  return response.data as Blob;
};

export const exportDocToPng = async (docId: string): Promise<Blob> => {
  // For blob responses, use request directly to get the blob (ZIP file)
  const response = await request.get(`/docs/${docId}/export/png`, {
    responseType: 'blob',
  });
  
  return response.data as Blob;
};

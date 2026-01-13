import { api } from "@/lib/api";
import { CONFIG } from "@/lib/config";
import type { ApiResponse } from "@/types/api.types";
import request from "@/lib/request";

export interface OutlineItem {
  content: string;
}

export interface OutlineResponse {
  title: string;
  outlines: OutlineItem[];
}

export interface CreatePlanFromPromptDto {
  prompt: string;
  numberOfSlides: number;
}

export type CreateFromPromptPayload = CreatePlanFromPromptDto;

export interface CreateOutlineDto {
  prompt: string;
  numberOfSlides: number;
}

export interface UpdateOutlineDto {
  title?: string;
  prompt?: string;
  numberOfSlides?: number;
  outlines?: OutlineItem[];
}

export interface Outline {
  id: string;
  userId: string;
  prompt: string;
  numberOfSlides: number;
  title?: string;
  outlines?: OutlineItem[];
  status: "generating" | "completed" | "failed";
  presentationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavePromptResponse {
  id: string;
  presentationId?: string;
}

export const reorderSlides = (
  presentationId: string,
  slideOrders: { slideId: string; order: number }[]
) => api.post<void>(`/presentation/${presentationId}/slides/reorder`, { slideOrders });

export const savePrompt = (payload: CreateOutlineDto) => 
  api.post<SavePromptResponse>(`/presentation/save-prompt`, payload);

export const getOutline = (id: string) => 
  api.get<Outline>(`/presentation/outline/${id}`);

export const updateOutline = (id: string, payload: UpdateOutlineDto) => 
  api.patch<Outline>(`/presentation/outline/${id}`, payload);

export interface StreamChunk {
  type: "start" | "chunk" | "title" | "outline" | "complete" | "error";
  content?: string;
  data?: any;
  index?: number;
  message?: string;
  accumulated?: string;
  delta?: string;
}

export interface SlideGenerationChunk {
  type:
    | "start"
    | "slide-start"
    | "slide-progress"
    | "slide-streaming"
    | "slide"
    | "slide-error"
    | "complete"
    | "error";
  slideNumber?: number;
  totalSlides?: number;
  slideId?: string;
  data?: any;
  partialData?: any;
  rawChunk?: string;
  accumulatedText?: string;
  isComplete?: boolean;
  message?: string;
  estimatedSeconds?: number;
  stage?: 'initializing' | 'analyzing-layout' | 'generating-content' | 'saving-slide';
  duration?: string;
}

// Presentation interfaces
export interface Presentation {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  thumbnail?: string;
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
  slides?: Slide[];
  createdAt: string;
  updatedAt: string;
}

export interface ShareInfo {
  shareEnabled: boolean;
}

export interface SharedPresentation {
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

export interface Slide {
  id: string;
  presentationId: string;
  data: any; // JSON data containing rows/blocks
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePresentationPayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  globalTheme?: any;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
}

export interface UpdatePresentationPayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  globalTheme?: any;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
}

export interface CreateSlidePayload {
  data?: any;
  order?: number;
}

export interface UpdateSlidePayload {
  data?: any;
  order?: number;
}

// Presentation API functions
export const getPresentationsList = (filters?: { page?: number; limit?: number }) => 
  api.get<{ list: Presentation[]; meta: any }>("/presentation/list", { params: filters });

export const getPresentation = (id: string) => 
  api.get<Presentation>(`/presentation/${id}/get`);

export const createPresentation = (payload: CreatePresentationPayload) => 
  api.post<Presentation>("/presentation/create", payload);

export const createPresentationFromPrompt = (payload: CreatePlanFromPromptDto) => 
  api.post<Presentation>("/presentation/create-from-prompt", payload);

export const updatePresentation = (id: string, payload: UpdatePresentationPayload) => 
  api.patch<Presentation>(`/presentation/${id}/update`, payload);

export const updatePresentationTitle = (id: string, title: string) => 
  api.patch<Presentation>(`/presentation/${id}/update-title`, { title });

export const deletePresentation = (id: string) => 
  api.delete<void>(`/presentation/${id}/delete`);

export const createSlide = (presentationId: string, payload: CreateSlidePayload) => 
  api.post<Slide>(`/presentation/${presentationId}/slides/add`, payload);

export const updateSlide = (presentationId: string, slideId: string, payload: UpdateSlidePayload) => 
  api.patch<Slide>(`/presentation/${presentationId}/slides/${slideId}/update`, payload);

export const deleteSlide = (presentationId: string, slideId: string) => 
  api.delete<void>(`/presentation/${presentationId}/slides/${slideId}/delete`);

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

export const generateAndCreateSlides = (presentationId: string, onChunk: (chunk: SlideGenerationChunk) => void) => 
  handleSSEStream(`${CONFIG.API_URL}/presentation/${presentationId}/slides/create`, onChunk);

export const generateOutlineStream = (outlineId: string, onChunk: (chunk: StreamChunk) => void) => 
  handleSSEStream(`${CONFIG.API_URL}/presentation/outline/${outlineId}/generate-stream`, onChunk);

// Share API functions
export const enableShare = (presentationId: string) => 
  api.post<ShareInfo>(`/presentation/${presentationId}/share/enable`);

export const disableShare = (presentationId: string) => 
  api.post<ShareInfo>(`/presentation/${presentationId}/share/disable`);

export const getShareInfo = (presentationId: string) => 
  api.get<ShareInfo>(`/presentation/${presentationId}/share`);

// Public share API functions (no auth required)
export const getSharedPresentation = (token: string) => 
  api.get<SharedPresentation>(`/presentation/public/share/${token}`);

export const getSharedPresentationSlides = (token: string) => 
  api.get<Slide[]>(`/presentation/public/share/${token}/slides`);

// Export API functions
export const exportPresentationToPptx = async (presentationId: string): Promise<Blob> => {
  // For blob responses, use request directly to get the blob
  const response = await request.get(`/presentation/${presentationId}/export/pptx`, {
    responseType: 'blob',
  });
  
  return response.data as Blob;
};

export const exportPresentationToPdf = async (presentationId: string): Promise<Blob> => {
  // For blob responses, use request directly to get the blob
  const response = await request.get(`/presentation/${presentationId}/export/pdf`, {
    responseType: 'blob',
  });
  
  return response.data as Blob;
};

export const exportPresentationToPng = async (presentationId: string): Promise<Blob> => {
  // For blob responses, use request directly to get the blob (ZIP file)
  const response = await request.get(`/presentation/${presentationId}/export/png`, {
    responseType: 'blob',
  });
  
  return response.data as Blob;
};

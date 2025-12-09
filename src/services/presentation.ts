import request from "@/lib/request";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

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

export interface CreateOutlineDto {
  prompt: string;
  numberOfSlides: number;
}

export interface UpdateOutlineDto {
  title?: string;
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

export const reorderSlides = async (
  presentationId: string,
  slideOrders: { slideId: string; order: number }[]
): Promise<ApiResponse<void>> => {
  const response = await request.post(
    `/presentation/${presentationId}/slides/reorder`,
    { slideOrders }
  );
  return response.data;
};

export const createPlanFromPrompt = async (
  payload: CreatePlanFromPromptDto
): Promise<ApiResponse<OutlineResponse>> => {
  const response = await request.post(
    `/presentation/create-plan-from-prompt`,
    payload
  );
  return response.data;
};

export const savePrompt = async (
  payload: CreateOutlineDto
): Promise<ApiResponse<SavePromptResponse>> => {
  const response = await request.post(`/presentation/save-prompt`, payload);
  return response.data;
};

export const getOutline = async (id: string): Promise<ApiResponse<Outline>> => {
  const response = await request.get(`/presentation/outline/${id}`);
  return response.data;
};

export const updateOutline = async (
  id: string,
  payload: UpdateOutlineDto
): Promise<ApiResponse<Outline>> => {
  const response = await request.patch(`/presentation/outline/${id}`, payload);
  return response.data;
};

export interface StreamChunk {
  type: "chunk" | "title" | "outline" | "complete" | "error";
  content?: string;
  data?: any;
  index?: number;
  message?: string;
}

export const generateOutlineStream = async (
  id: string,
  onChunk: (chunk: StreamChunk) => void
): Promise<void> => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
  const apiSecretKey = process.env.NEXT_PUBLIC_API_SECRET_KEY || "";

  // Get token from cookie (same way as request interceptor)
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
    Accept: "application/json",
    apisecretkeycheck: apiSecretKey,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${baseURL}/presentation/outline/${id}/generate`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data.trim()) {
            try {
              const chunk: StreamChunk = JSON.parse(data);
              onChunk(chunk);
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.startsWith("data: ")) {
      const data = buffer.slice(6);
      if (data.trim()) {
        try {
          const chunk: StreamChunk = JSON.parse(data);
          onChunk(chunk);
        } catch (e) {
          console.error("Error parsing chunk:", e);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

export interface SlideGenerationChunk {
  type: "start" | "slide-start" | "slide" | "slide-error" | "complete" | "error";
  slideNumber?: number;
  totalSlides?: number;
  slideId?: string;
  data?: any;
  message?: string;
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
  slides?: Slide[];
  createdAt: string;
  updatedAt: string;
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
export const getPresentationsList = async (filters?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ list: Presentation[]; meta: any }>> => {
  const response = await request.get("/presentation/list", { params: filters });
  return response.data;
};

export const getPresentation = async (
  id: string
): Promise<ApiResponse<Presentation>> => {
  const response = await request.get(`/presentation/${id}/get`);
  return response.data;
};

export const createPresentation = async (
  payload: CreatePresentationPayload
): Promise<ApiResponse<Presentation>> => {
  const response = await request.post("/presentation/create", payload);
  return response.data;
};

export const createPresentationFromPrompt = async (
  payload: CreatePlanFromPromptDto
): Promise<ApiResponse<Presentation>> => {
  const response = await request.post(
    "/presentation/create-from-prompt",
    payload
  );
  return response.data;
};

export const updatePresentation = async (
  id: string,
  payload: UpdatePresentationPayload
): Promise<ApiResponse<Presentation>> => {
  const response = await request.patch(`/presentation/${id}/update`, payload);
  return response.data;
};

export const updatePresentationTitle = async (
  id: string,
  title: string
): Promise<ApiResponse<Presentation>> => {
  const response = await request.patch(`/presentation/${id}/update-title`, {
    title,
  });
  return response.data;
};

export const deletePresentation = async (
  id: string
): Promise<ApiResponse<void>> => {
  const response = await request.delete(`/presentation/${id}/delete`);
  return response.data;
};

export const createSlide = async (
  presentationId: string,
  payload: CreateSlidePayload
): Promise<ApiResponse<Slide>> => {
  const response = await request.post(
    `/presentation/${presentationId}/slides/add`,
    payload
  );
  return response.data;
};

export const updateSlide = async (
  presentationId: string,
  slideId: string,
  payload: UpdateSlidePayload
): Promise<ApiResponse<Slide>> => {
  const response = await request.patch(
    `/presentation/${presentationId}/slides/${slideId}/update`,
    payload
  );
  return response.data;
};

export const deleteSlide = async (
  presentationId: string,
  slideId: string
): Promise<ApiResponse<void>> => {
  const response = await request.delete(
    `/presentation/${presentationId}/slides/${slideId}/delete`
  );
  return response.data;
};

export const generateSlidesFromOutline = async (
  outlineId: string,
  onChunk: (chunk: SlideGenerationChunk) => void
): Promise<void> => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
  const apiSecretKey = process.env.NEXT_PUBLIC_API_SECRET_KEY || "";

  // Get token from cookie (same way as request interceptor)
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
    Accept: "application/json",
    apisecretkeycheck: apiSecretKey,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${baseURL}/presentation/outline/${outlineId}/generate-slides`,
    {
      method: "POST",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data.trim()) {
            try {
              const chunk: SlideGenerationChunk = JSON.parse(data);
              onChunk(chunk);
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.startsWith("data: ")) {
      const data = buffer.slice(6);
      if (data.trim()) {
        try {
          const chunk: SlideGenerationChunk = JSON.parse(data);
          onChunk(chunk);
        } catch (e) {
          console.error("Error parsing chunk:", e);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

export const generateAndCreateSlides = async (
  presentationId: string,
  onChunk: (chunk: SlideGenerationChunk) => void
): Promise<void> => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
  const apiSecretKey = process.env.NEXT_PUBLIC_API_SECRET_KEY || "";

  // Get token from cookie (same way as request interceptor)
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
    Accept: "application/json",
    apisecretkeycheck: apiSecretKey,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${baseURL}/presentation/${presentationId}/slides/create`,
    {
      method: "POST",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data.trim()) {
            try {
              const chunk: SlideGenerationChunk = JSON.parse(data);
              onChunk(chunk);
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.startsWith("data: ")) {
      const data = buffer.slice(6);
      if (data.trim()) {
        try {
          const chunk: SlideGenerationChunk = JSON.parse(data);
          onChunk(chunk);
        } catch (e) {
          console.error("Error parsing chunk:", e);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

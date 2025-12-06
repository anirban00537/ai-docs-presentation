import request from "@/lib/request";
import type { GlobalTheme } from "@/store/slices/slidesSlice";
import type { SlideModel } from "@/store/slices/slidesSlice";

export interface CreatePresentationPayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  globalTheme?: GlobalTheme;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
}

export interface UpdatePresentationPayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  globalTheme?: GlobalTheme;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
}

export interface CreateSlidePayload {
  data?: Partial<SlideModel>;
  order?: number;
}

export interface UpdateSlidePayload {
  data?: Partial<SlideModel>;
  order?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PresentationSlide {
  id: string;
  presentationId: string;
  data: Partial<SlideModel>;
  order: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationData {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  globalTheme: GlobalTheme;
  isPublic: boolean;
  isTemplate: boolean;
  tags: string[];
  version: number;
  parentId?: string | null;
  forkedFrom?: string | null;
  sharedWith: string[];
  ownerId: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string | null;
  slides: PresentationSlide[];
}

export interface PresentationListItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  globalTheme: GlobalTheme;
  isPublic: boolean;
  isTemplate: boolean;
  tags: string[];
  version: number;
  parentId?: string | null;
  forkedFrom?: string | null;
  sharedWith: string[];
  ownerId: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string | null;
  slides: PresentationSlide[]; // First slide for preview
  _count: {
    slides: number;
  };
}

export interface PresentationsListResponse {
  list: PresentationListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateFromPromptPayload {
  prompt: string;
}

export const createPresentation = async (
  payload: CreatePresentationPayload
): Promise<ApiResponse<PresentationData>> => {
  const response = await request.post("/presentation/create", payload);
  return response.data;
};

export const createPresentationFromPrompt = async (
  payload: CreateFromPromptPayload
): Promise<ApiResponse<PresentationData>> => {
  const response = await request.post("/presentation/create-from-prompt", payload);
  return response.data;
};

export const getPresentationsList = async (query?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<PresentationsListResponse>> => {
  const response = await request.get("/presentation/list", { params: query });
  return response.data;
};

export const getPresentation = async (
  id: string
): Promise<ApiResponse<PresentationData>> => {
  const response = await request.get(`/presentation/${id}/get`);
  return response.data;
};

export const updatePresentation = async (
  id: string,
  payload: UpdatePresentationPayload
): Promise<ApiResponse<PresentationData>> => {
  const response = await request.patch(`/presentation/${id}/update`, payload);
  return response.data;
};

export const updatePresentationTitle = async (
  id: string,
  title: string
): Promise<ApiResponse<PresentationData>> => {
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
): Promise<ApiResponse<PresentationSlide>> => {
  const response = await request.post(
    `/presentation/${presentationId}/slides/create`,
    payload
  );
  return response.data;
};

export const updateSlide = async (
  presentationId: string,
  slideId: string,
  payload: UpdateSlidePayload
): Promise<ApiResponse<PresentationSlide>> => {
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

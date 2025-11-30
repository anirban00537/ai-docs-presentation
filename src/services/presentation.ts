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

export const createPresentation = async (
  payload: CreatePresentationPayload
): Promise<ApiResponse<PresentationData>> => {
  const response = await request.post("/presentation", payload);
  return response.data;
};

export const getPresentation = async (
  id: string
): Promise<ApiResponse<PresentationData>> => {
  const response = await request.get(`/presentation/${id}`);
  return response.data;
};

export const updatePresentation = async (
  id: string,
  payload: UpdatePresentationPayload
): Promise<ApiResponse<PresentationData>> => {
  const response = await request.patch(`/presentation/${id}`, payload);
  return response.data;
};

export const deletePresentation = async (
  id: string
): Promise<ApiResponse<void>> => {
  const response = await request.delete(`/presentation/${id}`);
  return response.data;
};

export const addSlide = async (
  presentationId: string,
  payload: CreateSlidePayload
): Promise<ApiResponse<PresentationSlide>> => {
  const response = await request.post(
    `/presentation/${presentationId}/slides`,
    payload
  );
  return response.data;
};

export const updateSlide = async (
  slideId: string,
  payload: UpdateSlidePayload
): Promise<ApiResponse<PresentationSlide>> => {
  const response = await request.patch(
    `/presentation/slides/${slideId}`,
    payload
  );
  return response.data;
};

export const deleteSlide = async (
  slideId: string
): Promise<ApiResponse<void>> => {
  const response = await request.delete(`/presentation/slides/${slideId}`);
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

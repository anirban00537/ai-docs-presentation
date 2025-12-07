import request from "@/lib/request";
import type { SlideModel } from "@/store/slices/slidesSlice";

export interface CreateLayoutPayload {
  name: string;
  description?: string;
  thumbnail?: string;
  data: any; // Layout/template data (JSON) - similar to Slide data
  type?: "admin" | "user";
  tags?: string[];
}

export interface UpdateLayoutPayload {
  name?: string;
  description?: string;
  thumbnail?: string;
  data?: any;
  type?: "admin" | "user";
  tags?: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface LayoutListItem {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  thumbnail?: string;
  data: any;
  type: "admin" | "user";
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutsListResponse {
  list: LayoutListItem[];
  meta?: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

// Create layout
export const createLayout = async (
  payload: CreateLayoutPayload
): Promise<ApiResponse<LayoutListItem>> => {
  const response = await request.post("/layouts/create", payload);
  return response.data;
};

// Get layouts list
export const getLayoutsList = async (): Promise<
  ApiResponse<LayoutsListResponse>
> => {
  const response = await request.get("/layouts/list");
  return response.data;
};

// Get admin layouts
export const getAdminLayouts = async (filters?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<LayoutsListResponse>> => {
  const response = await request.get("/layouts/admin/list", {
    params: filters,
  });
  return response.data;
};

// Get single layout
export const getLayout = async (
  id: string
): Promise<ApiResponse<LayoutListItem>> => {
  const response = await request.get(`/layouts/${id}/get`);
  return response.data;
};

// Update layout
export const updateLayout = async (
  id: string,
  payload: UpdateLayoutPayload
): Promise<ApiResponse<LayoutListItem>> => {
  const response = await request.patch(`/layouts/${id}/update`, payload);
  return response.data;
};

// Delete layout
export const deleteLayout = async (id: string): Promise<ApiResponse<null>> => {
  const response = await request.delete(`/layouts/${id}/delete`);
  return response.data;
};

import request from "@/lib/request";
import type { Theme } from "@/store/slices/slidesSlice";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ThemeResponse {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  themeData: Theme;
  isAdmin: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThemesListResponse {
  list: ThemeResponse[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

// Fetch all admin themes (public endpoint)
export const getAdminThemes = async (): Promise<ApiResponse<ThemesListResponse>> => {
  const response = await request.get("/themes/public/admin/list");
  return response.data;
};

// Fetch all themes (requires auth)
export const getThemes = async (filters?: {
  includeAdmin?: boolean;
  includeUser?: boolean;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<ThemesListResponse>> => {
  const response = await request.get("/themes/list", { params: filters });
  return response.data;
};

// Get a single theme
export const getTheme = async (id: string): Promise<ApiResponse<ThemeResponse>> => {
  const response = await request.get(`/themes/${id}/get`);
  return response.data;
};

// Create a theme (requires auth)
export const createTheme = async (payload: {
  name: string;
  description?: string;
  themeData: Theme;
  isAdmin?: boolean;
}): Promise<ApiResponse<ThemeResponse>> => {
  const response = await request.post("/themes/create", payload);
  return response.data;
};

// Update a theme (requires auth)
export const updateTheme = async (
  id: string,
  payload: {
    name?: string;
    description?: string;
    themeData?: Partial<Theme>;
  }
): Promise<ApiResponse<ThemeResponse>> => {
  const response = await request.patch(`/themes/${id}/update`, payload);
  return response.data;
};

// Delete a theme (requires auth)
export const deleteTheme = async (id: string): Promise<ApiResponse<void>> => {
  const response = await request.delete(`/themes/${id}/delete`);
  return response.data;
};


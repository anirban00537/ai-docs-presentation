import request from "@/lib/request";
import type { GlobalTheme } from "@/store/slices/slidesSlice";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ThemeData {
  background: string;
  surface: string;
  text: string;
  accent: string;
  font: string;
  cardBackgroundType: "solid" | "glass" | "transparent";
  tone: "dark" | "light";
}

export interface Theme {
  id: string;
  userId?: string | null;
  name: string;
  description?: string | null;
  themeData?: ThemeData; // New JSON structure
  // Backward compatibility fields (extracted from themeData by backend)
  background: string;
  surface: string;
  text: string;
  accent: string;
  font: string;
  cardBackgroundType: "solid" | "glass" | "transparent";
  tone: "dark" | "light";
  isAdmin: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThemePayload {
  name: string;
  description?: string;
  themeData: ThemeData;
  isAdmin?: boolean;
}

export interface UpdateThemePayload {
  name?: string;
  description?: string;
  themeData?: Partial<ThemeData>;
}

export interface ListThemesParams {
  page?: number;
  limit?: number;
  includeAdmin?: string; // "true" | "false"
  includeUser?: string; // "true" | "false"
}

export interface ThemesListResponse {
  list: Theme[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const createTheme = async (
  payload: CreateThemePayload
): Promise<ApiResponse<Theme>> => {
  const response = await request.post("/themes/create", payload);
  return response.data;
};

export const getThemesList = async (
  params?: ListThemesParams
): Promise<ApiResponse<ThemesListResponse>> => {
  const response = await request.get("/themes/list", { params });
  return response.data;
};

export const getAdminThemesList = async (
  params?: Omit<ListThemesParams, "includeAdmin" | "includeUser">
): Promise<ApiResponse<ThemesListResponse>> => {
  const response = await request.get("/themes/admin/list", { params });
  return response.data;
};

export const getTheme = async (
  id: string
): Promise<ApiResponse<Theme>> => {
  const response = await request.get(`/themes/${id}/get`);
  return response.data;
};

export const updateTheme = async (
  id: string,
  payload: UpdateThemePayload
): Promise<ApiResponse<Theme>> => {
  const response = await request.patch(`/themes/${id}/update`, payload);
  return response.data;
};

export const deleteTheme = async (
  id: string
): Promise<ApiResponse<void>> => {
  const response = await request.delete(`/themes/${id}/delete`);
  return response.data;
};


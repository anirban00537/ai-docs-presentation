import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import type { Theme } from "@/store/slices/cardsSlice";

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
export const getAdminThemes = () => api.get<ThemesListResponse>("/themes/public/admin/list");

// Fetch all themes (requires auth)
export const getThemes = (filters?: {
  includeAdmin?: boolean;
  includeUser?: boolean;
  page?: number;
  limit?: number;
}) => api.get<ThemesListResponse>("/themes/list", { params: filters });

// Get a single theme
export const getTheme = (id: string) => api.get<ThemeResponse>(`/themes/${id}/get`);

// Create a theme (requires auth)
export const createTheme = (payload: {
  name: string;
  description?: string;
  themeData: Theme;
  isAdmin?: boolean;
}) => api.post<ThemeResponse>("/themes/create", payload);

// Update a theme (requires auth)
export const updateTheme = (
  id: string,
  payload: {
    name?: string;
    description?: string;
    themeData?: Partial<Theme>;
  }
) => api.patch<ThemeResponse>(`/themes/${id}/update`, payload);

// Delete a theme (requires auth)
export const deleteTheme = (id: string) => api.delete<void>(`/themes/${id}/delete`);

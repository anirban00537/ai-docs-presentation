import { api } from "@/lib/api";
import type { Row, SlideAccent } from "@/types/presentation";

export interface LayoutData {
  rows: Row[];
  accent?: SlideAccent;
  icon?: string;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  icon?: string | any;
  data: LayoutData;
  type: 'admin' | 'user';
  tags: string[];
  isAdmin?: boolean;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateLayoutDto = {
  name: string;
  description?: string;
  thumbnail?: string;
  data: any;
  tags?: string[];
  type?: string;
};

export interface CreateLayoutPayload {
  name: string;
  description?: string;
  thumbnail?: string;
  data: any;
  tags?: string[];
  type?: string;
}

export interface UpdateLayoutPayload extends CreateLayoutPayload {
  id: string;
}

export const layoutsService = {
  getAdminLayouts: () => api.get<LayoutTemplate[]>("/layouts/admin-list"),
  getLayout: (id: string) => api.get<LayoutTemplate>(`/layouts/${id}/get`),
  getUserLayouts: () => api.get<LayoutTemplate[]>("/layouts/list"),
  createLayout: (data: CreateLayoutDto) => api.post<LayoutTemplate>("/layouts/create", data),
  updateLayout: (id: string, data: Partial<CreateLayoutDto>) => api.post<LayoutTemplate>(`/layouts/${id}/update`, data),
  deleteLayout: (id: string) => api.delete<void>(`/layouts/${id}/delete`),
};

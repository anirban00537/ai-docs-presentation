import request from "@/lib/request";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

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

export const getLayoutsList = async (): Promise<ApiResponse<any[]>> => {
  const response = await request.get("/layouts/list");
  return response.data;
};

export const getAdminLayouts = async (filters?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<any[]>> => {
  const response = await request.get("/layouts/list", { params: filters });
  return response.data;
};

export const getLayout = async (id: string): Promise<ApiResponse<any>> => {
  const response = await request.get(`/layouts/${id}`);
  return response.data;
};

export const createLayout = async (
  payload: CreateLayoutPayload
): Promise<ApiResponse<any>> => {
  const response = await request.post("/layouts/create", payload);
  return response.data;
};

export const updateLayout = async (
  id: string,
  payload: UpdateLayoutPayload
): Promise<ApiResponse<any>> => {
  const response = await request.patch(`/layouts/${id}`, payload);
  return response.data;
};

export const deleteLayout = async (id: string): Promise<ApiResponse<void>> => {
  const response = await request.delete(`/layouts/${id}/delete`);
  return response.data;
};

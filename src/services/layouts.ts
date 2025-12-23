import request from "@/lib/request";

export interface LayoutTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  data: any;
  type: string;
  tags: string[];
  isAdmin: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export const layoutsService = {
  getAdminLayouts: async () => {
    const response = await request.get("/layouts/admin-list");
    return response.data;
  },

  getLayout: async (id: string) => {
    const response = await request.get(`/layouts/${id}/get`);
    return response.data;
  },

  getUserLayouts: async () => {
    const response = await request.get("/layouts/list");
    return response.data;
  },

  createLayout: async (data: {
    name: string;
    description?: string;
    thumbnail?: string;
    data: any;
    tags?: string[];
  }) => {
    const response = await request.post("/layouts/create", data);
    return response.data;
  },

  deleteLayout: async (id: string) => {
    const response = await request.delete(`/layouts/${id}/delete`);
    return response.data;
  },
};

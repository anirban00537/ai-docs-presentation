export interface CreateLayoutPayload {
  title: string;
  description?: string;
  slides: any[];
}

export interface UpdateLayoutPayload {
  title?: string;
  description?: string;
  slides?: any[];
}

export const getLayoutsList = async () => {
  return { success: true, data: [] };
};

export const getAdminLayouts = async (filters?: any) => {
  return { success: true, data: [] };
};

export const getLayout = async (id: string) => {
  return { success: true, data: null };
};

export const createLayout = async (payload: CreateLayoutPayload) => {
  return { success: true, data: null };
};

export const updateLayout = async (id: string, payload: UpdateLayoutPayload) => {
  return { success: true, data: null };
};

export const deleteLayout = async (id: string) => {
  return { success: true, data: null };
};

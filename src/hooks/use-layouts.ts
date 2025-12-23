import { useQuery } from "@tanstack/react-query";
import { layoutsService } from "@/services/layouts";

export const useAdminLayouts = () => {
  return useQuery({
    queryKey: ["admin-layouts"],
    queryFn: async () => {
      const response = await layoutsService.getAdminLayouts();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch admin layouts");
    },
  });
};

export const useUserLayouts = () => {
  return useQuery({
    queryKey: ["user-layouts"],
    queryFn: async () => {
      const response = await layoutsService.getUserLayouts();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch user layouts");
    },
  });
};

export const useLayout = (id: string | null) => {
  return useQuery({
    queryKey: ["layout", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await layoutsService.getLayout(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch layout");
    },
    enabled: !!id,
  });
};

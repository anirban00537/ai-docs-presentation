import request from "@/lib/request";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

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

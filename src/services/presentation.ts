import request from "@/lib/request";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface OutlineItem {
  content: string;
}

export interface OutlineResponse {
  title: string;
  outlines: OutlineItem[];
}

export interface CreatePlanFromPromptDto {
  prompt: string;
  numberOfSlides: number;
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

export const createPlanFromPrompt = async (
  payload: CreatePlanFromPromptDto
): Promise<ApiResponse<OutlineResponse>> => {
  const response = await request.post(
    `/presentation/create-plan-from-prompt`,
    payload
  );
  return response.data;
};

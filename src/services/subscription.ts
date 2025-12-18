import request from "@/lib/request";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface Subscription {
  id: string;
  userId: string;
  polarSubscriptionId?: string;
  polarCustomerId?: string;
  status: "active" | "inactive" | "canceled" | "past_due" | "trialing";
  productId?: string;
  priceId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreditBalance {
  id: string;
  userId: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  monthlyLimit: number;
  monthlyUsed: number;
  freeCredits: number;
  freeCreditsUsed: number;
  lastResetAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatus {
  subscription: Subscription | null;
  creditBalance: CreditBalance | null;
  isActive: boolean;
  hasCredits: boolean;
}

export interface UseCreditsDto {
  amount: number;
  description?: string;
  presentationId?: string;
}

// Get subscription status
export const getSubscriptionStatus = async (): Promise<
  ApiResponse<SubscriptionStatus>
> => {
  const response = await request.get("/subscription/status");
  return response.data;
};

// Sync subscription from Polar.sh
export const syncSubscription = async (): Promise<
  ApiResponse<Subscription>
> => {
  const response = await request.get("/subscription/sync");
  return response.data;
};

// Cancel subscription
export const cancelSubscription = async (): Promise<
  ApiResponse<Subscription>
> => {
  const response = await request.post("/subscription/cancel");
  return response.data;
};

// Get credit balance
export const getCreditBalance = async (): Promise<
  ApiResponse<CreditBalance>
> => {
  const response = await request.get("/subscription/credits");
  return response.data;
};

// Use credits
export const useCredits = async (
  payload: UseCreditsDto
): Promise<ApiResponse<CreditBalance>> => {
  const response = await request.post("/subscription/credits/use", payload);
  return response.data;
};


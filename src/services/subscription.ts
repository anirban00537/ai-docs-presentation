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
  balance: number;
  quota: number;
  usedCredits: number;
  lastResetAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatus {
  subscription: Subscription | null;
  creditBalance: CreditBalance | null;
  isActive: boolean;
  hasAccess: boolean;
  hasCredits: boolean;
  features?: {
    productId: string;
    productName: string;
    productDescription: string | null;
    benefits: Array<{
      id: string;
      type: string;
      description: string;
      selectable: boolean;
      metadata: Record<string, any>;
      properties: Record<string, any>;
    }>;
    metadata: {
      plan_name?: string;
      ai_credits?: string;
      feature_1?: string;
      feature_2?: string;
      feature_3?: string;
      feature_4?: string;
      feature_5?: string;
      feature_6?: string;
      feature_7?: string;
      feature_8?: string;
      feature_9?: string;
      feature_10?: string;
      [key: string]: any;
    };
    features: string[];
  };
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

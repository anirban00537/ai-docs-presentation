import { api } from "@/lib/api";

export interface SubscriptionStatus {
  isActive: boolean;
  hasAccess: boolean; // For legacy or feature-based access
  status: string;
  planId: string;
  subscription?: {
    id: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: number;
    productId?: string;
  };
  features: {
    maxSlides: number;
    hasWatermark: boolean;
    isPremium: boolean;
    productName?: string;
  };
  creditBalance?: CreditBalance;
}

export interface Subscription {
  id: string;
  userId: string;
  status: string;
  priceId?: string;
  productId?: string;
  currentPeriodStart?: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreditBalance {
  balance: number;
  quota: number;
  usedCredits: number;
  lastResetAt: string;
}

export interface UseCreditsDto {
  amount: number;
  reason?: string;
}

export const getSubscriptionStatus = () => api.get<SubscriptionStatus>("/subscription/status");
export const getCreditBalance = () => api.get<CreditBalance>("/subscription/credits");
export const useCredits = (payload: UseCreditsDto) => api.post<CreditBalance>("/subscription/use-credits", payload);
export const syncSubscription = () => api.get<SubscriptionStatus>("/subscription/sync");
export const cancelSubscription = () => api.post<void>("/subscription/cancel");

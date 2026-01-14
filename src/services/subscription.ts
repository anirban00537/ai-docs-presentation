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
    maxCards: number;
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

export interface UserSettings {
  slideLimit: number;
  storageLimit: number;
  storageUsage: number;
  planName: string;
  hasActiveSubscription: boolean;
}

export const getSubscriptionStatus = () => api.get<SubscriptionStatus>("/subscription/status");
export const getCreditBalance = () => api.get<CreditBalance>("/subscription/credits");
export const getUserSettings = () => api.get<UserSettings>("/subscription/settings");
export const useCredits = (payload: UseCreditsDto) => api.post<CreditBalance>("/subscription/use-credits", payload);
export const cancelSubscription = () => api.post<void>("/subscription/cancel");
export const verifyCheckout = (customerSessionToken?: string) => 
  api.post<SubscriptionStatus>("/subscription/verify-checkout", { customerSessionToken });


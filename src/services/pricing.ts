import request from "@/lib/request";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface Price {
  id: string;
  productId?: string;
  amountType?: string; // fixed, custom, free, seat_based, metered_unit
  priceAmount?: number; // in cents
  priceCurrency?: string;
  metadata?: Record<string, any>;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  isArchived?: boolean;
  recurringInterval?: string; // day, week, month, year
  recurringIntervalCount?: number;
  prices?: Price[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  monthlyCreditLimit?: number;
}

// Get all products/pricing plans
export const getProducts = async (): Promise<ApiResponse<Product[]>> => {
  const response = await request.get("/subscription/products");
  return response.data;
};

// Get product by ID
export const getProduct = async (id: string): Promise<ApiResponse<Product>> => {
  const response = await request.get(`/subscription/products/${id}`);
  return response.data;
};

// Format price for display
export const formatPrice = (price: Price): string => {
  if (price.amountType === "free") {
    return "Free";
  }
  
  if (price.amountType === "custom") {
    return "Pay what you want";
  }

  if (price.priceAmount) {
    const amount = price.priceAmount / 100; // Convert cents to dollars
    const currency = price.priceCurrency?.toUpperCase() || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  return "Custom";
};

// Get recurring interval display text
export const getRecurringText = (product: Product): string => {
  if (!product.recurringInterval) {
    return "One-time";
  }

  const interval = product.recurringInterval;
  const count = product.recurringIntervalCount || 1;

  if (count === 1) {
    return `per ${interval}`;
  }

  return `every ${count} ${interval}s`;
};

// Create checkout session for a product
export const createCheckout = async (
  productId: string,
  successUrl?: string
): Promise<ApiResponse<{ checkoutUrl: string; checkoutId: string }>> => {
  const response = await request.post("/subscription/checkout", {
    productId,
    successUrl,
  });
  return response.data;
};


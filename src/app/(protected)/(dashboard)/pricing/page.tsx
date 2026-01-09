"use client";

import React, { useState, useEffect } from "react";
import { useProducts } from "@/hooks/use-pricing";
import { useAppSelector } from "@/store/hooks";
import { selectSubscriptionStatus } from "@/store/slices/subscriptionSlice";
import { createCheckout } from "@/services/pricing";
import { PricingCard } from "@/components/pricing-card";
import { PageSkeleton } from "@/components/shared/DashboardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Sub-components
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { PricingFooter } from "@/components/pricing/PricingFooter";

export default function PricingPage() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const subscriptionStatus = useAppSelector(selectSubscriptionStatus);
  const currentSubscription = subscriptionStatus?.subscription;
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  // Debug logs
  useEffect(() => {
    if (subscriptionStatus) {
      console.log("[PricingPage] Subscription Status:", {
        isActive: subscriptionStatus.isActive,
        hasAccess: subscriptionStatus.hasAccess,
        productId: currentSubscription?.productId,
        status: currentSubscription?.status,
        periodEnd: currentSubscription?.currentPeriodEnd,
      });
    }
  }, [subscriptionStatus, currentSubscription]);

  const handleSelectPlan = async (productId: string, priceId?: string) => {
    if (!priceId) {
      toast.error("No price available for this product");
      return;
    }

    try {
      setLoadingCheckout(productId);
      toast.info("Creating checkout session...");
      const successUrl = `${window.location.origin}/subscription?checkout=success`;
      const response = await createCheckout(productId, successUrl);

      if (response.success && response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        const errorMessage = response.message || "Failed to create checkout session";
        if (errorMessage.toLowerCase().includes("already have an active subscription")) {
          toast.error(errorMessage, {
            action: { label: "Manage Subscription", onClick: () => (window.location.href = "/subscription") },
          });
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create checkout session";
      toast.error(errorMessage);
    } finally {
      setLoadingCheckout(null);
    }
  };

  if (productsLoading) {
    return (
      <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] px-4 py-16 w-full">
        <div className="relative z-10 w-full max-w-7xl">
          <PageSkeleton>
            <Skeleton className="h-12 w-1/3 mx-auto rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-10">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[500px] w-full rounded-3xl" />
              ))}
            </div>
          </PageSkeleton>
        </div>
      </div>
    );
  }

  const hasAccess = subscriptionStatus?.hasAccess || false;
  const isSubscriptionActive = subscriptionStatus?.isActive || false;
  const isCanceled = currentSubscription?.status === "canceled" || currentSubscription?.cancelAtPeriodEnd || false;

  const availableProducts = products?.filter((p) => !p.isArchived) || [];
  const sortedProducts = [...availableProducts].sort((a, b) => {
    const priceA = a.prices?.[0]?.priceAmount || 0;
    const priceB = b.prices?.[0]?.priceAmount || 0;
    return priceA - priceB;
  });

  return (
    <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] overflow-y-auto px-4 py-16">
      <div className="relative z-10 w-full max-w-7xl flex flex-col gap-16">
        <PricingHeader />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-8">
          {sortedProducts.map((product, index) => {
            const isCurrentPlan = hasAccess && currentSubscription?.productId === product.id;
            const isPopular = index === 1;
            const hasBlockingSubscription = isSubscriptionActive && !isCanceled;

            return (
              <PricingCard
                key={product.id}
                product={product}
                isPopular={isPopular}
                isCurrentPlan={isCurrentPlan}
                isCanceled={isCanceled}
                index={index}
                onSelect={
                  hasBlockingSubscription && (!isCurrentPlan || !isCanceled)
                    ? undefined
                    : handleSelectPlan
                }
                loading={loadingCheckout === product.id}
                href={hasBlockingSubscription && !isCurrentPlan ? "/subscription" : undefined}
                cta={isCurrentPlan ? (isCanceled ? "Renew Plan" : "Current Plan") : (hasBlockingSubscription ? "View Subscription" : undefined)}
              />
            );
          })}
        </div>

        <PricingFooter />
      </div>
    </div>
  );
}

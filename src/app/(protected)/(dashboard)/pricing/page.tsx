"use client";

import React from "react";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/use-pricing";
import { useAppSelector } from "@/store/hooks";
import { selectSubscriptionStatus } from "@/store/slices/subscriptionSlice";
import { createCheckout } from "@/services/pricing";
import { PricingCard } from "@/components/pricing-card";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const subscriptionStatus = useAppSelector(selectSubscriptionStatus);
  const currentSubscription = subscriptionStatus?.subscription;
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  // Debug logs
  React.useEffect(() => {
    if (subscriptionStatus) {
      console.log("[PricingPage] Subscription Status:", {
        isActive: subscriptionStatus.isActive,
        hasAccess: subscriptionStatus.hasAccess,
        productId: currentSubscription?.productId,
        status: currentSubscription?.status,
        periodEnd: currentSubscription?.currentPeriodEnd
      });
    }
    if (products?.length) {
      console.log("[PricingPage] Available Products:", products.map(p => ({ id: p.id, name: p.name })));
    }
  }, [subscriptionStatus, products]);

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
        // Handle specific error cases
        const errorMessage = response.message || "Failed to create checkout session";
        
        // Check if it's a duplicate subscription error
        if (errorMessage.toLowerCase().includes("already have an active subscription")) {
          toast.error(errorMessage, {
            action: {
              label: "Manage Subscription",
              onClick: () => window.location.href = "/subscription",
            },
          });
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      const errorMessage = 
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create checkout session";
      
      // Check if it's a duplicate subscription error from catch block
      if (errorMessage.toLowerCase().includes("already have an active subscription")) {
        toast.error(errorMessage, {
          action: {
            label: "Manage Subscription",
            onClick: () => window.location.href = "/subscription",
          },
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingCheckout(null);
    }
  };

  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl h-full flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[500px] rounded-3xl animate-pulse border-0 shadow-xl"
              style={{
                backgroundColor: "color-mix(in srgb, var(--secondary) 15%, var(--card))",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const hasAccess = subscriptionStatus?.hasAccess || false;
  const isSubscriptionActive = subscriptionStatus?.isActive || false;
  const isCanceled = currentSubscription?.status === 'canceled' || currentSubscription?.cancelAtPeriodEnd || false;

  const availableProducts = products?.filter((p) => !p.isArchived) || [];
  const sortedProducts = [...availableProducts].sort((a, b) => {
    const priceA = a.prices?.[0]?.priceAmount || 0;
    const priceB = b.prices?.[0]?.priceAmount || 0;
    return priceA - priceB;
  });

  return (
    <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] overflow-y-auto px-4 py-16">
      <div className="relative z-10 w-full max-w-7xl flex flex-col gap-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
            Simple,{" "}
            <span className="text-primary/80 font-normal italic">
              transparent
            </span>{" "}
            pricing
          </h1>
          <p className="text-base md:text-lg text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
            Choose the perfect plan to supercharge your presentation workflow
            with AI. No hidden fees, just pure creativity.
          </p>
        </motion.div>

        {/* Current Subscription Status */}
        {currentSubscription && hasAccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div
              className="px-5 py-2 rounded-2xl flex items-center gap-2.5 border border-secondary/30 text-xs font-semibold text-secondary-foreground"
              style={{
                backgroundColor: "color-mix(in srgb, var(--secondary) 80%, transparent)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isCanceled ? "bg-orange-500" : "bg-secondary-foreground/60")} />
              {isCanceled ? "Expiring Plan: " : "Active Plan: "} {currentSubscription.productId || "Pro"}
              {isCanceled && currentSubscription.currentPeriodEnd && (
                <span className="opacity-70 ml-1">
                  (Ends {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()})
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-8">
          {sortedProducts.map((product, index) => {
            const isCurrentPlan =
              hasAccess &&
              currentSubscription?.productId === product.id;
            // Mark Plus (middle plan) or Pro as popular
            const isPopular = index === 1;
            
            // Only block checkout if they have an active, non-canceled subscription
            // If it's canceled, we allow them to subscribe to a new plan (or the same one)
            const hasBlockingSubscription = isSubscriptionActive && !isCanceled;

            return (
              <PricingCard
                key={product.id}
                product={{
                  ...product,
                  maxSlides:
                    product.metadata?.max_slides || product.metadata?.maxSlides,
                }}
                isPopular={isPopular}
                isCurrentPlan={isCurrentPlan}
                isCanceled={isCanceled}
                index={index}
                // Only allow checkout if user has NO blocking subscription
                // Or if it IS the current plan but it's canceled (Renew)
                onSelect={hasBlockingSubscription && (!isCurrentPlan || !isCanceled) ? undefined : handleSelectPlan}
                loading={loadingCheckout === product.id}
                // For users with blocking subscription but on different plan, show "View Subscription"
                href={hasBlockingSubscription && !isCurrentPlan ? "/subscription" : undefined}
                cta={isCurrentPlan ? (isCanceled ? "Renew Plan" : "Current Plan") : (hasBlockingSubscription ? "View Subscription" : undefined)}
              />
            );
          })}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-4 pt-4"
        >
          <p className="text-sm text-muted-foreground font-medium">
            Join thousands of creators building amazing presentations with
            Butterfast.
          </p>
          <div className="flex items-center justify-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
              Secured with Polar.sh
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
              No Hidden Fees
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

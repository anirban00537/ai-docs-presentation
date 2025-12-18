"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  IconSparkles,
  IconCheck,
  IconArrowRight,
  IconLoader,
  IconRocket,
  IconLoader2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useSubscriptionStatus } from "@/hooks/use-subscription";
import { useProducts } from "@/hooks/use-pricing";
import { formatPrice, getRecurringText, createCheckout } from "@/services/pricing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";

export default function PricingPage() {
  const router = useRouter();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const currentSubscription = subscriptionStatus?.subscription;
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

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
        toast.error(response.message || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create checkout session"
      );
    } finally {
      setLoadingCheckout(null);
    }
  };

  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl h-full flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[500px] rounded-3xl bg-white/20 animate-pulse border border-white/40 shadow-xl" />
          ))}
        </div>
      </div>
    );
  }

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
            Pricing Plans
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
            Simple, <span className="text-primary/80 font-normal italic">transparent</span> pricing
          </h1>
          <p className="text-base md:text-lg text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
            Choose the perfect plan to supercharge your presentation workflow with AI. No hidden fees, just pure creativity.
          </p>
        </motion.div>

        {/* Current Subscription Status */}
        {currentSubscription && currentSubscription.status === "active" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div 
              className="px-5 py-2 rounded-2xl flex items-center gap-2.5 border border-green-500/20 text-xs font-semibold text-green-600/90"
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.05)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Active Plan: {currentSubscription.productId || "Pro"}
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-8">
          {sortedProducts.map((product, index) => {
            const primaryPrice = product.prices?.[0];
            const isCurrentPlan = currentSubscription?.productId === product.id && currentSubscription?.status === "active";
            const isPopular = index === 1 || product.name.toLowerCase().includes('pro');

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                className="relative h-full"
              >
                {isPopular && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center z-20">
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-primary/25">
                      Most Popular
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    "relative h-full flex flex-col p-8 rounded-[38px] transition-all duration-500 group",
                    isPopular ? "scale-[1.02] ring-1 ring-primary/10 shadow-xl shadow-primary/5" : "border border-white/40"
                  )}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                    backdropFilter: "blur(28px) saturate(190%)",
                    WebkitBackdropFilter: "blur(28px) saturate(190%)",
                    boxShadow: "0 10px 40px -15px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.8) inset",
                  }}
                >
                  {/* Glass shine overlay */}
                  <div 
                    className="absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-[38px]"
                    style={{
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 50%)",
                    }}
                  />

                  {/* Header/Icon */}
                  <div className="relative z-10 mb-10">
                    <div 
                      className="w-11 h-11 rounded-1.5xl flex items-center justify-center mb-6"
                      style={{
                        backgroundColor: isPopular ? "rgba(139, 92, 246, 0.08)" : "rgba(100, 116, 139, 0.05)",
                      }}
                    >
                      {isPopular ? (
                        <IconSparkles size={20} className="text-primary/70" />
                      ) : (
                        <IconRocket size={20} className="text-slate-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground tracking-tight">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground/70 mt-2 leading-relaxed font-medium">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="relative z-10 mb-10">
                    {primaryPrice ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-semibold text-foreground tracking-tight">
                          {formatPrice(primaryPrice)}
                        </span>
                        {product.recurringInterval && (
                          <span className="text-muted-foreground/60 text-sm font-medium">
                            /{product.recurringInterval}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xl font-semibold">Custom</span>
                    )}
                  </div>

                  {/* Credit Feature Box */}
                  {product.monthlyCreditLimit !== undefined && (
                    <div 
                      className="relative z-10 mb-10 p-4 rounded-2.5xl"
                      style={{
                        backgroundColor: "rgba(139, 92, 246, 0.04)",
                        border: "1px solid rgba(139, 92, 246, 0.08)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <IconSparkles size={16} className="text-primary/50" />
                        <div>
                          <p className="text-sm font-semibold text-primary/80">
                            {product.monthlyCreditLimit === 0 ? "Unlimited" : product.monthlyCreditLimit.toLocaleString()} credits
                          </p>
                          <p className="text-[9px] text-primary/40 uppercase tracking-widest font-bold">Monthly Quota</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Features List */}
                  <div className="relative z-10 flex-1 mb-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-5">Features</p>
                    {product.metadata?.features && (
                      <ul className="space-y-4">
                        {(product.metadata.features as string[]).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="mt-1 w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                              <IconCheck size={10} className="text-green-600/70" />
                            </div>
                            <span className="text-sm text-foreground/70 font-medium leading-normal">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="relative z-10 mt-auto">
                    <Button
                      onClick={() => isCurrentPlan ? router.push("/subscription") : handleSelectPlan(product.id, primaryPrice?.id)}
                      disabled={(!primaryPrice && !isCurrentPlan) || loadingCheckout === product.id}
                      className={cn(
                        "w-full h-13 rounded-2xl text-sm font-semibold transition-all duration-300 transform active:scale-[0.97]",
                        isCurrentPlan 
                          ? "bg-white/50 hover:bg-white/80 text-slate-600 border border-white/60 shadow-none"
                          : isPopular 
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10"
                      )}
                    >
                      {loadingCheckout === product.id ? (
                        <IconLoader2 size={18} className="animate-spin" />
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        primaryPrice ? "Choose " + product.name : "Contact for Quote"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
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
            Join thousands of creators building amazing presentations with Butterfast.
          </p>
          <div className="flex items-center justify-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Secured with Polar.sh</span>
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">No Hidden Fees</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


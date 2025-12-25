"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/use-pricing";
import { createCheckout } from "@/services/pricing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { IconSparkles } from "@tabler/icons-react";
import { PricingCard } from "@/components/pricing-card";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/slices/userSlice";
import { toast } from "sonner";

export function PricingSection() {
  const { data: products, isLoading } = useProducts();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  // Only show real products from API, no dummy data
  const displayPlans = products || [];

  // Handle checkout for authenticated users
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

  return (
    <section className="py-32 bg-gradient-to-b from-primary/5 via-white to-secondary/10 relative overflow-hidden" id="pricing">
        {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-secondary/20 shadow-sm mb-6"
          >
              <span className="w-2 h-2 rounded-full bg-primary/70"></span>
              <span className="text-xs font-bold tracking-widest uppercase text-foreground/70">
                  Simple Investment
              </span>
          </motion.div>
          <h2 className="font-serif text-5xl md:text-7xl text-foreground mb-6 tracking-tight leading-[1]">
             Invest in your <span className="italic text-primary">impact.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Simple, transparent pricing that grows with you. No hidden fees, ever.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/50 rounded-3xl p-8 h-[450px] animate-pulse border border-secondary/10">
                <div className="h-6 w-24 bg-secondary/20 rounded mb-4" />
                <div className="h-4 w-48 bg-secondary/10 rounded mb-8" />
                <div className="h-12 w-32 bg-secondary/20 rounded mb-8" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-secondary/10 rounded" />
                  <div className="h-4 w-3/4 bg-secondary/10 rounded" />
                  <div className="h-4 w-5/6 bg-secondary/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && displayPlans.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {displayPlans.slice(0, 3).map((plan: any, i) => {
               const isPlus = plan.name?.toLowerCase().includes("plus");
               
              return (
                <PricingCard
                  key={plan.id || i}
                  product={plan}
                  index={i}
                  isPopular={isPlus}
                  // For authenticated users: use onSelect to trigger checkout
                  // For unauthenticated users: use href to redirect to signup
                  onSelect={isAuthenticated ? handleSelectPlan : undefined}
                  href={isAuthenticated ? undefined : "/signup"}
                  loading={loadingCheckout === plan.id}
                  cta={isPlus ? "Get Started Now" : "Start for Free"}
                />
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayPlans.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Pricing plans are being loaded. Please check back soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

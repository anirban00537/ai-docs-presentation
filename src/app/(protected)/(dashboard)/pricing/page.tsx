"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  IconSparkles,
  IconCheck,
  IconArrowRight,
  IconLoader,
} from "@tabler/icons-react";
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

      // Get success URL - redirect to subscription page after successful checkout
      const successUrl = `${window.location.origin}/subscription?checkout=success`;

      const response = await createCheckout(productId, successUrl);

      if (response.success && response.data?.checkoutUrl) {
        // Redirect to Polar.sh checkout
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const availableProducts = products?.filter((p) => !p.isArchived) || [];

  // Sort products by price (lowest first)
  const sortedProducts = [...availableProducts].sort((a, b) => {
    const priceA = a.prices?.[0]?.priceAmount || 0;
    const priceB = b.prices?.[0]?.priceAmount || 0;
    return priceA - priceB;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include our core
            features with transparent pricing.
          </p>
        </motion.div>

        {/* Current Subscription Badge */}
        {currentSubscription && currentSubscription.status === "active" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Badge className="bg-green-500 px-4 py-2">
              You are currently on: {currentSubscription.productId || "Active Plan"}
            </Badge>
          </motion.div>
        )}

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product, index) => {
              const primaryPrice = product.prices?.[0];
              const isCurrentPlan =
                currentSubscription?.productId === product.id &&
                currentSubscription?.status === "active";
              const isPopular = index === Math.floor(sortedProducts.length / 2);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`relative p-6 h-full flex flex-col ${
                      isPopular
                        ? "border-primary/50 shadow-lg scale-105"
                        : "hover:shadow-lg transition-shadow"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-white px-4 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="outline" className="bg-green-50">
                          Current Plan
                        </Badge>
                      </div>
                    )}

                    {/* Product Header */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="mb-6">
                      {primaryPrice ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-foreground">
                            {formatPrice(primaryPrice)}
                          </span>
                          {product.recurringInterval && (
                            <span className="text-muted-foreground">
                              {getRecurringText(product)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-foreground">
                          Custom Pricing
                        </div>
                      )}
                    </div>

                    {/* Credit Limit */}
                    {product.monthlyCreditLimit !== undefined && (
                      <div className="mb-6 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2">
                          <IconSparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            {product.monthlyCreditLimit === 0
                              ? "Unlimited"
                              : `${product.monthlyCreditLimit.toLocaleString()} credits/month`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Features from metadata */}
                    {product.metadata?.features && (
                      <ul className="flex-1 space-y-3 mb-6">
                        {(product.metadata.features as string[]).map(
                          (feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <IconCheck className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm text-foreground">
                                {feature}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    )}

                    {/* CTA Button */}
                    <div className="mt-auto">
                      {isCurrentPlan ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => router.push("/subscription")}
                        >
                          Manage Subscription
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() =>
                            handleSelectPlan(product.id, primaryPrice?.id)
                          }
                          disabled={!primaryPrice || loadingCheckout === product.id}
                        >
                          {loadingCheckout === product.id ? (
                            <>
                              <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : primaryPrice ? (
                            <>
                              Subscribe Now
                              <IconArrowRight className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            "Contact Sales"
                          )}
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No pricing plans available at the moment.
            </p>
          </div>
        )}

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-8"
        >
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
            Cancel anytime.
          </p>
        </motion.div>
      </div>
    </div>
  );
}


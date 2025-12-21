"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconSparkles, IconCheck, IconRocket } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { formatPrice, type Product, type Price } from "@/services/pricing";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  product: {
    id?: string;
    name: string;
    description?: string | null;
    prices?: Price[];
    recurringInterval?: string;
    monthlyCreditLimit?: number;
    maxSlides?: string | number;
    features?: string[];
    benefits?: Array<{ description?: string }>;
    metadata?: Record<string, any>;
  };
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  index?: number;
  onSelect?: (productId: string, priceId?: string) => void;
  href?: string;
  cta?: string;
  loading?: boolean;
  className?: string;
}

export function PricingCard({
  product,
  isPopular = false,
  isCurrentPlan = false,
  index = 0,
  onSelect,
  href,
  cta,
  loading = false,
  className,
}: PricingCardProps) {
  const primaryPrice = product.prices?.[0];
  const maxSlides =
    product.maxSlides ||
    product.metadata?.max_slides ||
    product.metadata?.maxSlides;

  // Get features from product.features or extract from benefits
  const features =
    product.features ||
    (product.benefits
      ?.map((b) => b.description)
      .filter(Boolean) as string[]) ||
    [];

  const handleClick = () => {
    if (isCurrentPlan) {
      window.location.href = "/subscription";
      return;
    }
    if (onSelect && product.id) {
      onSelect(product.id, primaryPrice?.id);
    }
  };

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut",
      }}
      className={cn("relative h-full", className)}
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
          isPopular
            ? "scale-[1.02] ring-1 ring-primary/10 shadow-xl shadow-primary/5"
            : "border border-white/40"
        )}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(28px) saturate(190%)",
          WebkitBackdropFilter: "blur(28px) saturate(190%)",
          boxShadow:
            "0 10px 40px -15px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.8) inset",
        }}
      >
        {/* Glass shine overlay */}
        <div
          className="absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-[38px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 50%)",
          }}
        />

        {/* Header/Icon */}
        <div className="relative z-10 mb-10">
          <div
            className="w-11 h-11 rounded-1.5xl flex items-center justify-center mb-6"
            style={{
              backgroundColor: isPopular
                ? "rgba(139, 92, 246, 0.08)"
                : "rgba(100, 116, 139, 0.05)",
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

        {/* Features List - No Labels */}
        <div className="relative z-10 flex-1 mb-10">
          {features && features.length > 0 ? (
            <ul className="space-y-4">
              {features.map((feature: string, idx: number) => (
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
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              No features listed
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className="relative z-10 mt-auto">
          {href ? (
            <Button
              asChild
              className={cn(
                "w-full h-13 rounded-2xl text-sm font-semibold transition-all duration-300 transform active:scale-[0.97]",
                isPopular
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10"
              )}
            >
              <Link href={href}>{cta || "Get Started"}</Link>
            </Button>
          ) : (
            <Button
              onClick={handleClick}
              disabled={isCurrentPlan || loading || !primaryPrice}
              className={cn(
                "w-full h-13 rounded-2xl text-sm font-semibold transition-all duration-300 transform active:scale-[0.97]",
                isCurrentPlan
                  ? "bg-white/50 hover:bg-white/80 text-slate-600 border border-white/60 shadow-none"
                  : isPopular
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10"
              )}
            >
              {loading
                ? "Loading..."
                : isCurrentPlan
                  ? "Current Plan"
                  : primaryPrice
                    ? cta || `Choose ${product.name}`
                    : "Contact for Quote"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return cardContent;
}


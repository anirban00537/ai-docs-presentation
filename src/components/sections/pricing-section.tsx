"use client";

import Link from "next/link";
import { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { IconSparkles, IconCheck, IconRocket } from "@tabler/icons-react";
import { useProducts } from "@/hooks/use-pricing";
import { formatPrice } from "@/services/pricing";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";

const transitionVariants: { item: Variants } = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Butterfast",
    features: [
      "Up to 5 presentations",
      "Basic templates",
      "AI-powered generation",
      "Standard export formats",
      "Community support",
    ],
    cta: "Get Started",
    href: "/presentation",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For professionals and teams",
    features: [
      "Unlimited presentations",
      "Premium templates",
      "Advanced AI features",
      "All export formats",
      "Priority support",
      "Team collaboration",
      "Custom branding",
      "Analytics & insights",
    ],
    cta: "Start Free Trial",
    href: "#pricing",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Advanced security",
      "On-premise deployment",
      "Training & onboarding",
      "Custom contracts",
    ],
    cta: "Contact Sales",
    href: "#contact",
    popular: false,
  },
];

export function PricingSection() {
  const { data: products } = useProducts();

  // Use real products if available, otherwise fall back to static plans
  const displayPlans =
    products && products.length > 0
      ? products.slice(0, 3).map((product, index) => {
          const primaryPrice = product.prices?.[0];
          const maxSlides =
            product.metadata?.max_slides || product.metadata?.maxSlides;
          const isPopular =
            index === 1 ||
            product.name.toLowerCase().includes("pro") ||
            product.name.toLowerCase().includes("plus");
          return {
            ...product,
            name: product.name,
            price: primaryPrice ? formatPrice(primaryPrice) : "Custom",
            period: product.recurringInterval || "",
            description: product.description || "",
            features:
              product.features ||
              (product.benefits
                ?.map((b) => b.description)
                .filter(Boolean) as string[]) ||
              [],
            cta: primaryPrice ? "Get Started" : "Contact Sales",
            href: "/pricing",
            popular: isPopular,
            monthlyCreditLimit: product.monthlyCreditLimit,
            maxSlides,
            primaryPrice,
          };
        })
      : plans;

  return (
    <section className="relative py-20 md:py-32" id="pricing">
      <div className="absolute inset-0 bg-linear-to-b from-white via-primary/10 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.2 },
              },
            },
            ...transitionVariants,
          }}
          className="text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl dark:text-zinc-50">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Choose the plan that works best for you. All plans include our core
            features with no hidden fees.
          </p>
        </AnimatedGroup>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 items-stretch">
          {displayPlans.map((plan: any, index: number) => (
            <motion.div
              key={plan.id || index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="relative h-full"
            >
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center z-20">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-primary/25">
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className={cn(
                  "relative h-full flex flex-col p-8 rounded-[38px] transition-all duration-500 group",
                  plan.popular
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
                      backgroundColor: plan.popular
                        ? "rgba(139, 92, 246, 0.08)"
                        : "rgba(100, 116, 139, 0.05)",
                    }}
                  >
                    {plan.popular ? (
                      <IconSparkles size={20} className="text-primary/70" />
                    ) : (
                      <IconRocket size={20} className="text-slate-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground/70 mt-2 leading-relaxed font-medium">
                      {plan.description}
                    </p>
                  )}
                </div>

                {/* Pricing */}
                <div className="relative z-10 mb-10">
                  {plan.primaryPrice ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-semibold text-foreground tracking-tight">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground/60 text-sm font-medium">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xl font-semibold">Custom</span>
                  )}
                </div>

                {/* Credit & Slides Feature Box */}
                <div className="relative z-10 mb-10 space-y-3">
                  {plan.monthlyCreditLimit !== undefined && (
                    <div
                      className="p-4 rounded-2.5xl"
                      style={{
                        backgroundColor: "rgba(139, 92, 246, 0.04)",
                        border: "1px solid rgba(139, 92, 246, 0.08)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <IconSparkles size={16} className="text-primary/50" />
                        <div>
                          <p className="text-sm font-semibold text-primary/80">
                            {plan.monthlyCreditLimit === 0
                              ? "Unlimited"
                              : plan.monthlyCreditLimit.toLocaleString()}{" "}
                            credits
                          </p>
                          <p className="text-[9px] text-primary/40 uppercase tracking-widest font-bold">
                            Monthly Quota
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {plan.maxSlides && (
                    <div
                      className="p-4 rounded-2.5xl"
                      style={{
                        backgroundColor: "rgba(34, 197, 94, 0.04)",
                        border: "1px solid rgba(34, 197, 94, 0.08)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <IconRocket size={16} className="text-green-600/50" />
                        <div>
                          <p className="text-sm font-semibold text-green-600/80">
                            Up to {plan.maxSlides} slides
                          </p>
                          <p className="text-[9px] text-green-600/40 uppercase tracking-widest font-bold">
                            Per Presentation
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="relative z-10 flex-1 mb-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 mb-5">
                    Features
                  </p>
                  {plan.features && plan.features.length > 0 ? (
                    <ul className="space-y-4">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="mt-1 w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                            <IconCheck
                              size={10}
                              className="text-green-600/70"
                            />
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
                  <Button
                    asChild
                    className={cn(
                      "w-full h-13 rounded-2xl text-sm font-semibold transition-all duration-300 transform active:scale-[0.97]",
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10"
                    )}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}

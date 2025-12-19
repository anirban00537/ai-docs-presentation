"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Variants } from "framer-motion";
import { useProducts } from "@/hooks/use-pricing";
import { formatPrice, getRecurringText } from "@/services/pricing";

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
  const { data: products, isLoading } = useProducts();
  
  // Use real products if available, otherwise fall back to static plans
  const displayPlans = products && products.length > 0
    ? products.slice(0, 3).map((product, index) => {
        const primaryPrice = product.prices?.[0];
        return {
          name: product.name,
          price: primaryPrice ? formatPrice(primaryPrice) : "Custom",
          period: product.recurringInterval 
            ? getRecurringText(product).replace("per ", "").replace("every ", "")
            : "",
          description: product.description || "",
          features: (product.metadata?.features as string[]) || [],
          cta: primaryPrice ? "Get Started" : "Contact Sales",
          href: "/pricing",
          popular: index === 1,
          monthlyCreditLimit: product.monthlyCreditLimit,
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

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {displayPlans.map((plan: any, index: number) => (
            <AnimatedGroup
              key={index}
              variants={transitionVariants}
              className="group relative"
            >
              <div
                className={`relative rounded-2xl border p-8 shadow-lg backdrop-blur-xl transition-all duration-300 ${
                  plan.popular
                    ? "border-primary/50 bg-white/80 shadow-primary/30 dark:border-primary/50 dark:bg-zinc-900/80 dark:shadow-primary/20 scale-105 lg:scale-110"
                    : "border-white/80 bg-white/60 shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-primary/10 dark:hover:shadow-primary/20"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {plan.description}
                  </p>
                  <div className="mt-6 flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-zinc-950 dark:text-zinc-50">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  {plan.monthlyCreditLimit !== undefined && (
                    <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {plan.monthlyCreditLimit === 0
                        ? "Unlimited credits"
                        : `${plan.monthlyCreditLimit.toLocaleString()} credits/month`}
                    </div>
                  )}
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features && plan.features.length > 0 ? (
                    plan.features.map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 rounded-full bg-primary/20 p-1 dark:bg-primary/20">
                        <Check className="h-4 w-4 text-primary dark:text-primary" />
                      </div>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {feature}
                      </span>
                    </li>
                    ))
                  ) : (
                    <li className="text-sm text-zinc-500 dark:text-zinc-400">
                      Features coming soon
                    </li>
                  )}
                </ul>

                <div className="mt-8">
                  <Button
                    asChild
                    size="lg"
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full rounded-xl ${
                      plan.popular
                        ? "px-8"
                        : "border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <Link href={plan.href}>
                      <span className="inline-flex items-center justify-center gap-2 text-white">
                        {plan.cta}
                        {plan.popular && (
                          <ArrowRight className="h-4 w-4 text-white" />
                        )}
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>
            </AnimatedGroup>
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

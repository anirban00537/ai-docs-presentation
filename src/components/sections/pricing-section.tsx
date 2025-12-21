"use client";

import { Variants } from "framer-motion";
import { useProducts } from "@/hooks/use-pricing";
import { PricingCard } from "@/components/pricing-card";
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

export function PricingSection() {
  const { data: products, isLoading } = useProducts();

  // Only use real products from API
  const displayPlans =
    products && products.length > 0
      ? products.slice(0, 3).map((product, index) => {
          const maxSlides =
            product.metadata?.max_slides || product.metadata?.maxSlides;
          const isPopular =
            index === 1 ||
            product.name.toLowerCase().includes("pro") ||
            product.name.toLowerCase().includes("plus");
          return {
            ...product,
            id: product.id,
            name: product.name,
            description: product.description || "",
            prices: product.prices || [],
            recurringInterval: product.recurringInterval || "",
            features:
              product.features ||
              (product.benefits
                ?.map((b) => b.description)
                .filter(Boolean) as string[]) ||
              [],
            cta: product.prices?.[0] ? "Get Started" : "Contact Sales",
            href: "/pricing",
            popular: isPopular,
            monthlyCreditLimit: product.monthlyCreditLimit,
            maxSlides,
            benefits: product.benefits,
            metadata: product.metadata,
          };
        })
      : [];

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

        {isLoading ? (
          <div className="mt-16 grid gap-8 lg:grid-cols-3 items-stretch">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[500px] rounded-[38px] bg-white/20 animate-pulse border border-white/40"
              />
            ))}
          </div>
        ) : displayPlans.length > 0 ? (
          <div className="mt-16 grid gap-8 lg:grid-cols-3 items-stretch">
            {displayPlans.map((plan: any, index: number) => (
              <PricingCard
                key={plan.id || index}
                product={{
                  id: plan.id,
                  name: plan.name,
                  description: plan.description,
                  prices: plan.prices || [],
                  recurringInterval: plan.recurringInterval,
                  monthlyCreditLimit: plan.monthlyCreditLimit,
                  maxSlides: plan.maxSlides,
                  features: plan.features,
                  benefits: plan.benefits,
                  metadata: plan.metadata,
                }}
                isPopular={plan.popular}
                index={index}
                href={plan.href}
                cta={plan.cta}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              No pricing plans available at the moment.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}

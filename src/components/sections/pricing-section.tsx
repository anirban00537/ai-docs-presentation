"use client";

import { motion } from "framer-motion";
import { useProducts } from "@/hooks/use-pricing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { IconSparkles } from "@tabler/icons-react";
import { PricingCard } from "@/components/pricing-card";

export function PricingSection() {
  const { data: products, isLoading } = useProducts();

  // Sort logic or fallback could go here, but focusing on UI
  // I'll wrap the cards in the new aesthetic
  
  const displayPlans = products && products.length > 0 ? products : [
    {
       name: "Starter",
       description: "For individuals just getting started.",
       prices: [{ priceAmount: 0, priceCurrency: "usd", recurringInterval: "month" }],
       benefits: [{ description: "5 presentations/mo" }, { description: "Basic layouts" }, { description: "PDF export" }]
    },
    {
       name: "Pro",
       description: "For power users who need more.",
       prices: [{ priceAmount: 1900, priceCurrency: "usd", recurringInterval: "month" }],
       popular: true,
       benefits: [{ description: "Unlimited presentations" }, { description: "Premium layouts" }, { description: "PPTX export" }, { description: "Custom fonts" }]
    },
     {
       name: "Team",
       description: "For teams collaborating together.",
       prices: [{ priceAmount: 4900, priceCurrency: "usd", recurringInterval: "month" }],
       benefits: [{ description: "Everything in Pro" }, { description: "Shared workspace" }, { description: "Admin tools" }, { description: "Priority support" }]
    },
  ];

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {displayPlans.slice(0, 3).map((plan: any, i) => {
             const isPro = plan.name.toLowerCase().includes("pro") || plan.popular;
             
            return (
              <PricingCard
                key={i}
                product={plan}
                index={i}
                isPopular={isPro}
                href="/signup"
                cta={isPro ? "Get Started Now" : "Start for Free"}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { useProducts } from "@/hooks/use-pricing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { IconSparkles } from "@tabler/icons-react";

export function PricingSection() {
  const { data: products, isLoading } = useProducts();

  // Sort logic or fallback could go here, but focusing on UI
  // I'll wrap the cards in the new aesthetic
  
  const displayPlans = products && products.length > 0 ? products : [
    {
       name: "Starter",
       description: "For individuals just getting started.",
       prices: [{ unit_amount: 0, currency: "usd", interval: "month" }],
       benefits: [{ description: "5 presentations/mo" }, { description: "Basic layouts" }, { description: "PDF export" }]
    },
    {
       name: "Pro",
       description: "For power users who need more.",
       prices: [{ unit_amount: 1900, currency: "usd", interval: "month" }],
       popular: true,
       benefits: [{ description: "Unlimited presentations" }, { description: "Premium layouts" }, { description: "PPTX export" }, { description: "Custom fonts" }]
    },
     {
       name: "Team",
       description: "For teams collaborating together.",
       prices: [{ unit_amount: 4900, currency: "usd", interval: "month" }],
       benefits: [{ description: "Everything in Pro" }, { description: "Shared workspace" }, { description: "Admin tools" }, { description: "Priority support" }]
    },
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden" id="pricing">
        {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
            Invest in your <span className="italic text-primary">impact.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple, transparent pricing that grows with you. No hidden fees, ever.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {displayPlans.slice(0, 3).map((plan: any, i) => {
             const isPro = plan.name.toLowerCase().includes("pro") || plan.popular;
             const price = plan.prices?.[0];
             const amount = price?.priceAmount 
                ? (price.priceAmount / 100).toLocaleString("en-US", { style: "currency", currency: price.priceCurrency || "USD" }).replace(/\.00$/, "")
                : "$0";
             
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "relative rounded-3xl p-8 transition-all duration-300",
                  isPro 
                    ? "bg-white shadow-depth-3 border-transparent md:scale-105 z-10" 
                    : "bg-white/40 border border-secondary/20 shadow-sm hover:shadow-md hover:bg-white/80"
                )}
              >
                {/* Pro Glow Effect */}
                {isPro && (
                    <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-primary/20 via-secondary/20 to-transparent blur-xl opacity-60" />
                )}
                
                {isPro && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-coral-glow flex items-center gap-1">
                        <IconSparkles size={12} fill="currentColor" />
                        Most Popular
                    </div>
                )}

                <div className="mb-8">
                    <h3 className="font-serif text-2xl text-foreground mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-bold text-foreground tracking-tight">{amount}</span>
                    <span className="text-muted-foreground">/mo</span>
                </div>

                <ul className="space-y-4 mb-8">
                    {(() => {
                        const featuresList = plan.features?.length > 0 
                            ? plan.features 
                            : plan.benefits?.map((b: any) => typeof b === 'string' ? b : b.description) || [];
                        
                        return featuresList.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                                <span className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-secondary/30 text-secondary-foreground shrink-0">
                                    <Check size={12} strokeWidth={3} />
                                </span>
                                {feature}
                            </li>
                        ));
                    })()}
                </ul>

                <Button 
                    variant={isPro ? "default" : "outline"}
                    className={cn(
                        "w-full h-12 rounded-full text-base transition-all",
                        isPro 
                            ? "bg-primary hover:bg-primary/90 shadow-coral-glow" 
                            : "border-secondary/20 hover:bg-secondary/10"
                    )}
                    asChild
                >
                    <Link href="/signup">
                        {isPro ? "Get Started Now" : "Start for Free"}
                    </Link>
                </Button>

              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

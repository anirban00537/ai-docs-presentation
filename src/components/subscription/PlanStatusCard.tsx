"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconCreditCard, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface PlanStatusCardProps {
  subscription: any;
  features: any;
  isActive: boolean;
  onCancel: () => void;
  isCanceling: boolean;
}

const getStatusBadge = (status: string) => {
  const configs: Record<string, { label: string; class: string }> = {
    active: { label: "Active", class: "bg-green-500/10 text-green-600 border-green-500/20" },
    trialing: { label: "Trialing", class: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    canceled: { label: "Canceled", class: "bg-red-500/10 text-red-600 border-red-500/20" },
    past_due: { label: "Past Due", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  };

  const config = configs[status] || { label: status, class: "bg-slate-100 text-slate-600 border-slate-200" };

  return (
    <div className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border", config.class)}>
      {config.label}
    </div>
  );
};

export const PlanStatusCard: React.FC<PlanStatusCardProps> = ({
  subscription,
  features,
  isActive,
  onCancel,
  isCanceling,
}) => {
  if (!subscription) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="relative flex flex-col p-9 rounded-[32px] overflow-hidden group bg-white/40 border border-secondary/20 shadow-sm hover:shadow-depth-3 hover:bg-white transition-all duration-300"
      >
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-5">
              <IconCreditCard size={32} className="text-muted-foreground/50" />
            </div>
            <p className="text-xl font-serif font-bold text-foreground tracking-tight">No active membership</p>
            <p className="text-sm text-muted-foreground/70 mt-2 max-w-[200px] leading-relaxed">
              Unlock pro features and more credits today.
            </p>
            <Button onClick={() => (window.location.href = "/pricing")} className="mt-6 rounded-xl h-11 px-6 font-semibold shadow-coral-glow hover:scale-105 transition-transform">
              Explore Plans
            </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="relative flex flex-col p-9 rounded-[32px] overflow-hidden group bg-white/40 border border-secondary/20 shadow-sm hover:shadow-depth-3 hover:bg-white transition-all duration-300"
    >
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-600">
            <IconCreditCard size={24} />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground tracking-tight">Plan Status</h2>
            <p className="text-sm text-primary font-semibold mt-0.5">
                {features?.metadata?.plan_name || features?.productName}
            </p>
          </div>
        </div>
        {getStatusBadge(subscription.status)}
      </div>

      <div className="relative z-10 flex-1 space-y-6">
        {features?.features && features.features.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Plan Features</p>
            <div className="space-y-2">
              {features.features.slice(0, 6).map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm text-foreground/80">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <IconSparkles size={12} className="text-primary" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Next Renewal</p>
            <div className="text-lg font-serif font-bold text-foreground">
              {subscription.currentPeriodEnd 
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
                : "N/A"}
            </div>
        </div>

        <div className="pt-4 mt-auto">
          {subscription.cancelAtPeriodEnd ? (
            <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10">
              <p className="text-sm font-bold text-orange-700">Scheduled Termination</p>
              <p className="text-xs text-orange-700/70 mt-1 font-medium leading-relaxed">Access remains active until the current period expires.</p>
            </div>
          ) : isActive ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">Terminate Membership</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl border border-secondary/20 shadow-2xl bg-white/95 backdrop-blur-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-2xl font-bold tracking-tight">Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                    Your access will continue until the end of your current billing period. Are you sure you want to stop building amazing presentations?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 mt-6">
                  <AlertDialogCancel className="rounded-xl">Keep Plan</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel} disabled={isCanceling} className="rounded-xl bg-red-500 hover:bg-red-600">
                    {isCanceling ? "Ending..." : "Confirm Cancellation"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

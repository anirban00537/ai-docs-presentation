"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  IconCreditCard,
  IconSparkles,
  IconRefresh,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  useSubscriptionStatus,
  useSyncSubscription,
  useCancelSubscription,
  useCreditBalance,
} from "@/hooks/use-subscription";
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

export default function SubscriptionPage() {
  const { data: status, isLoading: statusLoading } = useSubscriptionStatus();
  const { data: creditBalance, isLoading: creditsLoading } = useCreditBalance();
  const syncMutation = useSyncSubscription();
  const cancelMutation = useCancelSubscription();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  const subscription = status?.subscription;
  const credits = creditBalance || status?.creditBalance;
  const isActive = status?.isActive || false;
  const hasCredits = status?.hasCredits || false;

  const handleSync = () => {
    syncMutation.mutate();
  };

  const handleCancel = () => {
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        setCancelDialogOpen(false);
      },
    });
  };

  const getStatusBadge = () => {
    if (!subscription) {
      return (
        <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
          No Subscription
        </div>
      );
    }

    const configs: Record<string, { label: string; class: string }> = {
      active: { label: "Active", class: "bg-green-500/10 text-green-600 border-green-500/20" },
      trialing: { label: "Trialing", class: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      canceled: { label: "Canceled", class: "bg-red-500/10 text-red-600 border-red-500/20" },
      past_due: { label: "Past Due", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    };

    const config = configs[subscription.status] || { label: subscription.status, class: "bg-slate-100 text-slate-600 border-slate-200" };

    return (
      <div className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border", config.class)}>
        {config.label}
      </div>
    );
  };

  const totalAvailableCredits =
    (credits?.remainingCredits || 0) +
    ((credits?.freeCredits || 0) - (credits?.freeCreditsUsed || 0));

  if (statusLoading || creditsLoading) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-4xl space-y-8 animate-pulse">
          <div className="h-12 w-1/3 bg-white/20 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-white/20 rounded-[32px] border border-white/40" />
            <div className="h-64 bg-white/20 rounded-[32px] border border-white/40" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] overflow-y-auto px-4 py-16">
      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-14">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6"
        >
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Billing Overview
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight">
              Subscription & <span className="text-primary/80 font-normal italic">billing</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground/70 mt-3 font-medium max-w-md">
              Monitor your AI credit usage and plan health in real-time.
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="rounded-2xl h-12 px-6 bg-white/40 backdrop-blur-md border border-white/60 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] text-sm font-semibold text-slate-600"
          >
            <IconRefresh
              className={cn("mr-2 h-4 w-4 text-primary/70", syncMutation.isPending && "animate-spin")}
            />
            {syncMutation.isPending ? "Syncing..." : "Sync status"}
          </Button>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Credit Balance Card */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative flex flex-col p-9 rounded-[38px] overflow-hidden group"
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

            <div className="relative z-10 flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div 
                  className="w-11 h-11 rounded-1.5xl flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(139, 92, 246, 0.06)",
                  }}
                >
                  <IconSparkles size={20} className="text-primary/60" />
                </div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Credits</h2>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Available Now</p>
                <p className="text-3xl font-semibold text-foreground tracking-tighter">{totalAvailableCredits.toLocaleString()}</p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-5 pt-2">
              <div className="p-5 rounded-2.5xl bg-white/20 border border-white/40">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1.5">Monthly Limit</p>
                <p className="text-lg font-semibold text-foreground/80">{credits?.monthlyLimit?.toLocaleString() || 0}</p>
              </div>
              <div className="p-5 rounded-2.5xl bg-white/20 border border-white/40">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1.5">Consumed</p>
                <p className="text-lg font-semibold text-foreground/80">{credits?.monthlyUsed?.toLocaleString() || 0}</p>
              </div>
              <div className="p-5 rounded-2.5xl bg-white/20 border border-white/40">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1.5">Free Batch</p>
                <p className="text-lg font-semibold text-foreground/80">{(credits?.freeCredits || 0) - (credits?.freeCreditsUsed || 0)}</p>
              </div>
              <div className="p-5 rounded-2.5xl bg-white/20 border border-white/40">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1.5">Paid Batch</p>
                <p className="text-lg font-semibold text-foreground/80">{credits?.remainingCredits || 0}</p>
              </div>
            </div>

            {!hasCredits && (
              <div className="relative z-10 mt-10 p-4 rounded-2.5xl border border-yellow-500/10 bg-yellow-500/5 flex items-start gap-4">
                <IconAlertCircle className="h-5 w-5 text-yellow-600/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-700/80">Low Credit Balance</p>
                  <p className="text-xs text-yellow-700/50 mt-1 font-medium leading-relaxed italic">
                    You&apos;ve run out of fuel. Level up your plan to keep building.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative flex flex-col p-9 rounded-[38px] overflow-hidden group"
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

            <div className="relative z-10 flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div 
                  className="w-11 h-11 rounded-1.5xl flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.06)",
                  }}
                >
                  <IconCreditCard size={20} className="text-blue-500/60" />
                </div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Plan Status</h2>
              </div>
              {getStatusBadge()}
            </div>

            <div className="relative z-10 flex-1 space-y-8">
              {subscription ? (
                <>
                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-2.5">Subscription Identity</p>
                      <div className="px-4 py-3 rounded-2xl bg-white/20 border border-white/40 font-mono text-[10px] text-foreground/50 truncate">
                        {subscription.polarSubscriptionId || subscription.id}
                      </div>
                    </div>
                    {subscription.currentPeriodEnd && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-2.5">Renewal Date</p>
                        <div className="text-xl font-semibold text-foreground/80 italic underline decoration-primary/20 underline-offset-8">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
                            month: 'long', day: 'numeric', year: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-auto">
                    {subscription.cancelAtPeriodEnd ? (
                      <div className="p-5 rounded-2.5xl bg-orange-500/5 border border-orange-500/10">
                        <p className="text-sm font-semibold text-orange-700/80">Scheduled Termination</p>
                        <p className="text-xs text-orange-700/50 mt-1 font-medium leading-relaxed italic">
                          Access remains active until the current period expires.
                        </p>
                      </div>
                    ) : isActive ? (
                      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full h-13 rounded-2xl text-red-500/70 hover:text-red-600 hover:bg-red-50/50 transition-all font-semibold text-sm"
                          >
                            Terminate Membership
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[32px] border border-white/20 shadow-2xl bg-white/95 backdrop-blur-3xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-semibold tracking-tight">Cancel Subscription?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                              Your access will continue until the end of your current billing period. Are you sure you want to stop building amazing presentations?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2 mt-6">
                            <AlertDialogCancel className="rounded-2xl h-11 px-6 font-semibold text-sm">Keep Plan</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancel}
                              disabled={cancelMutation.isPending}
                              className="rounded-2xl h-11 px-8 font-semibold text-sm bg-red-500 hover:bg-red-600 text-white"
                            >
                              {cancelMutation.isPending ? "Ending..." : "Confirm Cancellation"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-5">
                    <IconCreditCard size={28} className="text-slate-300" />
                  </div>
                  <p className="text-lg font-semibold text-foreground/80 tracking-tight">No active membership</p>
                  <p className="text-sm text-muted-foreground/60 mt-1.5 max-w-[180px] leading-relaxed">Unlock pro features and more credits today.</p>
                  <Button onClick={() => window.location.href = '/pricing'} className="mt-8 rounded-2xl px-10 h-12 bg-slate-900 text-sm font-semibold">Explore Plans</Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Analytics/Usage Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative px-9 py-7 rounded-[38px] overflow-hidden"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(28px) saturate(190%)",
            WebkitBackdropFilter: "blur(28px) saturate(190%)",
            boxShadow: "0 10px 40px -15px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.8) inset",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/30 mb-1.5">Historical Impact</p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-2xl font-semibold text-foreground tracking-tighter">{credits?.usedCredits?.toLocaleString() || 0}</span>
                <span className="text-[10px] font-bold text-muted-foreground/50 mt-1 uppercase tracking-tighter">Credits Consumed</span>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-10 bg-black/5" />
            
            <div className="flex-1 max-w-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Usage Velocity</span>
                  <span className="text-[10px] font-bold text-primary italic">
                    {Math.round(((credits?.monthlyUsed || 0) / (credits?.monthlyLimit || 1)) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.round(((credits?.monthlyUsed || 0) / (credits?.monthlyLimit || 1)) * 100))}%` }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-primary/80 rounded-full shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                  />
                </div>
            </div>

            <div className="hidden md:block w-px h-10 bg-black/5" />

            {credits?.lastResetAt && (
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/30 mb-1.5">Last Reset Cycle</p>
                <p className="text-sm font-semibold text-foreground/70">
                  {new Date(credits.lastResetAt).toLocaleDateString(undefined, { 
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

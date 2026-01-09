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
  useSyncSubscription,
  useCancelSubscription,
} from "@/hooks/use-subscription";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectSubscriptionStatus,
  selectCreditBalance,
  selectIsSubscribed,
  selectSubscriptionLoading,
  fetchSubscriptionInfo,
} from "@/store/slices/subscriptionSlice";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function SubscriptionPage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectSubscriptionStatus);
  const creditBalance = useAppSelector(selectCreditBalance);
  const statusLoading = useAppSelector(selectSubscriptionLoading);
  const isActive = useAppSelector(selectIsSubscribed);

  const syncMutation = useSyncSubscription();
  const cancelMutation = useCancelSubscription();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  const subscription = status?.subscription;
  const credits = creditBalance;

  const totalAvailableCredits = credits?.balance || 0;
  const hasCredits = totalAvailableCredits > 0;

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: () => {
        dispatch(fetchSubscriptionInfo());
      },
    });
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
      active: {
        label: "Active",
        class: "bg-green-500/10 text-green-600 border-green-500/20",
      },
      trialing: {
        label: "Trialing",
        class: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      },
      canceled: {
        label: "Canceled",
        class: "bg-red-500/10 text-red-600 border-red-500/20",
      },
      past_due: {
        label: "Past Due",
        class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      },
    };

    const config = configs[subscription.status] || {
      label: subscription.status,
      class: "bg-slate-100 text-slate-600 border-slate-200",
    };

    return (
      <div
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border",
          config.class
        )}
      >
        {config.label}
      </div>
    );
  };

  if (statusLoading) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-4xl space-y-8">
          <Skeleton className="h-12 w-1/3 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64 rounded-[32px] border border-secondary/10 shadow-sm" />
            <Skeleton className="h-64 rounded-[32px] border border-secondary/10 shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] overflow-y-auto px-4 py-16 ">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30 pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30 pointer-events-none translate-y-1/2" />

      <div className="relative z-10 w-full max-w-7xl flex flex-col gap-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6"
        >
          <div className="text-center sm:text-left">
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
              Subscription &{" "}
              <span className="text-primary italic">billing</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground/80 mt-3 font-medium max-w-md">
              Monitor your AI credit usage and plan health in real-time.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="bg-white/50 border-secondary/20 hover:bg-white transition-all shadow-sm"
          >
            <IconRefresh
              className={cn(
                "mr-2 h-4 w-4 text-primary/70",
                syncMutation.isPending && "animate-spin"
              )}
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
            className="relative flex flex-col p-9 rounded-[32px] overflow-hidden group bg-white/40 border border-secondary/20 shadow-sm hover:shadow-depth-3 hover:bg-white transition-all duration-300"
          >
            <div className="relative z-10 flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                  <IconSparkles size={24} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-foreground tracking-tight">
                  Credits
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                  Available Now
                </p>
                <p className="text-4xl font-serif font-bold text-foreground tracking-tight">
                  {credits?.balance?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-5 pt-2">
              <div className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1.5">
                    Cycle Quota
                  </p>
                  <p className="text-lg font-bold text-foreground/80">
                    {credits?.quota?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1.5">
                    Used This Cycle
                  </p>
                  <p className="text-lg font-bold text-foreground/80">
                    {Math.max(
                      0,
                      (credits?.quota || 0) - (credits?.balance || 0)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {!hasCredits && (
              <div className="relative z-10 mt-10 p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 flex items-start gap-4">
                <IconAlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-yellow-700">
                    Low Credit Balance
                  </p>
                  <p className="text-xs text-yellow-700/70 mt-1 font-medium leading-relaxed">
                    You&apos;ve run out of fuel. Level up your plan to keep
                    building.
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
            className="relative flex flex-col p-9 rounded-[32px] overflow-hidden group bg-white/40 border border-secondary/20 shadow-sm hover:shadow-depth-3 hover:bg-white transition-all duration-300"
          >
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-600">
                  <IconCreditCard size={24} />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground tracking-tight">
                    Plan Status
                  </h2>
                  {status?.features?.productName && (
                    <p className="text-sm text-primary font-semibold mt-0.5">
                      {status.features.metadata?.plan_name ||
                        status.features.productName}
                    </p>
                  )}
                </div>
              </div>
              {getStatusBadge()}
            </div>

            <div className="relative z-10 flex-1 space-y-6">
              {subscription ? (
                <>
                  {/* Plan Features */}
                  {status?.features?.features &&
                    status.features.features.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
                          Plan Features
                        </p>
                        <div className="space-y-2">
                          {status.features.features
                            .slice(0, 6)
                            .map((feature: string, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2.5 text-sm text-foreground/80"
                              >
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <IconSparkles
                                    size={12}
                                    className="text-primary"
                                  />
                                </div>
                                <span className="font-medium">{feature}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Subscription Details Grid */}
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1">
                        AI Credits
                      </p>
                      <p className="text-lg font-bold text-foreground/80">
                        {status?.features?.metadata?.ai_credits ||
                          credits?.quota ||
                          "-"}
                      </p>
                    </div>
                  </div>

                  {/* Renewal Date */}
                  {subscription.currentPeriodEnd && (
                    <div className="pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                        Next Renewal
                      </p>
                      <div className="text-lg font-serif font-bold text-foreground">
                        {new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  )}

                  {/* Subscription ID (collapsible) */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                      Subscription ID
                    </p>
                    <div className="px-3 py-2 rounded-lg bg-secondary/5 border border-secondary/10 font-mono text-[11px] text-foreground/50 truncate">
                      {subscription.polarSubscriptionId || subscription.id}
                    </div>
                  </div>

                  <div className="pt-4 mt-auto">
                    {subscription.cancelAtPeriodEnd ? (
                      <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                        <p className="text-sm font-bold text-orange-700">
                          Scheduled Termination
                        </p>
                        <p className="text-xs text-orange-700/70 mt-1 font-medium leading-relaxed">
                          Access remains active until the current period
                          expires.
                        </p>
                      </div>
                    ) : isActive ? (
                      <AlertDialog
                        open={cancelDialogOpen}
                        onOpenChange={setCancelDialogOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Terminate Membership
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-3xl border border-secondary/20 shadow-2xl bg-white/95 backdrop-blur-3xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-serif text-2xl font-bold tracking-tight">
                              Cancel Subscription?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                              Your access will continue until the end of your
                              current billing period. Are you sure you want to
                              stop building amazing presentations?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2 mt-6">
                            <AlertDialogCancel className="rounded-xl h-11 px-6 font-semibold text-sm border-secondary/20">
                              Keep Plan
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancel}
                              disabled={cancelMutation.isPending}
                              className="rounded-xl h-11 px-8 font-semibold text-sm bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                            >
                              {cancelMutation.isPending
                                ? "Ending..."
                                : "Confirm Cancellation"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-5">
                    <IconCreditCard
                      size={32}
                      className="text-muted-foreground/50"
                    />
                  </div>
                  <p className="text-xl font-serif font-bold text-foreground tracking-tight">
                    No active membership
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-2 max-w-[200px] leading-relaxed">
                    Unlock pro features and more credits today.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/pricing")}
                    className="mt-6 rounded-xl h-11 px-6 font-semibold shadow-coral-glow hover:scale-105 transition-transform"
                  >
                    Explore Plans
                  </Button>
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
          className="relative px-9 py-8 rounded-[32px] overflow-hidden bg-white/40 border border-secondary/20 shadow-sm"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">
                Historical Impact
              </p>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <span className="text-3xl font-serif font-bold text-foreground tracking-tight">
                  {credits?.usedCredits?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-wider">
                  Credits Consumed
                </span>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-secondary/20" />

            <div className="flex-1 max-w-sm w-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Usage Velocity
                </span>
                <span className="text-[12px] font-bold text-primary italic">
                  {Math.round(
                    (Math.max(
                      0,
                      (credits?.quota || 0) - (credits?.balance || 0)
                    ) /
                      (credits?.quota || 1)) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="h-2.5 w-full bg-secondary/10 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (Math.max(
                          0,
                          (credits?.quota || 0) - (credits?.balance || 0)
                        ) /
                          (credits?.quota || 1)) *
                          100
                      )
                    )}%`,
                  }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-primary rounded-full shadow-sm"
                />
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-secondary/20" />

            {credits?.lastResetAt && (
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">
                  Last Reset Cycle
                </p>
                <p className="text-lg font-serif font-bold text-foreground">
                  {new Date(credits.lastResetAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
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

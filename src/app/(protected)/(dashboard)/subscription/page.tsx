"use client";

import React from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

// Sub-components
import { SubscriptionHeader } from "@/components/subscription/SubscriptionHeader";
import { CreditBalanceCard } from "@/components/subscription/CreditBalanceCard";
import { PlanStatusCard } from "@/components/subscription/PlanStatusCard";
import { UsageStatsBar } from "@/components/subscription/UsageStatsBar";

export default function SubscriptionPage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectSubscriptionStatus);
  const creditBalance = useAppSelector(selectCreditBalance);
  const statusLoading = useAppSelector(selectSubscriptionLoading);
  const isActive = useAppSelector(selectIsSubscribed);

  const syncMutation = useSyncSubscription();
  const cancelMutation = useCancelSubscription();

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
        // Handle success
      },
    });
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
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30 pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30 pointer-events-none translate-y-1/2" />

      <div className="relative z-10 w-full max-w-7xl flex flex-col gap-14">
        <SubscriptionHeader onSync={handleSync} isSyncing={syncMutation.isPending} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <CreditBalanceCard 
              balance={creditBalance?.balance || 0} 
              quota={creditBalance?.quota || 0} 
            />
           <PlanStatusCard 
              subscription={status?.subscription}
              features={status?.features}
              isActive={isActive}
              onCancel={handleCancel}
              isCanceling={cancelMutation.isPending}
            />
        </div>

        <UsageStatsBar 
          usedCredits={creditBalance?.usedCredits || 0}
          balance={creditBalance?.balance || 0}
          quota={creditBalance?.quota || 0}
          lastResetAt={creditBalance?.lastResetAt}
        />
      </div>
    </div>
  );
}

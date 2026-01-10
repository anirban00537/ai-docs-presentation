"use client";

import React from "react";
import {
  useCancelSubscription,
} from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectSubscriptionStatus,
  selectCreditBalance,
  selectIsSubscribed,
  selectSubscriptionLoading,
  fetchSubscriptionInfo,
} from "@/store/slices/subscriptionSlice";
import { PageSkeleton, PageHeader } from "@/components/shared";
import { Skeleton, Button } from "@/components/ui";

// Sub-components
import {
  CreditBalanceCard,
  PlanStatusCard,
  UsageStatsBar
} from "@/components/subscription";

export default function SubscriptionPage() {
  const dispatch = useAppDispatch();
  const subscriptionStatus = useAppSelector(selectSubscriptionStatus);
  const creditBalance = useAppSelector(selectCreditBalance);
  const isSubscribed = useAppSelector(selectIsSubscribed);
  const isLoading = useAppSelector(selectSubscriptionLoading);

  const cancelMutation = useCancelSubscription();

  const handleCancel = () => {
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        // Handle success
      },
    });
  };

  if (isLoading) {
    return (
      <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] px-4 py-16 w-full">
        <div className="relative z-10 w-full max-w-7xl">
          <PageSkeleton>
            <Skeleton className="h-12 w-1/3 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-64 rounded-[32px] border border-secondary/10 shadow-sm" />
              <Skeleton className="h-64 rounded-[32px] border border-secondary/10 shadow-sm" />
            </div>
            <Skeleton className="h-12 w-full rounded-2xl" />
          </PageSkeleton>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] overflow-y-auto px-4 py-8 ">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30 pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30 pointer-events-none translate-y-1/2" />

      <div className="relative z-10 w-full max-w-7xl flex flex-col gap-8">
        <PageHeader
          title={<>Subscription & <span className="text-primary italic">Billing</span></>}
          subtitle="Manage your plan and usage."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CreditBalanceCard
            balance={creditBalance?.balance || 0}
            quota={creditBalance?.quota || 0}
          />
          <PlanStatusCard
            subscription={subscriptionStatus?.subscription}
            features={subscriptionStatus?.features}
            isActive={isSubscribed}
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

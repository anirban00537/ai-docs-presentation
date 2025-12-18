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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
      return <Badge variant="secondary">No Subscription</Badge>;
    }

    switch (subscription.status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "trialing":
        return <Badge className="bg-blue-500">Trialing</Badge>;
      case "canceled":
        return <Badge variant="destructive">Canceled</Badge>;
      case "past_due":
        return <Badge className="bg-yellow-500">Past Due</Badge>;
      default:
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const totalAvailableCredits =
    (credits?.remainingCredits || 0) +
    ((credits?.freeCredits || 0) - (credits?.freeCreditsUsed || 0));

  if (statusLoading || creditsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Subscription & Credits
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your subscription and AI credits
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            <IconRefresh
              className={`mr-2 h-4 w-4 ${
                syncMutation.isPending ? "animate-spin" : ""
              }`}
            />
            Sync
          </Button>
        </motion.div>

        {/* Credit Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <IconSparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">Credit Balance</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Available
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalAvailableCredits}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Free Credits
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {(credits?.freeCredits || 0) -
                      (credits?.freeCreditsUsed || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Paid Credits
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {credits?.remainingCredits || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Monthly Limit
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {credits?.monthlyLimit || 0}
                  </p>
                </div>
              </div>

              {!hasCredits && (
                <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-start gap-3">
                  <IconAlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      No credits available
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      You need credits to generate AI-powered presentations.
                      Please upgrade your subscription or purchase credits.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <IconCreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Subscription</h2>
              <div className="ml-auto">{getStatusBadge()}</div>
            </div>

            {subscription ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Subscription ID
                    </p>
                    <p className="text-sm font-mono text-foreground">
                      {subscription.polarSubscriptionId || subscription.id}
                    </p>
                  </div>
                  {subscription.currentPeriodStart &&
                    subscription.currentPeriodEnd && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Billing Period
                        </p>
                        <p className="text-sm text-foreground">
                          {new Date(
                            subscription.currentPeriodStart
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            subscription.currentPeriodEnd
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Your subscription will be canceled at the end of the
                      current billing period.
                    </p>
                  </div>
                )}

                {isActive && !subscription.cancelAtPeriodEnd && (
                  <AlertDialog
                    open={cancelDialogOpen}
                    onOpenChange={setCancelDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Cancel Subscription</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Cancel Subscription?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Your subscription will remain active until the end of
                          the current billing period. You will continue to have
                          access to all features until then.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                        >
                          {cancelMutation.isPending
                            ? "Canceling..."
                            : "Cancel Subscription"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No active subscription
                </p>
                <Button>Upgrade to Pro</Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Usage Stats */}
        {credits && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Credits Used
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {credits.usedCredits}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Monthly Usage
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {credits.monthlyUsed} / {credits.monthlyLimit || "∞"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Free Credits Used
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {credits.freeCreditsUsed} / {credits.freeCredits}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

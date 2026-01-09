"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubscriptionHeaderProps {
  onSync: () => void;
  isSyncing: boolean;
}

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({ 
  onSync, 
  isSyncing 
}) => {
  return (
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
        onClick={onSync}
        disabled={isSyncing}
        className="bg-white/50 border-secondary/20 hover:bg-white transition-all shadow-sm rounded-xl"
      >
        <IconRefresh
          className={cn(
            "mr-2 h-4 w-4 text-primary/70",
            isSyncing && "animate-spin"
          )}
        />
        {isSyncing ? "Syncing..." : "Sync status"}
      </Button>
    </motion.div>
  );
};

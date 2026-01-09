"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconSparkles, IconAlertCircle } from "@tabler/icons-react";

interface CreditBalanceCardProps {
  balance: number;
  quota: number;
}

export const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({ 
  balance, 
  quota 
}) => {
  const hasCredits = balance > 0;
  
  return (
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
            {balance.toLocaleString()}
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
              {quota.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1.5">
              Used This Cycle
            </p>
            <p className="text-lg font-bold text-foreground/80">
              {Math.max(0, quota - balance).toLocaleString()}
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
  );
};

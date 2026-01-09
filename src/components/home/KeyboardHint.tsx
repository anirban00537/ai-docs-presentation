"use client";

import React from "react";
import { motion } from "framer-motion";

interface KeyboardHintProps {
  primaryKey?: string;
  secondaryKey?: string;
  actionText?: string;
}

export const KeyboardHint: React.FC<KeyboardHintProps> = ({
  primaryKey = "⌘",
  secondaryKey = "Enter",
  actionText = "to submit"
}) => {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-xs text-muted-foreground/60 text-center font-medium"
    >
      Press{" "}
      <kbd 
        className="px-2 py-1 rounded-lg text-[10px] font-mono mx-0.5 bg-white border border shadow-sm text-secondary-foreground"
      >
        {primaryKey}
      </kbd>
      +
      <kbd 
        className="px-2 py-1 rounded-lg text-[10px] font-mono mx-0.5 bg-white border border-primary/10 shadow-sm text-secondary-foreground"
      >
        {secondaryKey}
      </kbd>
      {" "}{actionText}
    </motion.p>
  );
};

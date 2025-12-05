"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl space-y-8 text-center"
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent pb-2"
        >
          What presentation do you
          <br />
          want to create?
        </motion.h1>

        <motion.div variants={itemVariants} className="relative group z-10">
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <div className="relative flex items-center bg-background/60 backdrop-blur-2xl border border-border/40 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5 transition-all duration-300 focus-within:ring-primary/30 focus-within:border-primary/30 focus-within:shadow-primary/10 group-hover:shadow-2xl group-hover:shadow-primary/5">
            <textarea
              placeholder="Describe your presentation idea... (e.g., 'A pitch deck for a new AI startup')"
              className="w-full min-h-[100px] p-6 bg-transparent border-none outline-none resize-none text-lg placeholder:text-muted-foreground/40"
            />
            <div className="pr-4 pt-2 self-start md:self-center md:pt-0">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              >
                <Sparkles className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground"
        >
          {["Pitch Deck", "Marketing Strategy", "Quarterly Review"].map(
            (suggestion, index) => (
              <motion.span
                key={suggestion}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(var(--muted), 0.8)",
                  borderColor: "rgba(var(--border), 0.8)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-muted/30 border border-border/30 backdrop-blur-sm cursor-pointer transition-colors"
              >
                {suggestion}
              </motion.span>
            )
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

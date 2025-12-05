"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { AppleButton } from "@/components/editor/apple-button";
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
    <div className="relative flex flex-col items-center justify-center h-full w-full px-4 overflow-hidden">
      {/* Corner gradients - multiple layers for more intensity */}
      {/* Top-left corner */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/40 via-primary/20 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-primary/30 via-primary/15 to-transparent rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Top-right corner */}
      <motion.div
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/40 via-primary/20 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/30 via-primary/15 to-transparent rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Bottom-left corner */}
      <motion.div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-primary/40 via-primary/20 to-transparent rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/30 via-primary/15 to-transparent rounded-full blur-2xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Bottom-right corner */}
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-primary/40 via-primary/20 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6,
        }}
      />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-primary/30 via-primary/15 to-transparent rounded-full blur-2xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Edge gradients for more coverage */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-gradient-to-b from-primary/25 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-gradient-to-t from-primary/25 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-[800px] bg-gradient-to-r from-primary/25 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-[800px] bg-gradient-to-l from-primary/25 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-3xl space-y-8 text-center"
      >
        <motion.h1
          variants={itemVariants}
          className="text-lg md:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent pb-2"
        >
          What presentation do you want to create?
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
          <div
            className="relative flex items-center backdrop-blur-2xl rounded-2xl overflow-hidden transition-all duration-300 ring-1 bg-background/95 border border-white/10 ring-white/10 focus-within:ring-primary/40 focus-within:border-primary/40 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15),0_10px_30px_-10px_rgba(0,0,0,0.1)]"
            style={{
              boxShadow:
                "0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 10px 30px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
          >
            <textarea
              placeholder="Describe your presentation idea... (e.g., 'A pitch deck for a new AI startup')"
              className="w-full min-h-[100px] p-6 bg-transparent border-none outline-none resize-none text-lg text-foreground placeholder:text-muted-foreground"
            />
            <div className="pr-4 pt-2 self-start md:self-center md:pt-0">
              <AppleButton
                variant="primary"
                size="sm"
                className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              >
                <Send className="w-5 h-5" />
              </AppleButton>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground"
        >
          {["Pitch Deck", "Marketing Strategy", "Quarterly Review"].map(
            (suggestion) => (
              <motion.span
                key={suggestion}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full backdrop-blur-sm cursor-pointer transition-colors bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/60 text-muted-foreground hover:text-foreground"
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

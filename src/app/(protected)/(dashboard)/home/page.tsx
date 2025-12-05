"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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

  // 3D mouse tracking
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
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

        <motion.div
          variants={itemVariants}
          className="relative group z-10"
          style={{ perspective: "1000px" }}
        >
          {/* Base shadow for 3D depth */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-30 blur-2xl"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, transparent 70%)",
              transform: "translateZ(-50px) translateY(20px) scale(0.96)",
            }}
            animate={{
              opacity: [0.25, 0.35, 0.25],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Additional shadow layer for more depth */}
          <div
            className="absolute inset-0 rounded-3xl opacity-20 blur-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 245, 200, 0.4) 0%, transparent 70%)",
              transform: "translateZ(-30px) translateY(15px) scale(0.97)",
            }}
          />

          {/* Animated glow effect */}
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Main 3D container */}
          <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Top highlight for 3D effect */}
            <div
              className="absolute -inset-px rounded-3xl opacity-30 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)",
                transform: "translateZ(1px)",
                clipPath: "polygon(0 0, 100% 0, 100% 40%, 0 40%)",
              }}
            />

            {/* Bottom shadow edge */}
            <div
              className="absolute -inset-px rounded-3xl opacity-30 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, transparent 60%, rgba(255, 245, 200, 0.5) 100%)",
                transform: "translateZ(-1px)",
                clipPath: "polygon(0 60%, 100% 60%, 100% 100%, 0 100%)",
              }}
            />

            {/* Main box with 3D styling */}
            <div
              className="relative flex items-center backdrop-blur-2xl rounded-3xl overflow-hidden bg-background/95 border-2 border-white/20"
              style={{
                transform: "translateZ(0)",
                boxShadow: `
                  0 0 0 1px rgba(255, 255, 255, 0.2),
                  0 8px 32px rgba(255, 245, 200, 0.4),
                  0 16px 64px rgba(255, 250, 220, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.5),
                  inset 0 -1px 0 rgba(255, 245, 200, 0.25),
                  0 32px 80px -20px rgba(255, 245, 200, 0.5),
                  0 4px 16px rgba(255, 245, 200, 0.3)
                `,
              }}
            >
              {/* Inner glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, hsl(var(--primary)) / 0.15, transparent 70%)",
                }}
              />

              {/* Left border highlight */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px] opacity-50 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
                }}
              />

              <textarea
                placeholder="Describe your presentation idea... (e.g., 'A pitch deck for a new AI startup')"
                className="relative w-full min-h-[100px] p-6 bg-transparent border-none outline-none resize-none text-lg text-foreground placeholder:text-muted-foreground z-10"
                style={{ transform: "translateZ(10px)" }}
              />
              <div
                className="pr-4 pt-2 self-start md:self-center md:pt-0 z-10"
                style={{ transform: "translateZ(10px)" }}
              >
                <AppleButton
                  variant="primary"
                  size="sm"
                  className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed group/btn relative"
                  style={{
                    boxShadow:
                      "0 4px 12px rgba(255, 245, 200, 0.4), 0 2px 8px rgba(255, 250, 220, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <Send
                    className="w-5 h-5 relative"
                    style={{ transform: "translateZ(20px)" }}
                  />
                </AppleButton>
              </div>
            </div>
          </motion.div>
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

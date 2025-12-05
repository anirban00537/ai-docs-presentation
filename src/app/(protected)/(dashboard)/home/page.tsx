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
    <div
      className="relative flex flex-col items-center justify-center h-full w-full px-4 overflow-hidden"
      style={{
        backgroundColor: "hsl(var(--background))",
        backgroundImage: `
          radial-gradient(circle at 20% 30%, hsl(var(--primary)) / 0.4 0%, transparent 40%),
          radial-gradient(circle at 80% 20%, hsl(var(--primary)) / 0.35 0%, transparent 45%),
          radial-gradient(circle at 70% 80%, hsl(var(--primary)) / 0.3 0%, transparent 50%),
          radial-gradient(circle at 30% 70%, hsl(var(--primary)) / 0.25 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, hsl(var(--primary)) / 0.15 0%, transparent 60%),
          radial-gradient(circle at 10% 60%, hsl(var(--primary)) / 0.2 0%, transparent 40%),
          radial-gradient(circle at 90% 50%, hsl(var(--primary)) / 0.2 0%, transparent 40%)
        `,
      }}
    >
      {/* Mesh gradient overlay - gradient from light white top to white bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.4) 60%, rgba(255, 255, 255, 0.9) 85%, rgba(255, 255, 255, 1) 100%)",
        }}
      />
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

          {/* Animated glow effect - horizontal */}
          <motion.div
            className="absolute -inset-3 bg-gradient-to-r from-primary/50 via-primary/30 to-primary/50 rounded-3xl blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Animated glow effect - vertical */}
          <motion.div
            className="absolute -inset-3 bg-gradient-to-b from-primary/40 via-primary/25 to-primary/40 rounded-3xl blur-3xl opacity-50"
            animate={{
              backgroundPosition: ["50% 0%", "50% 100%", "50% 0%"],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
              delay: 1,
            }}
          />

          {/* Diagonal gradient layer 1 */}
          <motion.div
            className="absolute -inset-4 bg-gradient-to-br from-primary/35 via-primary/15 to-transparent rounded-3xl blur-2xl opacity-40"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Diagonal gradient layer 2 */}
          <motion.div
            className="absolute -inset-4 bg-gradient-to-tl from-primary/35 via-primary/15 to-transparent rounded-3xl blur-2xl opacity-40"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          {/* Radial gradient layer */}
          <motion.div
            className="absolute -inset-3 rounded-3xl blur-2xl opacity-45"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, hsl(var(--primary)) / 0.3, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.35, 0.55, 0.35],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
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
              className="relative flex items-center backdrop-blur-2xl rounded-3xl overflow-hidden bg-background/95"
              style={{
                transform: "translateZ(0)",
                border: "1px solid hsl(var(--primary) / 0.4)",
                boxShadow: `
                  0 0 0 1px hsl(var(--primary) / 0.3),
                  0 8px 32px rgba(255, 245, 200, 0.4),
                  0 16px 64px rgba(255, 250, 220, 0.3),
                  inset 0 1px 0 hsl(var(--primary) / 0.2),
                  inset 0 -1px 0 rgba(255, 245, 200, 0.25),
                  0 32px 80px -20px rgba(255, 245, 200, 0.5),
                  0 4px 16px rgba(255, 245, 200, 0.3)
                `,
              }}
            >
              {/* Inner glow - radial */}
              <div
                className="absolute inset-0 opacity-60 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, hsl(var(--primary)) / 0.2, transparent 70%)",
                }}
              />

              {/* Inner glow - top gradient */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(var(--primary)) / 0.15 0%, transparent 50%)",
                }}
              />

              {/* Inner glow - side gradients */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, hsl(var(--primary)) / 0.1 0%, transparent 30%, transparent 70%, hsl(var(--primary)) / 0.1 100%)",
                }}
              />

              {/* Top border highlight */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-70 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.8) 20%, hsl(var(--primary) / 1) 50%, hsl(var(--primary) / 0.8) 80%, transparent 100%)",
                }}
              />

              {/* Right border highlight */}
              <div
                className="absolute right-0 top-0 bottom-0 w-px opacity-50 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.5) 30%, hsl(var(--primary) / 0.7) 50%, hsl(var(--primary) / 0.5) 70%, transparent 100%)",
                }}
              />

              {/* Bottom border highlight */}
              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-40 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.4) 30%, hsl(var(--primary) / 0.6) 50%, hsl(var(--primary) / 0.4) 70%, transparent 100%)",
                }}
              />

              {/* Left border highlight */}
              <div
                className="absolute left-0 top-0 bottom-0 w-px opacity-60 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(var(--primary) / 0.7) 0%, hsl(var(--primary) / 0.8) 30%, hsl(var(--primary) / 0.6) 50%, hsl(var(--primary) / 0.4) 70%, transparent 100%)",
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

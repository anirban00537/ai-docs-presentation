"use client";

import * as React from "react";
import { Send, Loader2 } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { AppleButton } from "@/components/apple-button";
import { useCreatePresentationFromPrompt } from "@/hooks/use-presentation";
import { toast } from "sonner";

export function PromptBox() {
  const router = useRouter();
  const [prompt, setPrompt] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const createFromPromptMutation = useCreatePresentationFromPrompt();

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      const response = await createFromPromptMutation.mutateAsync({
        prompt: prompt.trim(),
        numberOfSlides: 8,
      });

      if (response.success && response.data) {
        toast.success("Presentation created successfully!");
        router.push(`/presentation/${response.data.id}`);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create presentation"
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative group z-10" style={{ perspective: "1000px" }}>
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

        {/* 3D Border Container - Outer border layer */}
        <div
          className="absolute -inset-[2px] rounded-3xl pointer-events-none"
          style={{
            background: `
              linear-gradient(135deg, 
                hsl(var(--primary) / 0.6) 0%, 
                hsl(var(--primary) / 0.4) 50%, 
                hsl(var(--primary) / 0.6) 100%
              )
            `,
            transform: "translateZ(-5px)",
          }}
        />

        {/* 3D Border - Inner border shadow */}
        <div
          className="absolute -inset-[1px] rounded-3xl pointer-events-none"
          style={{
            background: `
              linear-gradient(315deg, 
                transparent 0%, 
                hsl(var(--primary) / 0.3) 30%, 
                hsl(var(--primary) / 0.5) 50%, 
                hsl(var(--primary) / 0.3) 70%, 
                transparent 100%
              )
            `,
            transform: "translateZ(-3px)",
          }}
        />

        {/* 3D Border - Top light edge */}
        <div
          className="absolute -inset-[2px] rounded-3xl pointer-events-none"
          style={{
            background: `
              linear-gradient(180deg, 
                rgba(255, 255, 255, 0.4) 0%, 
                rgba(255, 255, 255, 0.2) 20%, 
                transparent 50%
              )
            `,
            transform: "translateZ(2px)",
            clipPath: "polygon(0 0, 100% 0, 100% 30%, 0 30%)",
          }}
        />

        {/* 3D Border - Left light edge */}
        <div
          className="absolute -inset-[2px] rounded-3xl pointer-events-none"
          style={{
            background: `
              linear-gradient(90deg, 
                rgba(255, 255, 255, 0.35) 0%, 
                rgba(255, 255, 255, 0.15) 25%, 
                transparent 50%
              )
            `,
            transform: "translateZ(2px)",
            clipPath: "polygon(0 0, 30% 0, 30% 100%, 0 100%)",
          }}
        />

        {/* 3D Border - Right shadow edge */}
        <div
          className="absolute -inset-[2px] rounded-3xl pointer-events-none"
          style={{
            background: `
              linear-gradient(270deg, 
                hsl(var(--primary) / 0.4) 0%, 
                hsl(var(--primary) / 0.6) 25%, 
                transparent 50%
              )
            `,
            transform: "translateZ(-2px)",
            clipPath: "polygon(70% 0, 100% 0, 100% 100%, 70% 100%)",
          }}
        />

        {/* 3D Border - Bottom shadow edge */}
        <div
          className="absolute -inset-[2px] rounded-3xl pointer-events-none"
          style={{
            background: `
              linear-gradient(0deg, 
                hsl(var(--primary) / 0.4) 0%, 
                hsl(var(--primary) / 0.6) 20%, 
                transparent 50%
              )
            `,
            transform: "translateZ(-2px)",
            clipPath: "polygon(0 70%, 100% 70%, 100% 100%, 0 100%)",
          }}
        />

        {/* Main box with 3D border styling */}
        <div
          className="relative flex items-center backdrop-blur-2xl rounded-3xl overflow-hidden bg-background/95"
          style={{
            transform: "translateZ(0)",
            border: "2px solid transparent",
            boxShadow: `
              0 0 0 1px hsl(var(--primary) / 0.3),
              0 0 0 2px hsl(var(--primary) / 0.2),
              0 8px 32px rgba(255, 245, 200, 0.4),
              0 16px 64px rgba(255, 250, 220, 0.3),
              inset 0 2px 4px rgba(255, 255, 255, 0.3),
              inset 0 -2px 4px hsl(var(--primary) / 0.2),
              0 32px 80px -20px rgba(255, 245, 200, 0.5),
              0 4px 16px rgba(255, 245, 200, 0.3),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1)
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

          {/* Top border highlight - 3D effect */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] opacity-90 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 10%, hsl(var(--primary) / 0.9) 30%, hsl(var(--primary)) 50%, hsl(var(--primary) / 0.9) 70%, rgba(255, 255, 255, 0.6) 90%, transparent 100%)",
              transform: "translateZ(3px)",
              boxShadow: "0 2px 4px rgba(255, 255, 255, 0.3)",
            }}
          />

          {/* Right border - 3D shadow effect */}
          <div
            className="absolute right-0 top-0 bottom-0 w-[3px] opacity-70 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.5) 30%, hsl(var(--primary) / 0.7) 50%, hsl(var(--primary) / 0.5) 70%, transparent 100%)",
              transform: "translateZ(-2px)",
              boxShadow: "-2px 0 4px hsl(var(--primary) / 0.3)",
            }}
          />

          {/* Bottom border - 3D shadow effect */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px] opacity-60 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.4) 30%, hsl(var(--primary) / 0.6) 50%, hsl(var(--primary) / 0.4) 70%, transparent 100%)",
              transform: "translateZ(-2px)",
              boxShadow: "0 -2px 4px hsl(var(--primary) / 0.3)",
            }}
          />

          {/* Left border - 3D light effect */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] opacity-80 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, hsl(var(--primary) / 0.8) 30%, hsl(var(--primary) / 0.6) 50%, hsl(var(--primary) / 0.4) 70%, transparent 100%)",
              transform: "translateZ(2px)",
              boxShadow: "2px 0 4px rgba(255, 255, 255, 0.2)",
            }}
          />

          {/* Corner highlights for 3D effect */}
          <div
            className="absolute top-0 left-0 w-8 h-8 rounded-tl-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at top left, rgba(255, 255, 255, 0.4), transparent 70%)",
              transform: "translateZ(4px)",
            }}
          />
          <div
            className="absolute top-0 right-0 w-8 h-8 rounded-tr-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(255, 255, 255, 0.3), transparent 70%)",
              transform: "translateZ(4px)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at bottom left, hsl(var(--primary) / 0.3), transparent 70%)",
              transform: "translateZ(-4px)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-8 h-8 rounded-br-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at bottom right, hsl(var(--primary) / 0.3), transparent 70%)",
              transform: "translateZ(-4px)",
            }}
          />

          <form onSubmit={handleSubmit} className="flex items-center w-full">
          <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            placeholder="Describe your presentation idea... (e.g., 'A pitch deck for a new AI startup')"
            className="relative w-full min-h-[100px] p-6 bg-transparent border-none outline-none resize-none text-lg text-foreground placeholder:text-muted-foreground z-10"
            style={{ transform: "translateZ(10px)" }}
              disabled={createFromPromptMutation.isPending}
          />
          <div
            className="pr-4 pt-2 self-start md:self-center md:pt-0 z-10"
            style={{ transform: "translateZ(10px)" }}
          >
            <AppleButton
                type="submit"
              variant="primary"
              size="sm"
                disabled={!prompt.trim() || createFromPromptMutation.isPending}
              className="p-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed group/btn relative"
              style={{
                boxShadow:
                  "0 4px 12px rgba(255, 245, 200, 0.4), 0 2px 8px rgba(255, 250, 220, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
              }}
            >
                {createFromPromptMutation.isPending ? (
                  <Loader2
                    className="w-5 h-5 relative text-white animate-spin"
                    style={{ transform: "translateZ(20px)" }}
                  />
                ) : (
              <Send
                className="w-5 h-5 relative text-white"
                style={{ transform: "translateZ(20px)" }}
              />
                )}
            </AppleButton>
          </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}


"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PromptBox } from "@/components/prompt-box";
import { PresentationCard } from "@/components/presentation-card";
import {
  usePresentationsList,
  useDeletePresentation,
} from "@/hooks/use-presentation";

export default function HomePage() {
  const router = useRouter();
  const deletePresentationMutation = useDeletePresentation();
  const { data: presentationsResponse } = usePresentationsList({
    limit: 5,
  });
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

  const handleOpenPresentation = (presentationId: string) => {
    router.push(`/editor?presentationId=${presentationId}`);
  };

  const handleDeletePresentation = (
    presentationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    deletePresentationMutation.mutate(presentationId);
  };

  const presentations = presentationsResponse?.success
    ? presentationsResponse.data?.list || []
    : [];

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-full w-full px-4 overflow-auto"
      style={{
        backgroundColor: "hsl(var(--background))",
        backgroundImage: `
          radial-gradient(circle at 20% 30%, hsl(var(--primary)) / 0.4 0%, transparent 40%),
          radial-gradient(circle at 80% 20%, hsl(var(--secondary)) / 0.35 0%, transparent 45%),
          radial-gradient(circle at 70% 80%, hsl(var(--accent)) / 0.3 0%, transparent 50%),
          radial-gradient(circle at 30% 70%, hsl(var(--chart-1)) / 0.3 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, hsl(var(--chart-2)) / 0.25 0%, transparent 60%),
          radial-gradient(circle at 10% 60%, hsl(var(--chart-3)) / 0.25 0%, transparent 40%),
          radial-gradient(circle at 90% 50%, hsl(var(--chart-4)) / 0.25 0%, transparent 40%),
          radial-gradient(circle at 40% 20%, hsl(var(--chart-5)) / 0.2 0%, transparent 40%),
          radial-gradient(circle at 60% 90%, hsl(var(--primary)) / 0.2 0%, transparent 45%),
          radial-gradient(circle at 15% 80%, hsl(var(--secondary)) / 0.2 0%, transparent 40%)
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

      <div className="relative z-10 w-full max-w-7xl mx-auto py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-3xl mx-auto space-y-8 text-center mb-16"
        >
          <motion.h1
            variants={itemVariants}
            className="text-lg md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent pb-2"
          >
            What presentation do you want to create?
          </motion.h1>

          <motion.div variants={itemVariants}>
            <PromptBox />
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

        {/* Recent Presentations Section */}
        {presentations.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full mt-16"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                Recent Presentations
              </h2>
              <p className="text-sm text-muted-foreground">
                Continue working on your recent presentations
              </p>
            </motion.div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {presentations.map((presentation) => (
                <PresentationCard
                  key={presentation.id}
                  presentation={presentation}
                  onOpen={handleOpenPresentation}
                  onDelete={handleDeletePresentation}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

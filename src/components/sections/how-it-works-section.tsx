"use client";

import { Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { AnimatedGroup } from "@/components/ui/animated-group";

const transitionVariants: { item: Variants } = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

const steps = [
  {
    number: "01",
    title: "Describe Your Idea",
    description:
      "Tell our AI what you want to present. A few words or a detailed brief—we handle both.",
  },
  {
    number: "02",
    title: "AI Creates Your Slides",
    description:
      "Watch as our AI generates beautiful, professional slides tailored to your content.",
  },
  {
    number: "03",
    title: "Customize & Refine",
    description:
      "Fine-tune your presentation with our intuitive editor. Change colors, fonts, and layouts.",
  },
  {
    number: "04",
    title: "Share & Present",
    description:
      "Export, share, or present directly. Your presentation is ready in minutes, not hours.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-20 md:py-32">
      <div className="absolute inset-0 bg-linear-to-b from-white via-primary/10 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.2 },
              },
            },
            ...transitionVariants,
          }}
          className="text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl dark:text-zinc-50">
            How it works
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Creating stunning presentations has never been easier. Follow these
            simple steps.
          </p>
        </AnimatedGroup>

        <div className="mt-16 space-y-8">
          {steps.map((step, index) => (
            <AnimatedGroup
              key={index}
              variants={transitionVariants}
              className="group"
            >
              <div className="flex flex-col items-center gap-8 rounded-2xl border border-white/80 bg-white/60 p-8 shadow-lg shadow-primary/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 md:flex-row md:gap-12 dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-primary/10 dark:hover:shadow-primary/20">
                <div className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/20 p-6 dark:bg-primary/20">
                  <span className="text-4xl font-bold text-primary dark:text-primary">
                    {step.number}
                  </span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden shrink-0 md:block">
                    <ArrowRight className="h-6 w-6 text-primary dark:text-primary" />
                  </div>
                )}
              </div>
            </AnimatedGroup>
          ))}
        </div>
      </div>
    </section>
  );
}

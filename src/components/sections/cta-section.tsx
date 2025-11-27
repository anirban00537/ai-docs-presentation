"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Variants } from "framer-motion";

import { AppleButton } from "@/components/editor/apple-button";
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

export function CTASection() {
  return (
    <section className="relative py-20 md:py-32">
      <div className="absolute inset-0 bg-linear-to-b from-white via-[#FFF8E0]/50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.2 },
              },
            },
            ...transitionVariants,
          }}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl dark:text-zinc-50">
            Ready to create your first
            <br className="hidden sm:block" />
            presentation?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Join thousands of creators who are already using Butterfast to
            create stunning presentations.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <AppleButton
              asChild
              size="lg"
              variant="primary"
              className="rounded-xl px-8 text-base"
            >
              <Link href="/editor">
                <span className="inline-flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </AppleButton>
            <AppleButton
              asChild
              size="lg"
              variant="ghost"
              className="h-12 rounded-xl px-8 text-base"
            >
              <Link href="#link">
                <span>Watch Demo</span>
              </Link>
            </AppleButton>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}


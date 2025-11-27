"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Variants } from "framer-motion";

import { AppleButton } from "@/components/editor/apple-button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Navbar } from "@/components/navbar";

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

export function HeroSection() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden bg-linear-to-b from-[#FFF8E0] via-white to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-background">
        <section className="relative">
          <div className="relative pt-32 md:pt-40 lg:pt-48">
            <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 pb-20 md:gap-20 md:pb-32 lg:flex-row lg:items-center lg:gap-24">
              {/* Left column */}
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
                    },
                  },
                  ...transitionVariants,
                }}
                className="max-w-2xl space-y-10 lg:max-w-2xl"
              >
                <div className="space-y-8">
                  <h1 className="text-balance text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl md:text-7xl lg:text-8xl dark:text-zinc-50">
                    Presentations that feel
                    <br className="hidden sm:block" />
                    as smooth as butter.
                  </h1>
                  <p className="text-balance text-lg leading-relaxed text-zinc-600 sm:text-xl md:text-2xl md:leading-relaxed dark:text-zinc-400">
                    Create stunning, buttery-smooth presentations effortlessly
                    with AI. Design, customize, and share professional slides
                    that flow seamlessly.
                  </p>
                </div>

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <AppleButton
                    asChild
                    size="lg"
                    variant="primary"
                    className="rounded-xl px-8 text-base"
                  >
                    <Link href="/editor">
                      <span className="inline-flex items-center gap-2">
                        Create Presentation
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
                      <span>Explore Research Tools</span>
                    </Link>
                  </AppleButton>
                </div>
              </AnimatedGroup>

              {/* Right column – empty demo canvas */}
              <AnimatedGroup variants={transitionVariants} className="flex-1">
                <div className="relative">
                  <div className="relative flex h-[400px] items-center justify-center rounded-3xl border border-white/80 bg-white/50 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/50 md:h-[480px] lg:h-[520px]">
                    <div className="pointer-events-none absolute inset-12 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800" />
                  </div>
                </div>
              </AnimatedGroup>
            </div>
          </div>

          {/* Logos strip */}
          <section className="pb-20 pt-8 md:pb-32 md:pt-12">
            <div className="mx-auto max-w-6xl px-6">
              <p className="mb-8 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-500">
                TRUSTED BY LEADING COMPANIES
              </p>
              <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:opacity-50 dark:hover:opacity-80">
                <img
                  className="h-5 w-auto dark:invert"
                  src="/nvidia.svg"
                  alt="Nvidia Logo"
                  height="20"
                  width="auto"
                />
                <img
                  className="h-5 w-auto dark:invert"
                  src="https://html.tailus.io/blocks/customers/github.svg"
                  alt="GitHub Logo"
                  height="20"
                  width="auto"
                />
                <img
                  className="h-5 w-auto dark:invert"
                  src="https://html.tailus.io/blocks/customers/openai.svg"
                  alt="OpenAI Logo"
                  height="20"
                  width="auto"
                />
                <img
                  className="h-5 w-auto dark:invert"
                  src="https://html.tailus.io/blocks/customers/nike.svg"
                  alt="Nike Logo"
                  height="20"
                  width="auto"
                />
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}

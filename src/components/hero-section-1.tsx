"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Variants } from "framer-motion";

import { AppleButton } from "@/components/apple-button";
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

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat "
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1668853853439-923e013afff1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10">
        <div className="relative">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 pb-20 pt-32 md:gap-20 md:pb-32 md:pt-40 lg:pt-48">
            {/* Center column */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
                  },
                },
                ...transitionVariants,
              }}
              className="flex w-full max-w-4xl flex-col items-center space-y-10 text-center"
            >
              <div className="space-y-8">
                <h1
                  className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                  style={{
                    background:
                      "linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 30%, #3a3a3a 60%, #1f1f1f 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Presentations that feel
                  <br className="hidden sm:block" />
                  as smooth as butter.
                </h1>
                <p
                  className="text-balance text-base leading-relaxed sm:text-lg md:text-xl md:leading-relaxed"
                  style={{
                    background:
                      "linear-gradient(180deg, #2a2a2a 0%, #3a3a3a 50%, #4a4a4a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Create stunning, buttery-smooth presentations effortlessly
                  with AI. Design, customize, and share professional slides that
                  flow seamlessly.
                </p>
              </div>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-center">
                <AppleButton
                  asChild
                  size="lg"
                  variant="primary"
                  className="rounded-xl px-8 text-base"
                >
                  <Link href="/home">
                    <span className="inline-flex items-center gap-2 text-white">
                      Create Presentation
                      <ArrowRight className="h-4 w-4 text-white" />
                    </span>
                  </Link>
                </AppleButton>
              </div>
            </AnimatedGroup>

            {/* Video section at bottom */}
            <AnimatedGroup
              variants={transitionVariants}
              className="w-full max-w-5xl"
            >
              <div className="relative w-full overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-2xl shadow-yellow-200/30 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90 dark:shadow-zinc-900/50">
                <div className="relative aspect-video w-full">
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=0&modestbranding=1&rel=0"
                    title="Demo Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </div>

        {/* Logos strip */}
        <section className="pb-20 pt-8 md:pb-32 md:pt-12">
          <div className="mx-auto max-w-6xl px-6">
            <p
              className="mb-8 text-center text-xs font-medium tracking-wider"
              style={{
                background:
                  "linear-gradient(180deg, #2a2a2a 0%, #3a3a3a 50%, #4a4a4a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
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
      </div>
    </section>
  );
}

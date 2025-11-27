"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Variants, motion } from "framer-motion";

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

function AnimatedMeshGradient() {
  const gradientBlobs = [
    {
      gradient:
        "radial-gradient(circle, rgba(255, 215, 0, 0.35) 0%, rgba(255, 223, 0, 0.25) 50%, rgba(255, 241, 118, 0.35) 100%)",
      darkGradient:
        "radial-gradient(circle, rgba(255, 215, 0, 0.18) 0%, rgba(255, 223, 0, 0.12) 50%, rgba(255, 241, 118, 0.18) 100%)",
      size: "w-[600px] h-[600px]",
      x: ["-10%", "10%"],
      y: ["-10%", "20%"],
      duration: 20,
    },
    {
      gradient:
        "radial-gradient(circle, rgba(255, 193, 7, 0.35) 0%, rgba(255, 235, 59, 0.25) 50%, rgba(255, 248, 220, 0.35) 100%)",
      darkGradient:
        "radial-gradient(circle, rgba(255, 193, 7, 0.18) 0%, rgba(255, 235, 59, 0.12) 50%, rgba(255, 248, 220, 0.18) 100%)",
      size: "w-[500px] h-[500px]",
      x: ["80%", "70%"],
      y: ["10%", "30%"],
      duration: 25,
    },
    {
      gradient:
        "radial-gradient(circle, rgba(255, 250, 205, 0.3) 0%, rgba(255, 253, 208, 0.2) 50%, rgba(255, 238, 88, 0.3) 100%)",
      darkGradient:
        "radial-gradient(circle, rgba(255, 250, 205, 0.15) 0%, rgba(255, 253, 208, 0.1) 50%, rgba(255, 238, 88, 0.15) 100%)",
      size: "w-[700px] h-[700px]",
      x: ["50%", "40%"],
      y: ["60%", "50%"],
      duration: 30,
    },
    {
      gradient:
        "radial-gradient(circle, rgba(255, 223, 0, 0.35) 0%, rgba(255, 215, 0, 0.25) 50%, rgba(255, 241, 118, 0.35) 100%)",
      darkGradient:
        "radial-gradient(circle, rgba(255, 223, 0, 0.18) 0%, rgba(255, 215, 0, 0.12) 50%, rgba(255, 241, 118, 0.18) 100%)",
      size: "w-[550px] h-[550px]",
      x: ["20%", "30%"],
      y: ["70%", "60%"],
      duration: 22,
    },
    {
      gradient:
        "radial-gradient(circle, rgba(255, 235, 59, 0.3) 0%, rgba(255, 248, 220, 0.2) 50%, rgba(255, 193, 7, 0.3) 100%)",
      darkGradient:
        "radial-gradient(circle, rgba(255, 235, 59, 0.15) 0%, rgba(255, 248, 220, 0.1) 50%, rgba(255, 193, 7, 0.15) 100%)",
      size: "w-[650px] h-[650px]",
      x: ["70%", "60%"],
      y: ["-5%", "15%"],
      duration: 28,
    },
    {
      gradient:
        "radial-gradient(circle, rgba(255, 241, 118, 0.3) 0%, rgba(255, 250, 205, 0.2) 50%, rgba(255, 223, 0, 0.3) 100%)",
      darkGradient:
        "radial-gradient(circle, rgba(255, 241, 118, 0.15) 0%, rgba(255, 250, 205, 0.1) 50%, rgba(255, 223, 0, 0.15) 100%)",
      size: "w-[800px] h-[800px]",
      x: ["30%", "35%"],
      y: ["40%", "45%"],
      duration: 35,
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {gradientBlobs.map((blob, index) => (
        <motion.div
          key={index}
          className={`absolute ${blob.size} rounded-full blur-3xl`}
          style={{
            background: blob.gradient,
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            left: blob.x,
            top: blob.y,
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Dark mode gradients */}
      <div className="dark:block hidden pointer-events-none absolute inset-0 overflow-hidden">
        {gradientBlobs.map((blob, index) => (
          <motion.div
            key={`dark-${index}`}
            className={`absolute ${blob.size} rounded-full blur-3xl`}
            style={{
              background: blob.darkGradient,
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              left: blob.x,
              top: blob.y,
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-zinc-950">
      <AnimatedMeshGradient />
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
                <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl lg:text-7xl dark:text-zinc-50">
                  Presentations that feel
                  <br className="hidden sm:block" />
                  as smooth as butter.
                </h1>
                <p className="text-balance text-base leading-relaxed text-zinc-600 sm:text-lg md:text-xl md:leading-relaxed dark:text-zinc-400">
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

              {/* Decorative glow */}
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl bg-linear-to-br from-yellow-200/40 via-amber-100/30 to-orange-100/40 blur-3xl dark:from-yellow-500/20 dark:via-amber-500/15 dark:to-orange-500/20" />
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
      </div>
    </section>
  );
}

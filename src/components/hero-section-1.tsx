"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Variants, motion } from "framer-motion";
import Image from "next/image";

import { AppleButton } from "@/components/editor/apple-button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Navbar } from "@/components/navbar";

const HERO_IMAGES = ["/demo.png", "/demo.png", "/demo.png"];

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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <main className="overflow-hidden bg-linear-to-b from-[#FFF8E0] via-white to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-background">
        <section className="relative">
          <div className="relative ">
            <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 pb-20 md:gap-20 md:pb-32 lg:flex-row lg:items-center lg:gap-20 lg:pt-8">
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
                className="max-w-2xl shrink-0 space-y-10 lg:w-1/3 lg:max-w-xl"
              >
                <div className="space-y-8">
                  <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl lg:text-7xl dark:text-zinc-50">
                    Presentations that feel
                    <br className="hidden sm:block" />
                    as smooth as butter.
                  </h1>
                  <p className="text-balance text-base leading-relaxed text-zinc-600 sm:text-lg md:text-xl md:leading-relaxed dark:text-zinc-400">
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

              {/* Right column – slide previews */}
              <AnimatedGroup
                variants={transitionVariants}
                className="flex-1 lg:min-w-0"
              >
                <div className="relative flex min-h-[800px] w-full flex-col items-center justify-center gap-6 overflow-visible py-4">
                  <div className="relative flex w-full flex-col items-center justify-center gap-4">
                    {[-1, 0, 1].map((offset) => {
                      // Calculate the index of the image to show at this position
                      // offset -1 = Top (Previous Image)
                      // offset 0 = Center (Current Image)
                      // offset 1 = Bottom (Next Image)
                      const imageIndex =
                        (activeIndex + offset + HERO_IMAGES.length) %
                        HERO_IMAGES.length;

                      // Determine styles based on offset
                      const isCenter = offset === 0;
                      const isTop = offset === -1;
                      const isBottom = offset === 1;

                      return (
                        <motion.div
                          key={`${offset}-${imageIndex}`} // Key ensures content updates
                          layout
                          initial={false}
                          animate={{
                            scale: isCenter ? 1 : 0.9,
                            opacity: isCenter ? 1 : 0.4,
                            y: 0,
                            zIndex: isCenter ? 10 : 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          }}
                          className={`relative aspect-16/6 w-full max-w-2xl overflow-hidden rounded-2xl border bg-white shadow-2xl dark:bg-zinc-900 ${
                            isCenter
                              ? "border-white/80 shadow-yellow-200/30 dark:border-zinc-800 dark:shadow-zinc-900/50"
                              : "border-zinc-200/50 dark:border-zinc-800"
                          } ${isTop ? "origin-bottom" : ""} ${
                            isBottom ? "origin-top" : ""
                          }`}
                        >
                          <Image
                            src={HERO_IMAGES[imageIndex]}
                            alt={`Slide ${imageIndex + 1}`}
                            fill
                            className="h-full w-full object-cover"
                            priority={isCenter}
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Decorative glow */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-yellow-200/40 via-amber-100/30 to-orange-100/40 blur-3xl dark:from-yellow-500/20 dark:via-amber-500/15 dark:to-orange-500/20" />
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

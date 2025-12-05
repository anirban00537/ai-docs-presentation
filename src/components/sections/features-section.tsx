"use client";

import { Variants } from "framer-motion";
import { Sparkles, Zap, Palette, Share2 } from "lucide-react";

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

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Creation",
    description:
      "Generate stunning presentations in seconds with our advanced AI. Just describe your idea and watch it come to life.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Create professional presentations faster than ever. Our optimized engine ensures buttery-smooth performance.",
  },
  {
    icon: Palette,
    title: "Beautiful Designs",
    description:
      "Choose from hundreds of professionally designed templates. Customize colors, fonts, and layouts effortlessly.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description:
      "Share your presentations instantly. Collaborate with your team in real-time and present anywhere.",
  },
];

export function FeaturesSection() {
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
            Everything you need to create
            <br className="hidden sm:block" />
            amazing presentations
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Powerful features designed to make presentation creation effortless
            and enjoyable.
          </p>
        </AnimatedGroup>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedGroup
                key={index}
                variants={transitionVariants}
                className="group relative"
              >
                <div className="relative rounded-2xl border border-white/80 bg-white/60 p-8 shadow-lg shadow-primary/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-primary/10 dark:hover:shadow-primary/20">
                  <div className="mb-4 inline-flex rounded-xl bg-primary/20 p-3 dark:bg-primary/20">
                    <Icon className="h-6 w-6 text-primary dark:text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </AnimatedGroup>
            );
          })}
        </div>
      </div>
    </section>
  );
}


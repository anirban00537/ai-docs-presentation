"use client";

import { Variants } from "framer-motion";
import { Quote } from "lucide-react";

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

const testimonials = [
  {
    quote:
      "Butterfast has completely transformed how I create presentations. What used to take hours now takes minutes, and they look absolutely stunning.",
    author: "Sarah Chen",
    role: "Marketing Director",
    company: "TechCorp",
  },
  {
    quote:
      "The AI is incredibly smart and the designs are beautiful. My team loves how easy it is to collaborate and share presentations.",
    author: "Michael Rodriguez",
    role: "Product Manager",
    company: "StartupXYZ",
  },
  {
    quote:
      "I've tried many presentation tools, but nothing comes close to the smooth experience Butterfast provides. It truly feels as smooth as butter!",
    author: "Emily Johnson",
    role: "Creative Director",
    company: "DesignStudio",
  },
];

export function TestimonialsSection() {
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
            Loved by creators worldwide
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            See what our users are saying about their experience with
            Butterfast.
          </p>
        </AnimatedGroup>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <AnimatedGroup
              key={index}
              variants={transitionVariants}
              className="group"
            >
              <div className="relative rounded-2xl border border-white/80 bg-white/60 p-8 shadow-lg shadow-primary/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-primary/10 dark:hover:shadow-primary/20">
                <div className="mb-4 inline-flex rounded-xl bg-primary/20 p-2 dark:bg-primary/20">
                  <Quote className="h-5 w-5 text-primary dark:text-primary" />
                </div>
                <p className="text-lg text-zinc-700 dark:text-zinc-300">
                  "{testimonial.quote}"
                </p>
                <div className="mt-6 border-t border-zinc-200/50 pt-6 dark:border-zinc-800">
                  <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                    {testimonial.author}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </AnimatedGroup>
          ))}
        </div>
      </div>
    </section>
  );
}

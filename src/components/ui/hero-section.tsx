"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconPlayerPlay } from "@tabler/icons-react";

export default function HeroSection() {
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative pt-28 pb-20 overflow-hidden min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-secondary/20 via-white to-primary/5 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-secondary/10 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-blob" />
        <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-primary/5 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] bg-pink-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-noise opacity-[0.03]" />
      </div>

      <div className="container relative z-10 px-4 flex flex-col items-center">
        {/* Headline Section */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-secondary/20 shadow-sm mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-foreground/70">
              AI-Powered Design v2.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-foreground leading-[1] mb-6"
          >
            Ideas to{" "}
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
              Cards
            </span>{" "}
            <br />
            in Seconds.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Butterfast transforms your prompts into stunning, professional
            docs. No design skills needed. Just pure storytelling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/home">
              <Button
                size="lg"
                className="h-14 px-10 rounded-full text-lg bg-primary text-white hover:bg-primary/90 shadow-coral-glow hover:scale-105 transition-all duration-300"
              >
                <IconSparkles className="mr-2 h-5 w-5" />
                Start Creating Free
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              className="h-14 px-8 rounded-full text-lg hover:bg-black/5"
            >
              <IconPlayerPlay className="mr-2 h-5 w-5 fill-current" />
              See how it works
            </Button>
          </motion.div>
        </div>

        {/* Video Preview */}
        <motion.div
          className="relative w-full max-w-6xl h-[450px] md:h-[500px] flex items-center justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <div className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden shadow-[0_25px_80px_-15px_rgba(0,0,0,0.3)] ring-4 ring-white/80">
            {!videoError ? (
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/XifgHi9R5Rc?autoplay=1&mute=1&loop=1&playlist=XifgHi9R5Rc&controls=1&rel=0"
                title="Demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onError={() => setVideoError(true)}
              />
            ) : (
              <Image
                src="/demo.png"
                alt="Demo preview"
                fill
                className="object-cover"
                priority
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { IconLayoutDashboard, IconWand, IconDownload, IconPalette, IconTypography } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "AI Layout Engine",
    description: "Our intelligence engine analyzes your content structure and automatically selects the perfect layout for every slide, instantly.",
    icon: <IconLayoutDashboard className="w-8 h-8 text-primary/80" />,
    className: "md:col-span-2 md:row-span-2 bg-gradient-to-br from-white via-secondary/10 to-white border-secondary/20",
    large: true,
  },
  {
    title: "Smart Reformatting",
    description: "Paste a blog post or a document, and watch it transform into a deck.",
    icon: <IconWand className="w-6 h-6 text-primary/60" />,
    className: "bg-white border-secondary/20 shadow-sm",
  },
  {
    title: "Export Anywhere",
    description: "Download as PDF, PowerPoint, or share a live web link.",
    icon: <IconDownload className="w-6 h-6 text-primary/60" />,
    className: "bg-white border-secondary/20 shadow-sm",
  },
  {
    title: "Brand Consistency",
    description: "Your fonts, your colors, your logo. Applied automatically to every single slide generated.",
    icon: <IconPalette className="w-6 h-6 text-primary/60" />,
    className: "md:row-span-2 bg-primary/5 border-primary/10",
  },
  {
    title: "Cinematic Typography",
    description: "We use editorial-grade font pairings to make your text readable and beautiful.",
    icon: <IconTypography className="w-6 h-6 text-primary/60" />,
    className: "bg-white border-secondary/20 shadow-sm",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-gradient-to-b from-primary/5 via-white to-secondary/10 py-32 relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-secondary/20 shadow-sm mb-6"
          >
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-xs font-bold tracking-widest uppercase text-foreground/70">
                  Powerful Features
              </span>
          </motion.div>
          <h2 className="font-serif text-5xl md:text-7xl text-foreground mb-6 tracking-tight leading-[1.1]">
            Everything you need, <br />
            <span className="italic text-primary/80">nothing you don't.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A complete suite of tools designed to make you a better storyteller, without the learning curve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={cn(
                "group relative overflow-hidden rounded-3xl p-8 flex flex-col justify-between border transition-all duration-300 hover:shadow-depth-2",
                feature.className
              )}
            >
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className={cn("font-serif text-xl mb-2 text-foreground", feature.large && "text-3xl")}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </div>

              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

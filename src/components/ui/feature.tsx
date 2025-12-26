"use client";

import { IconLayoutDashboard, IconWand, IconDownload, IconPalette, IconTypography, IconCheck } from "@tabler/icons-react";

const features = [
  {
    title: "AI Layout Engine",
    description: "Our intelligence engine analyzes your content structure and automatically selects the perfect layout for every slide, instantly.",
    icon: <IconLayoutDashboard className="w-6 h-6 text-primary" />,
  },
  {
    title: "Smart Reformatting",
    description: "Paste a blog post or a document, and watch it transform into a professional slide deck in seconds.",
    icon: <IconWand className="w-6 h-6 text-primary" />,
  },
  {
    title: "Export Anywhere",
    description: "Download your presentations as PDF, PowerPoint, or share a live web link with your audience.",
    icon: <IconDownload className="w-6 h-6 text-primary" />,
  },
  {
    title: "Brand Consistency",
    description: "Your fonts, your colors, and your logo applied automatically to every single slide you generate.",
    icon: <IconPalette className="w-6 h-6 text-primary" />,
  },
  {
    title: "Cinematic Typography",
    description: "We use editorial-grade font pairings to make your text readable, beautiful, and emotionally resonant.",
    icon: <IconTypography className="w-6 h-6 text-primary" />,
  },
  {
    title: "Auto-Styling",
    description: "Our engine handles colors and contrast automatically, ensuring your content always looks its best.",
    icon: <IconCheck className="w-6 h-6 text-primary" />,
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-white" id="features">
      {/* Background Subtle Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section - Inspired by PricingSection */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-secondary/20 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-primary/70"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-foreground/70">
              Powerful Capabilities
            </span>
          </div>
          <h2 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-tight leading-[1.1]">
            Everything you need, <br />
            <span className="italic text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-500">nothing you don't.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A complete suite of storytelling tools designed to eliminate the friction between your ideas and a finished presentation.
          </p>
        </div>

        {/* Features Grid - Clean & Minimal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 rounded-3xl bg-white border border-secondary/20 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:bg-gradient-to-b hover:from-white hover:to-primary/5"
            >
              <div className="mb-6 inline-flex p-3 rounded-2xl bg-secondary/10 group-hover:bg-primary/10 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-3 font-medium">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

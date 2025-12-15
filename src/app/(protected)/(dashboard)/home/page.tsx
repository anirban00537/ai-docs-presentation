"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import {
  IconPresentation,
  IconBulb,
  IconChartBar,
  IconUsers,
} from "@tabler/icons-react";

// Quick start suggestion cards
const suggestions = [
  {
    icon: IconBulb,
    title: "Startup Pitch",
    description: "Create a compelling investor pitch deck",
    prompt: "Create a startup pitch deck for a SaaS product that helps businesses automate their workflows",
    color: "#8B5CF6", // Purple
  },
  {
    icon: IconChartBar,
    title: "Quarterly Report",
    description: "Present your business metrics",
    prompt: "Create a quarterly business review presentation with key metrics and growth analysis",
    color: "#3B82F6", // Blue
  },
  {
    icon: IconUsers,
    title: "Team Introduction",
    description: "Introduce your team members",
    prompt: "Create a team introduction presentation showcasing our talented team members and their roles",
    color: "#10B981", // Green
  },
  {
    icon: IconPresentation,
    title: "Product Launch",
    description: "Launch your new product",
    prompt: "Create a product launch presentation for a mobile app with features and benefits",
    color: "#F59E0B", // Amber
  },
];

const SuggestionCard: React.FC<{
  suggestion: typeof suggestions[0];
  index: number;
  onClick: (prompt: string) => void;
}> = ({ suggestion, index, onClick }) => {
  const Icon = suggestion.icon;
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      whileHover={{ scale: 1.02, y: -6 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(suggestion.prompt)}
      className="group relative flex flex-col items-start gap-3 p-5 rounded-2xl text-left transition-all duration-300 overflow-hidden"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.35)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow: `
          0 1px 0 0 rgba(255, 255, 255, 1) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
          1px 0 0 0 rgba(255, 255, 255, 0.8) inset,
          -1px 0 0 0 rgba(0, 0, 0, 0.03) inset,
          0 8px 32px rgba(0, 0, 0, 0.08),
          0 2px 8px rgba(0, 0, 0, 0.04)
        `,
      }}
    >
      {/* Glass shine overlay */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.2) 100%)",
        }}
      />
      
      {/* Colored glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${suggestion.color}25 0%, transparent 70%)`,
        }}
      />

      <div 
        className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        style={{
          backgroundColor: `${suggestion.color}15`,
          boxShadow: `
            0 1px 0 0 rgba(255, 255, 255, 0.8) inset,
            0 4px 12px ${suggestion.color}15
          `,
        }}
      >
        <Icon size={22} style={{ color: suggestion.color }} />
      </div>
      <div className="relative">
        <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-foreground transition-colors">
          {suggestion.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {suggestion.description}
        </p>
      </div>
    </motion.button>
  );
};

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState("");

  const handleSuggestionClick = (prompt: string) => {
    setPromptValue(prompt);
    const textarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = prompt;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
    }
  };

  return (
    <div 
      className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]  overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #fdfbfb 0%, #f8f9ff 50%, #f5f7ff 100%)",
      }}
    >
      {/* === LIGHT PASTEL GRADIENT BACKGROUND === */}
      
      {/* Soft lavender blob - Top Left */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "70vw",
          height: "60vh",
          top: "-20%",
          left: "-20%",
          background: "radial-gradient(circle at center, rgba(196, 181, 253, 0.6) 0%, rgba(196, 181, 253, 0.25) 40%, transparent 70%)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />
      
      {/* Soft sky blue blob - Top Right */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "60vw",
          height: "55vh",
          top: "-15%",
          right: "-15%",
          background: "radial-gradient(circle at center, rgba(147, 197, 253, 0.55) 0%, rgba(147, 197, 253, 0.2) 50%, transparent 70%)",
          filter: "blur(90px)",
          zIndex: 0,
        }}
      />
      
      {/* Soft rose blob - Left */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "50vw",
          height: "60vh",
          top: "20%",
          left: "-15%",
          background: "radial-gradient(ellipse at center, rgba(251, 207, 232, 0.6) 0%, rgba(251, 207, 232, 0.2) 50%, transparent 70%)",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      />
      
      {/* Soft mint blob - Right */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "55vw",
          height: "55vh",
          top: "30%",
          right: "-10%",
          background: "radial-gradient(ellipse at center, rgba(167, 243, 208, 0.5) 0%, rgba(167, 243, 208, 0.15) 50%, transparent 70%)",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      />
      
      {/* Soft peach blob - Bottom Left */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "60vw",
          height: "50vh",
          bottom: "-15%",
          left: "-10%",
          background: "radial-gradient(circle at center, rgba(254, 215, 170, 0.55) 0%, rgba(254, 215, 170, 0.15) 50%, transparent 70%)",
          filter: "blur(90px)",
          zIndex: 0,
        }}
      />
      
      {/* Soft lilac blob - Bottom Right */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "55vw",
          height: "50vh",
          bottom: "-20%",
          right: "-15%",
          background: "radial-gradient(circle at center, rgba(221, 214, 254, 0.6) 0%, rgba(196, 181, 253, 0.2) 50%, transparent 70%)",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      />
      
      {/* Center soft glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "50vw",
          height: "50vh",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div className="relative w-full max-w-3xl flex flex-col gap-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-foreground mb-3">
            What would you like to create?
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            Describe your presentation idea and let AI craft beautiful slides for you in seconds.
          </p>
        </motion.div>

        {/* Prompt Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative w-full"
        >
          <PromptBox
            name="message"
            onError={(errorMessage) => setError(errorMessage)}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Quick Start Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-5"
        >
          <p className="text-xs font-medium text-muted-foreground text-center uppercase tracking-widest">
            Quick Start Ideas
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={suggestion.title}
                suggestion={suggestion}
                index={index}
                onClick={handleSuggestionClick}
              />
            ))}
          </div>
        </motion.div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground/60 text-center"
        >
          Press{" "}
          <kbd 
            className="px-2 py-1 rounded-lg text-[10px] font-mono mx-0.5 bg-muted text-muted-foreground"
          >
            ⌘
          </kbd>
          +
          <kbd 
            className="px-2 py-1 rounded-lg text-[10px] font-mono mx-0.5 bg-muted text-muted-foreground"
          >
            Enter
          </kbd>
          {" "}to submit
        </motion.p>
      </div>
    </div>
  );
}

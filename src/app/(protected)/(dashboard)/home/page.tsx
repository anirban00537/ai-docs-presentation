"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { cn } from "@/lib/utils";
import {
  IconRobot,
  IconRocket,
  IconLeaf,
  IconBooks,
} from "@tabler/icons-react";

// Quick start suggestion cards
const suggestions = [
  {
    icon: IconRobot,
    title: "AI Revolution",
    description: "How AI is transforming industries",
    prompt: "Create a presentation about how artificial intelligence is revolutionizing healthcare, education, and creative industries",
    color: "bg-chart-1", 
    iconColor: "text-chart-1",
  },
  {
    icon: IconRocket,
    title: "Space Exploration",
    description: "Journey through the cosmos",
    prompt: "Create a presentation about recent breakthroughs in space exploration, Mars missions, and the future of interstellar travel",
    color: "bg-chart-2",
    iconColor: "text-chart-2",
  },
  {
    icon: IconLeaf,
    title: "Climate Solutions",
    description: "Saving our planet",
    prompt: "Create a presentation about innovative climate change solutions, renewable energy technologies, and sustainable living practices",
    color: "bg-chart-3",
    iconColor: "text-chart-3",
  },
  {
    icon: IconBooks,
    title: "Ancient Wonders",
    description: "Mysteries of history",
    prompt: "Create a presentation about the Seven Wonders of the Ancient World, their construction, and their historical significance",
    color: "bg-chart-4",
    iconColor: "text-chart-4",
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
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(suggestion.prompt)}
      className="group relative flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden bg-white/40 hover:bg-white border border-secondary/20 hover:border-primary/20 hover:shadow-depth-3"
    >
      <div 
        className={cn(
          "relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 bg-secondary/20",
          suggestion.iconColor
        )}
      >
        <Icon size={20} className="opacity-80 group-hover:opacity-100" />
      </div>
      <div className="relative min-w-0 flex-1">
        <h3 className="text-sm font-serif font-bold text-foreground group-hover:text-primary transition-colors truncate mb-0.5">
          {suggestion.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate opacity-80 group-hover:opacity-100">
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
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden px-4 bg-gradient-to-b from-primary/5 via-white to-secondary/10">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30 pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30 pointer-events-none translate-y-1/2" />

      {/* Content */}
      <div className="relative w-full max-w-4xl flex flex-col gap-12 z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
            What would you like to <span className="text-primary/80 font-normal italic">build</span> today?
          </h1>
          
        </motion.div>

        {/* Prompt Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative w-full max-w-2xl mx-auto"
        >
          <PromptBox
            name="message"
            defaultValue={promptValue}
            onError={(errorMessage) => setError(errorMessage)}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500 text-center font-medium"
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
          className="space-y-6"
        >
          <p className="text-xs font-bold text-muted-foreground/60 text-center uppercase tracking-widest">
            Quick Start Ideas
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          className="text-xs text-muted-foreground/60 text-center font-medium"
        >
          Press{" "}
          <kbd 
            className="px-2 py-1 rounded-lg text-[10px] font-mono mx-0.5 bg-white border border-secondary/20 shadow-sm text-secondary-foreground"
          >
            ⌘
          </kbd>
          +
          <kbd 
            className="px-2 py-1 rounded-lg text-[10px] font-mono mx-0.5 bg-white border border-secondary/20 shadow-sm text-secondary-foreground"
          >
            Enter
          </kbd>
          {" "}to submit
        </motion.p>
      </div>
    </div>
  );
}

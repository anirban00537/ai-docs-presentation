"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import {
  IconSparkles,
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
  },
  {
    icon: IconChartBar,
    title: "Quarterly Report",
    description: "Present your business metrics",
    prompt: "Create a quarterly business review presentation with key metrics and growth analysis",
  },
  {
    icon: IconUsers,
    title: "Team Introduction",
    description: "Introduce your team members",
    prompt: "Create a team introduction presentation showcasing our talented team members and their roles",
  },
  {
    icon: IconPresentation,
    title: "Product Launch",
    description: "Launch your new product",
    prompt: "Create a product launch presentation for a mobile app with features and benefits",
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
      transition={{ delay: 0.2 + index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(suggestion.prompt)}
      className="group flex flex-col items-start gap-3 p-5 rounded-2xl bg-card border border-border text-left transition-all duration-300 hover:shadow-lg hover:border-primary/30"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
        <Icon size={20} className="text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
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
    // Focus the prompt box
    const textarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = prompt;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12 px-6">
      <div className="w-full max-w-3xl flex flex-col gap-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
          >
            <IconSparkles size={32} className="text-primary" />
          </motion.div>
          
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
          className="w-full"
        >
          <PromptBox
            name="message"
            onError={(errorMessage) => setError(errorMessage)}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
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
          className="space-y-4"
        >
          <p className="text-xs font-medium text-muted-foreground text-center uppercase tracking-wider">
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
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">Enter</kbd> to submit
        </motion.p>
      </div>
    </div>
  );
}

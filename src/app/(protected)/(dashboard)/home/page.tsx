"use client";

import * as React from "react";
import {
  Plus,
  Settings2,
  Send,
  Mic,
  X,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppleButton } from "@/components/editor/apple-button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4">
      <div className="w-full max-w-3xl space-y-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent pb-2">
          What presentation do you want to create?
        </h1>
        
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <div className="relative flex items-center bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10 transition-all focus-within:ring-primary/50 focus-within:border-primary/50">
            <textarea
              placeholder="Describe your presentation idea... (e.g., 'A pitch deck for a new AI startup')"
              className="w-full min-h-[80px] p-6 bg-transparent border-none outline-none resize-none text-lg placeholder:text-muted-foreground/50"
            />
            <div className="pr-4 pt-2 self-start md:self-center md:pt-0">
              <button className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed group/btn">
                <Sparkles className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-muted/50 border border-border/50 hover:bg-muted transition-colors cursor-pointer">
            Pitch Deck
          </span>
          <span className="px-3 py-1 rounded-full bg-muted/50 border border-border/50 hover:bg-muted transition-colors cursor-pointer">
            Marketing Strategy
          </span>
          <span className="px-3 py-1 rounded-full bg-muted/50 border border-border/50 hover:bg-muted transition-colors cursor-pointer">
            Quarterly Review
          </span>
        </div>
      </div>
    </div>
  );
}

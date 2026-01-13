"use client";

import React from "react";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PromptBox } from "@/components/ui/prompt-input";

interface OutlineHeaderProps {
  prompt: string;
  onRegenerate: (prompt: string, numberOfCards: number) => void;
}

export const OutlineHeader: React.FC<OutlineHeaderProps> = ({ 
  prompt, 
  onRegenerate 
}) => {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
             <Link href="/home">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <IconArrowLeft size={16} /> Back
                </Button>
             </Link>
             <h1 className="text-xl font-bold font-serif text-primary">Generate</h1>
             <div className="w-[70px]" /> {/* Spacer for centering */}
        </div>

        {/* Prompt Input Area */}
        <div className="bg-white/80 border border-secondary/10 rounded-[24px] shadow-sm p-4">
            <PromptBox 
                defaultValue={prompt} 
                onSubmit={onRegenerate}
                className="border-none shadow-none bg-transparent"
            />
        </div>
    </div>
  );
};

import React, { useCallback, memo } from "react";
import type { Block, Theme } from "@/types/presentation";
import { type CodeTerminalContent } from "@/types/presentation"; // code-terminal";

interface CodeTerminalBlockProps {
  block: Block;
  onUpdate: (content: CodeTerminalContent) => void;
  theme: Theme;
}

import { CommonCard } from "../CommonCard";

export const CodeTerminalBlock = memo(function CodeTerminalBlock({
  block,
  onUpdate,
  theme,
}: CodeTerminalBlockProps) {
  const content = block.content as CodeTerminalContent;

  const handleCommandChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ ...content, command: e.target.value });
    },
    [content, onUpdate]
  );

  const handleOutputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({ ...content, output: e.target.value });
    },
    [content, onUpdate]
  );

  return (
    <CommonCard
      theme={theme}
      className="flex flex-col w-full h-full overflow-hidden border-none transition-all duration-300 hover:shadow-2xl"
      style={{
        backgroundColor: "#08080a",
        color: "#e5e7eb",
        borderRadius: "24px"
      }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-bottom border-white/5 relative overflow-hidden">
        {/* Minimal Gradient Background Blob */}
        <div
          className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-[0.05] blur-xl pointer-events-none"
          style={{ backgroundColor: theme.primary }}
        />

        <div className="flex items-center gap-2 relative z-10">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-inner" />
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 font-sans relative z-10">
          Terminal
        </div>
        <div className="w-12" /> {/* Spacer to balance dots */}
      </div>

      {/* Terminal Body */}
      <div className="p-8 flex flex-col gap-4 relative flex-1 min-h-[200px]">
        {/* Command line */}
        <div className="flex items-center gap-3 relative z-10">
          <span
            className="select-none font-black text-base"
            style={{ color: theme.primary }}
          >
            $
          </span>
          <input
            value={content.command}
            onChange={handleCommandChange}
            className="flex-1 bg-transparent border-none outline-none font-mono text-base text-[#e5e7eb] placeholder-white/20"
            placeholder="npm install package"
            spellCheck={false}
          />
        </div>
        
        {/* Output */}
        <textarea
          value={content.output}
          onChange={handleOutputChange}
          className="w-full bg-transparent border-none outline-none font-mono text-sm text-white/40 resize-none placeholder-white/10 leading-relaxed flex-1"
          placeholder="Command output..."
          spellCheck={false}
          style={{ minHeight: "100px" }}
        />
      </div>
    </CommonCard>
  );
});

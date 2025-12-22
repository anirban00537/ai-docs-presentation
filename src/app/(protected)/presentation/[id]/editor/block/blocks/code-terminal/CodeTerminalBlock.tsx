import React, { useCallback } from "react";
import type { Block, Theme } from "@/types/presentation";
import { type CodeTerminalContent } from "@/types/presentation"; // code-terminal";

interface CodeTerminalBlockProps {
  block: Block;
  onUpdate: (content: CodeTerminalContent) => void;
  theme: Theme;
}

import { CommonCard } from "../CommonCard";

export const CodeTerminalBlock: React.FC<CodeTerminalBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
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
      className="flex flex-col w-full h-full overflow-hidden font-mono text-sm p-0 border-none"
      style={{
        backgroundColor: "#0d0d0d",
        color: "#e5e7eb",
      }}
    >
      {/* Terminal Header - Minimal */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 text-center text-[10px] text-gray-500 font-sans uppercase tracking-wider">
          terminal
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Command line */}
        <div className="flex items-center gap-2">
          <span
            className="select-none font-bold text-sm"
            style={{ color: theme.primary }}
          >
            $
          </span>
          <input
            value={content.command}
            onChange={handleCommandChange}
            className="flex-1 bg-transparent border-none outline-none font-mono text-[#e5e7eb] placeholder-gray-600"
            placeholder="npm install package"
            spellCheck={false}
          />
        </div>
        
        {/* Output */}
        <textarea
          value={content.output}
          onChange={handleOutputChange}
          rows={3}
          className="w-full bg-transparent border-none outline-none font-mono text-[#888] resize-none placeholder-gray-700 leading-relaxed"
          placeholder="Command output..."
          spellCheck={false}
        />
      </div>
    </CommonCard>
  );
};

import React, { useCallback } from "react";
import type { Block, Theme } from "@/lib/editor/types";
import { type CodeTerminalContent } from "../definitions/code-terminal";
import { withAlpha } from "../utils";

interface CodeTerminalBlockProps {
  block: Block;
  onUpdate: (content: CodeTerminalContent) => void;
  theme: Theme;
}

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
    <div
      className="flex flex-col w-full h-full rounded-lg overflow-hidden font-mono text-sm overflow-y-auto custom-scrollbar custom-scrollbar-dark"
      style={{
        backgroundColor: "#1e1e1e", // Terminal bg always darker
        color: "#e5e7eb",
        border: `1px solid ${withAlpha(theme.primary, 0.15)}`,
      }}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#2d2d2d] border-b border-[#3e3e3e] shrink-0">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <div className="flex-1 text-center text-xs text-gray-500 font-sans opacity-60">
          terminal
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 flex flex-col gap-2 relative">
        <div className="flex items-center gap-2 text-[#4ade80]">
          <span className="select-none font-bold">$</span>
          <input
            value={content.command}
            onChange={handleCommandChange}
            className="flex-1 bg-transparent border-none outline-none font-mono text-[#e5e7eb] placeholder-gray-600"
            placeholder="npm install package"
            spellCheck={false}
          />
        </div>
        <textarea
          value={content.output}
          onChange={handleOutputChange}
          rows={3}
          className="w-full bg-transparent border-none outline-none font-mono text-[#9ca3af] resize-none placeholder-gray-700"
          placeholder="Command output..."
          spellCheck={false}
        />
      </div>
    </div>
  );
};

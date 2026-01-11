import React from "react";
import { cn } from "@/lib/utils";
import { SlashCommand, SLASH_COMMANDS } from "./commands";

interface SlashMenuProps {
  open: boolean;
  query: string;
  position: { top: number; left: number };
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  open,
  query,
  position,
  selectedIndex,
  onSelect,
}) => {
  const filteredCommands = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  if (!open || filteredCommands.length === 0) return null;

  return (
    <div
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[220px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: position.top + 10,
        left: Math.max(0, position.left),
      }}
    >
      <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
        Blocks
      </div>
      {filteredCommands.map((cmd, index) => (
        <button
          key={cmd.id}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(cmd);
          }}
          className={cn(
            "w-full px-3 py-2 flex items-center gap-3 text-left transition-colors",
            index === selectedIndex
              ? "bg-blue-50 text-blue-700"
              : "hover:bg-gray-50 text-gray-700"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
            {cmd.icon}
          </div>
          <div>
            <div className="font-medium text-sm">{cmd.label}</div>
            <div className="text-xs text-gray-400">{cmd.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
};


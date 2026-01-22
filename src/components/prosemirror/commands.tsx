import React from "react";

// --- Slash Command Types ---
export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  nodeType: string;
  attrs?: Record<string, any>;
}

// --- Slash Commands Definition ---
export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "heading1",
    label: "Heading 1",
    description: "Large heading",
    icon: <span className="font-bold text-lg">H1</span>,
    nodeType: "heading",
    attrs: { level: 1 },
  },
  {
    id: "heading2",
    label: "Heading 2",
    description: "Medium heading",
    icon: <span className="font-bold text-base">H2</span>,
    nodeType: "heading",
    attrs: { level: 2 },
  },
  {
    id: "heading3",
    label: "Heading 3",
    description: "Small heading",
    icon: <span className="font-bold text-sm">H3</span>,
    nodeType: "heading",
    attrs: { level: 3 },
  },
  {
    id: "heading4",
    label: "Heading 4",
    description: "Extra small heading",
    icon: <span className="font-bold text-xs">H4</span>,
    nodeType: "heading",
    attrs: { level: 4 },
  },
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Plain text block",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="15" y2="18" />
      </svg>
    ),
    nodeType: "paragraph",
  },
  {
    id: "bullet_list",
    label: "Bullet List",
    description: "Unordered list with bullets",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="4" cy="6" r="2" fill="currentColor" />
        <line x1="9" y1="6" x2="21" y2="6" />
        <circle cx="4" cy="12" r="2" fill="currentColor" />
        <line x1="9" y1="12" x2="21" y2="12" />
        <circle cx="4" cy="18" r="2" fill="currentColor" />
        <line x1="9" y1="18" x2="21" y2="18" />
      </svg>
    ),
    nodeType: "bullet_list",
  },
  {
    id: "ordered_list",
    label: "Numbered List",
    description: "Ordered list with numbers",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <text x="2" y="8" fontSize="8" fill="currentColor" stroke="none">1.</text>
        <line x1="9" y1="6" x2="21" y2="6" />
        <text x="2" y="14" fontSize="8" fill="currentColor" stroke="none">2.</text>
        <line x1="9" y1="12" x2="21" y2="12" />
        <text x="2" y="20" fontSize="8" fill="currentColor" stroke="none">3.</text>
        <line x1="9" y1="18" x2="21" y2="18" />
      </svg>
    ),
    nodeType: "ordered_list",
  },
  {
    id: "blockquote",
    label: "Quote",
    description: "Blockquote for citations",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
      </svg>
    ),
    nodeType: "blockquote",
  },
  {
    id: "code_block",
    label: "Code Block",
    description: "Code snippet with syntax",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="16,18 22,12 16,6" />
        <polyline points="8,6 2,12 8,18" />
      </svg>
    ),
    nodeType: "code_block",
  },
];

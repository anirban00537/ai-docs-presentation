import React from "react";
import { EditorView } from "prosemirror-view";
import { toggleMark } from "prosemirror-commands";
import { cn } from "@/lib/utils";
import { schema } from "./schema";

interface SelectionToolbarProps {
  visible: boolean;
  position: { top: number; left: number };
  activeMarks: Set<string>;
  view: EditorView | null;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  visible,
  position,
  activeMarks,
  view,
}) => {
  if (!visible || !view) return null;

  return (
    <div
      className="absolute z-50 bg-gray-900 rounded-lg shadow-xl py-1 px-1 flex items-center gap-0.5"
      style={{
        top: position.top - 45,
        left: Math.max(0, position.left),
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Bold */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(schema.marks.strong)(view.state, view.dispatch);
          view.focus();
        }}
        className={cn(
          "w-8 h-8 rounded flex items-center justify-center transition-colors",
          activeMarks.has("strong")
            ? "bg-white/20 text-white"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        )}
        title="Bold (Cmd+B)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </button>

      {/* Italic */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(schema.marks.em)(view.state, view.dispatch);
          view.focus();
        }}
        className={cn(
          "w-8 h-8 rounded flex items-center justify-center transition-colors",
          activeMarks.has("em")
            ? "bg-white/20 text-white"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        )}
        title="Italic (Cmd+I)"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="19" y1="4" x2="10" y2="4" />
          <line x1="14" y1="20" x2="5" y2="20" />
          <line x1="15" y1="4" x2="9" y2="20" />
        </svg>
      </button>

      {/* Separator */}
      <div className="w-px h-5 bg-gray-600 mx-1" />

      {/* Code */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(schema.marks.code)(view.state, view.dispatch);
          view.focus();
        }}
        className={cn(
          "w-8 h-8 rounded flex items-center justify-center transition-colors",
          activeMarks.has("code")
            ? "bg-white/20 text-white"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        )}
        title="Code"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="16,18 22,12 16,6" />
          <polyline points="8,6 2,12 8,18" />
        </svg>
      </button>

      {/* Link */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(schema.marks.link, { href: "" })(view.state, view.dispatch);
          view.focus();
        }}
        className={cn(
          "w-8 h-8 rounded flex items-center justify-center transition-colors",
          activeMarks.has("link")
            ? "bg-white/20 text-white"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        )}
        title="Link"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
    </div>
  );
};


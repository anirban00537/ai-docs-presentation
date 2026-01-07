import React, { useEffect, useRef } from "react";
import { EditorView } from "prosemirror-view";
import { toggleMark, setBlockType } from "prosemirror-commands";
import { cn } from "@/lib/utils";
import { schema } from "./schema";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectionToolbarProps {
  visible: boolean;
  position: { top: number; left: number };
  activeMarks: Set<string>;
  activeAlignment?: string;
  view: EditorView | null;
  onClose?: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  visible,
  position,
  activeMarks,
  activeAlignment = "left",
  view,
  onClose,
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;

  // Handle outside click to close toolbar
  useEffect(() => {
    if (!visible || !onClose) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if target is inside a portal (like SelectContent)
      const isPortal = (target as HTMLElement).closest?.('[data-radix-portal]') || 
                      (target as HTMLElement).closest?.('[role="listbox"]') ||
                      (target as HTMLElement).closest?.('[role="option"]');

      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(target) &&
        !view?.dom.contains(target) &&
        !isPortal
      ) {
        onClose();
      }
    };

    // Use a small delay to avoid immediate closing when clicking to show toolbar
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose, view]);

  if (!visible || !view) return null;

  const isDark = theme.themeType === "dark";

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[100] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.24)] py-1 px-1.5 flex items-center gap-1 border animate-in fade-in zoom-in duration-150"
      style={{
        top: Math.max(10, position.top - 50),
        left: Math.max(10, position.left),
        backgroundColor: isDark 
          ? "rgba(30, 30, 45, 0.7)" 
          : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        color: theme.bodyColor,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Block Type Helper - Shadcn Select */}
      {(() => {
        const { state } = view;
        const { $from } = state.selection;
        const parent = $from.parent;
        const isHeading = parent.type === schema.nodes.heading;
        const currentLevel = isHeading ? parent.attrs.level : null;

        let currentValue = "p";
        if (isHeading) currentValue = `h${currentLevel}`;

        const handleTypeChange = (value: string) => {
          const { state, dispatch } = view;
          const { $from } = state.selection;
          const parentNode = $from.parent;
          const textAlign = parentNode.attrs.textAlign || "left";

          if (value === "p") {
            setBlockType(schema.nodes.paragraph, { textAlign })(state, dispatch);
          } else {
            const level = parseInt(value.substring(1));
            setBlockType(schema.nodes.heading, { level, textAlign })(state, dispatch);
          }
          setTimeout(() => view.focus(), 10);
        };

        return (
          <>
            <div className="px-0.5 min-w-[90px]">
              <Select value={currentValue} onValueChange={handleTypeChange}>
                <SelectTrigger 
                  onMouseDown={(e) => e.stopPropagation()} 
                  className="h-8 border-none bg-transparent hover:bg-white/10 dark:hover:bg-black/10 text-[11px] font-semibold focus:ring-0 focus:ring-offset-0 gap-2 px-2.5 rounded-lg pointer-events-auto"
                  style={{ color: theme.primary }}
                >
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent 
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className="rounded-xl border shadow-2xl z-[110]"
                  style={{ 
                    backgroundColor: isDark ? "rgba(30, 30, 45, 0.95)" : "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(24px)",
                    color: theme.bodyColor,
                    borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <SelectItem value="p" className="text-[11px] font-medium cursor-pointer rounded-lg m-1">Normal Text</SelectItem>
                  <SelectItem value="h1" className="text-[11px] font-bold cursor-pointer rounded-lg m-1">Heading 1</SelectItem>
                  <SelectItem value="h2" className="text-[11px] font-bold cursor-pointer rounded-lg m-1">Heading 2</SelectItem>
                  <SelectItem value="h3" className="text-[11px] font-bold cursor-pointer rounded-lg m-1">Heading 3</SelectItem>
                  <SelectItem value="h4" className="text-[11px] font-bold cursor-pointer rounded-lg m-1">Heading 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-px h-5 mx-1" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
          </>
        );
      })()}

      <div className="flex items-center gap-0.5">
        {/* Bold */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(schema.marks.strong)(view.state, view.dispatch);
            view.focus();
          }}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          )}
          style={{
            backgroundColor: activeMarks.has("strong") ? `${theme.primary}20` : "transparent",
            color: activeMarks.has("strong") ? theme.primary : theme.bodyColor,
          }}
          title="Bold (Cmd+B)"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" strokeWidth="2.5" />
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" strokeWidth="2.5" />
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
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          )}
          style={{
            backgroundColor: activeMarks.has("em") ? `${theme.primary}20` : "transparent",
            color: activeMarks.has("em") ? theme.primary : theme.bodyColor,
          }}
          title="Italic (Cmd+I)"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="4" x2="10" y2="4" />
            <line x1="14" y1="20" x2="5" y2="20" />
            <line x1="15" y1="4" x2="9" y2="20" />
          </svg>
        </button>

        {/* Code */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(schema.marks.code)(view.state, view.dispatch);
            view.focus();
          }}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 text-[10px] font-mono"
          )}
          style={{
            backgroundColor: activeMarks.has("code") ? `${theme.primary}20` : "transparent",
            color: activeMarks.has("code") ? theme.primary : theme.bodyColor,
          }}
          title="In-line Code"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </button>
      </div>

      <div className="w-px h-5 mx-1" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />

      <div className="flex items-center gap-0.5">
        {[
          { id: "left", label: "Align Left", icon: <path d="M17 10H3M21 6H3M21 14H3M17 18H3" /> },
          { id: "center", label: "Align Center", icon: <path d="M18 10H6M21 6H3M21 14H3M18 18H6" /> },
          { id: "right", label: "Align Right", icon: <path d="M21 10H7M21 6H3M21 14H3M21 18H7" /> },
          { id: "justify", label: "Justify", icon: <path d="M21 10H3M21 6H3M21 14H3M21 18H3" /> },
        ].map((align) => (
          <button
            key={align.id}
            onMouseDown={(e) => {
              e.preventDefault();
              const { state, dispatch } = view;
              const { $from, from, to } = state.selection;
              let tr = state.tr;
              
              const updateNode = (node: any, pos: number) => {
                if (node.type.name === "paragraph" || node.type.name === "heading") {
                  tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, textAlign: align.id });
                }
              };

              if (from !== to) {
                state.doc.nodesBetween(from, to, updateNode);
              } else {
                updateNode($from.parent, $from.before($from.depth));
              }

              if (tr.docChanged) dispatch(tr);
              view.focus();
            }}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            )}
            style={{
              backgroundColor: activeAlignment === align.id ? `${theme.primary}20` : "transparent",
              color: activeAlignment === align.id ? theme.primary : theme.bodyColor,
            }}
            title={align.label}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {align.icon}
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

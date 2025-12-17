import React, { useEffect, useRef } from "react";
import { EditorView } from "prosemirror-view";
import { toggleMark } from "prosemirror-commands";
import { cn } from "@/lib/utils";
import { schema } from "./schema";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

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
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node) &&
        !view?.dom.contains(event.target as Node)
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

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 rounded-lg shadow-xl py-1 px-1 flex items-center gap-0.5"
      style={{
        top: position.top - 45,
        left: Math.max(0, position.left),
        backgroundColor: theme.cardBackground || "#1f2937",
        border: `1px solid ${theme.primary}20`,
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
          "w-8 h-8 rounded flex items-center justify-center transition-colors"
        )}
        style={{
          backgroundColor: activeMarks.has("strong")
            ? theme.primary + "30"
            : "transparent",
          color: activeMarks.has("strong") ? theme.primary : theme.bodyColor,
        }}
        onMouseEnter={(e) => {
          if (!activeMarks.has("strong")) {
            e.currentTarget.style.backgroundColor = theme.primary + "15";
          }
        }}
        onMouseLeave={(e) => {
          if (!activeMarks.has("strong")) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
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
          "w-8 h-8 rounded flex items-center justify-center transition-colors"
        )}
        style={{
          backgroundColor: activeMarks.has("em")
            ? theme.primary + "30"
            : "transparent",
          color: activeMarks.has("em") ? theme.primary : theme.bodyColor,
        }}
        onMouseEnter={(e) => {
          if (!activeMarks.has("em")) {
            e.currentTarget.style.backgroundColor = theme.primary + "15";
          }
        }}
        onMouseLeave={(e) => {
          if (!activeMarks.has("em")) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
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
      <div
        className="w-px h-5 mx-1"
        style={{ backgroundColor: theme.primary + "30" }}
      />

      {/* Code */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(schema.marks.code)(view.state, view.dispatch);
          view.focus();
        }}
        className={cn(
          "w-8 h-8 rounded flex items-center justify-center transition-colors"
        )}
        style={{
          backgroundColor: activeMarks.has("code")
            ? theme.primary + "30"
            : "transparent",
          color: activeMarks.has("code") ? theme.primary : theme.bodyColor,
        }}
        onMouseEnter={(e) => {
          if (!activeMarks.has("code")) {
            e.currentTarget.style.backgroundColor = theme.primary + "15";
          }
        }}
        onMouseLeave={(e) => {
          if (!activeMarks.has("code")) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
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
          toggleMark(schema.marks.link, { href: "" })(
            view.state,
            view.dispatch
          );
          view.focus();
        }}
        className={cn(
          "w-8 h-8 rounded flex items-center justify-center transition-colors"
        )}
        style={{
          backgroundColor: activeMarks.has("link")
            ? theme.primary + "30"
            : "transparent",
          color: activeMarks.has("link") ? theme.primary : theme.bodyColor,
        }}
        onMouseEnter={(e) => {
          if (!activeMarks.has("link")) {
            e.currentTarget.style.backgroundColor = theme.primary + "15";
          }
        }}
        onMouseLeave={(e) => {
          if (!activeMarks.has("link")) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
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

      {/* Separator */}
      <div
        className="w-px h-5 mx-1"
        style={{ backgroundColor: theme.primary + "30" }}
      />

      {/* Helper function to set alignment */}
      {(() => {
        const setAlignment = (
          alignment: "left" | "center" | "right" | "justify"
        ) => {
          const { state, dispatch } = view;
          const { $from, from, to } = state.selection;
          let tr = state.tr;

          // If there's a selection, apply to all affected nodes
          if (from !== to) {
            state.doc.nodesBetween(from, to, (node, pos) => {
              if (
                node.type.name === "paragraph" ||
                node.type.name.includes("heading")
              ) {
                tr = tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  textAlign: alignment,
                });
              }
            });
          } else {
            // No selection - apply to current block
            const node = $from.parent;
            if (
              node.type.name === "paragraph" ||
              node.type.name.includes("heading")
            ) {
              const pos = $from.before($from.depth);
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                textAlign: alignment,
              });
            }
          }

          if (tr.docChanged) dispatch(tr);
          view.focus();
        };

        return (
          <>
            {/* Align Left */}
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setAlignment("left");
              }}
              className={cn(
                "w-8 h-8 rounded flex items-center justify-center transition-colors"
              )}
              style={{
                backgroundColor:
                  activeAlignment === "left"
                    ? theme.primary + "30"
                    : "transparent",
                color:
                  activeAlignment === "left" ? theme.primary : theme.bodyColor,
              }}
              onMouseEnter={(e) => {
                if (activeAlignment !== "left") {
                  e.currentTarget.style.backgroundColor = theme.primary + "15";
                }
              }}
              onMouseLeave={(e) => {
                if (activeAlignment !== "left") {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
              title="Align Left"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="17" y1="10" x2="3" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="17" y1="18" x2="3" y2="18"></line>
              </svg>
            </button>

            {/* Align Center */}
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setAlignment("center");
              }}
              className={cn(
                "w-8 h-8 rounded flex items-center justify-center transition-colors"
              )}
              style={{
                backgroundColor:
                  activeAlignment === "center"
                    ? theme.primary + "30"
                    : "transparent",
                color:
                  activeAlignment === "center"
                    ? theme.primary
                    : theme.bodyColor,
              }}
              onMouseEnter={(e) => {
                if (activeAlignment !== "center") {
                  e.currentTarget.style.backgroundColor = theme.primary + "15";
                }
              }}
              onMouseLeave={(e) => {
                if (activeAlignment !== "center") {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
              title="Align Center"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="17" y1="10" x2="7" y2="10"></line>
                <line x1="19" y1="14" x2="5" y2="14"></line>
                <line x1="21" y1="18" x2="3" y2="18"></line>
              </svg>
            </button>

            {/* Align Right */}
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setAlignment("right");
              }}
              className={cn(
                "w-8 h-8 rounded flex items-center justify-center transition-colors"
              )}
              style={{
                backgroundColor:
                  activeAlignment === "right"
                    ? theme.primary + "30"
                    : "transparent",
                color:
                  activeAlignment === "right" ? theme.primary : theme.bodyColor,
              }}
              onMouseEnter={(e) => {
                if (activeAlignment !== "right") {
                  e.currentTarget.style.backgroundColor = theme.primary + "15";
                }
              }}
              onMouseLeave={(e) => {
                if (activeAlignment !== "right") {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
              title="Align Right"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="21" y1="10" x2="7" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="21" y1="18" x2="7" y2="18"></line>
              </svg>
            </button>

            {/* Align Justify */}
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setAlignment("justify");
              }}
              className={cn(
                "w-8 h-8 rounded flex items-center justify-center transition-colors"
              )}
              style={{
                backgroundColor:
                  activeAlignment === "justify"
                    ? theme.primary + "30"
                    : "transparent",
                color:
                  activeAlignment === "justify"
                    ? theme.primary
                    : theme.bodyColor,
              }}
              onMouseEnter={(e) => {
                if (activeAlignment !== "justify") {
                  e.currentTarget.style.backgroundColor = theme.primary + "15";
                }
              }}
              onMouseLeave={(e) => {
                if (activeAlignment !== "justify") {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
              title="Justify"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="10" x2="3" y2="10"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="21" y1="18" x2="3" y2="18"></line>
              </svg>
            </button>
          </>
        );
      })()}
    </div>
  );
};

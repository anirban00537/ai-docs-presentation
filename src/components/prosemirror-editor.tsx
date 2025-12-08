"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, Node as ProseMirrorNode } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, toggleMark } from "prosemirror-commands";
import {
  inputRules,
  wrappingInputRule,
  textblockTypeInputRule,
  InputRule,
} from "prosemirror-inputrules";
import {
  splitListItem,
  liftListItem,
  sinkListItem,
} from "prosemirror-schema-list";
import { cn } from "@/lib/utils";

// --- Custom Schema ---
const createSchema = () => {
  const nodes = addListNodes(
    basicSchema.spec.nodes,
    "paragraph block*",
    "block"
  );

  return new Schema({
    nodes: nodes
      .update("doc", {
        content: "block+",
      })
      .update("code_block", {
        ...basicSchema.spec.nodes.get("code_block"),
        toDOM: () => [
          "pre",
          { class: "bg-gray-100 rounded-lg p-3 font-mono text-sm" },
          ["code", 0],
        ],
      }),
    marks: basicSchema.spec.marks,
  });
};

const schema = createSchema();

// --- Slash Command Types ---
interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  nodeType: string;
  attrs?: Record<string, any>;
}

// --- Slash Commands Definition ---
const SLASH_COMMANDS: SlashCommand[] = [
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
    id: "paragraph",
    label: "Paragraph",
    description: "Plain text",
    icon: <span className="text-gray-500">¶</span>,
    nodeType: "paragraph",
  },
  {
    id: "bullet_list",
    label: "Bullet List",
    description: "Unordered list",
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
      </svg>
    ),
    nodeType: "bullet_list",
  },
  {
    id: "ordered_list",
    label: "Numbered List",
    description: "Ordered list",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <text x="2" y="8" fontSize="8" fill="currentColor" stroke="none">
          1.
        </text>
        <line x1="9" y1="6" x2="21" y2="6" />
        <text x="2" y="14" fontSize="8" fill="currentColor" stroke="none">
          2.
        </text>
        <line x1="9" y1="12" x2="21" y2="12" />
      </svg>
    ),
    nodeType: "ordered_list",
  },
  {
    id: "blockquote",
    label: "Quote",
    description: "Blockquote",
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
    description: "Code snippet",
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

// --- Input Rules ---
const createInputRules = (schema: Schema) => {
  const rules: InputRule[] = [];

  // Heading rules
  rules.push(
    textblockTypeInputRule(/^#\s$/, schema.nodes.heading, { level: 1 })
  );
  rules.push(
    textblockTypeInputRule(/^##\s$/, schema.nodes.heading, { level: 2 })
  );
  rules.push(
    textblockTypeInputRule(/^###\s$/, schema.nodes.heading, { level: 3 })
  );

  // Blockquote rule
  rules.push(wrappingInputRule(/^>\s$/, schema.nodes.blockquote));

  // List rules
  rules.push(wrappingInputRule(/^[-*]\s$/, schema.nodes.bullet_list));
  rules.push(
    wrappingInputRule(
      /^(\d+)\.\s$/,
      schema.nodes.ordered_list,
      (match) => ({ order: +match[1] }),
      (match, node) => node.childCount + node.attrs.order === +match[1]
    )
  );

  // Code block rule
  rules.push(textblockTypeInputRule(/^```$/, schema.nodes.code_block));

  return inputRules({ rules });
};

// --- Main Editor Component ---
type ProseMirrorEditorProps = {
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  blockId?: string;
};

export const ProseMirrorEditor: React.FC<ProseMirrorEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  className,
  placeholder = "Type '/' for commands...",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const isInternalChangeRef = useRef(false); // Track if change is from editor itself

  // Slash menu state
  const [menuState, setMenuState] = useState<{
    open: boolean;
    query: string;
    position: { top: number; left: number };
    selectedIndex: number;
  }>({
    open: false,
    query: "",
    position: { top: 0, left: 0 },
    selectedIndex: 0,
  });

  // Selection toolbar state
  const [selectionToolbar, setSelectionToolbar] = useState<{
    visible: boolean;
    position: { top: number; left: number };
    activeMarks: Set<string>;
  }>({
    visible: false,
    position: { top: 0, left: 0 },
    activeMarks: new Set(),
  });

  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync external value changes to ProseMirror editor
  useEffect(() => {
    if (!viewRef.current) return;
    if (isInternalChangeRef.current) {
      // This change came from the editor itself, skip syncing
      isInternalChangeRef.current = false;
      return;
    }

    // External value change (e.g., from Redux after block swap)
    if (value && typeof value === "object" && value.type === "doc") {
      try {
        const newDoc = ProseMirrorNode.fromJSON(schema, value);
        const currentDoc = viewRef.current.state.doc;

        // Only update if content is actually different
        // Use eq() which compares document structure, not just references
        if (!currentDoc.eq(newDoc)) {
          // Additional check: compare JSON to ensure content really changed
          const currentJSON = currentDoc.toJSON();
          const newJSON = newDoc.toJSON();
          const contentChanged =
            JSON.stringify(currentJSON) !== JSON.stringify(newJSON);

          if (contentChanged) {
            const newState = EditorState.create({
              doc: newDoc,
              plugins: viewRef.current.state.plugins,
            });
            viewRef.current.updateState(newState);
          }
        }
      } catch (error) {
        // Invalid JSON, ignore
        console.warn("ProseMirror sync error:", error);
      }
    }
  }, [value]);

  // Parse initial value to ProseMirror doc
  const initialDoc = useMemo(() => {
    if (value && typeof value === "object" && value.type === "doc") {
      try {
        return ProseMirrorNode.fromJSON(schema, value);
      } catch {
        // Invalid JSON, create empty doc
      }
    }
    return schema.node("doc", null, [schema.node("paragraph")]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get filtered commands
  const filteredCommands = useMemo(
    () =>
      SLASH_COMMANDS.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(menuState.query.toLowerCase()) ||
          cmd.description.toLowerCase().includes(menuState.query.toLowerCase())
      ),
    [menuState.query]
  );

  // Execute a slash command
  const executeCommand = useCallback((command: SlashCommand) => {
    const view = viewRef.current;
    if (!view) return;

    console.log("Executing command:", command.label);

    const { state, dispatch } = view;
    const { $from } = state.selection;

    // First, delete the "/" and any query text
    const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
    const slashMatch = textBefore.match(/(^|\s)\/([^\s]*)$/);

    let tr = state.tr;

    if (slashMatch) {
      const slashAndQuery = "/" + (slashMatch[2] || "");
      const deleteFrom = $from.pos - slashAndQuery.length;
      const deleteTo = $from.pos;
      tr = tr.delete(deleteFrom, deleteTo);
    }

    // Get the node type from schema
    const nodeType = schema.nodes[command.nodeType];
    if (!nodeType) {
      console.error("Unknown node type:", command.nodeType);
      return;
    }

    // For list types, we need to wrap in list
    if (
      command.nodeType === "bullet_list" ||
      command.nodeType === "ordered_list"
    ) {
      // Apply the delete first
      dispatch(tr);

      // Close menu
      setMenuState((prev) => ({
        ...prev,
        open: false,
        query: "",
        selectedIndex: 0,
      }));

      // Create a list wrapper
      setTimeout(() => {
        if (viewRef.current) {
          const v = viewRef.current;
          const { $from: newFrom } = v.state.selection;
          const start = newFrom.before(newFrom.depth);
          const end = newFrom.after(newFrom.depth);

          const listItem = schema.nodes.list_item.create(
            null,
            schema.nodes.paragraph.create()
          );
          const list = nodeType.create(null, listItem);

          const newTr = v.state.tr.replaceWith(start, end, list);
          v.dispatch(newTr);
          v.focus();
        }
      }, 0);
      return;
    }

    // For blockquote
    if (command.nodeType === "blockquote") {
      dispatch(tr);
      setMenuState((prev) => ({
        ...prev,
        open: false,
        query: "",
        selectedIndex: 0,
      }));

      setTimeout(() => {
        if (viewRef.current) {
          const v = viewRef.current;
          const { $from: newFrom } = v.state.selection;
          const start = newFrom.before(newFrom.depth);
          const end = newFrom.after(newFrom.depth);

          const paragraph = schema.nodes.paragraph.create();
          const blockquote = nodeType.create(null, paragraph);

          const newTr = v.state.tr.replaceWith(start, end, blockquote);
          v.dispatch(newTr);
          v.focus();
        }
      }, 0);
      return;
    }

    // For simple block types (heading, paragraph, code_block)
    // Use setNodeMarkup to change the block type in place
    const pos = $from.before($from.depth);
    const mappedPos = tr.mapping.map(pos);

    tr = tr.setNodeMarkup(mappedPos, nodeType, command.attrs);
    dispatch(tr);

    // Close menu
    setMenuState((prev) => ({
      ...prev,
      open: false,
      query: "",
      selectedIndex: 0,
    }));

    view.focus();
  }, []);

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    const plugins = [
      history(),
      keymap({ "Mod-z": undo, "Mod-y": redo, "Mod-Shift-z": redo }),
      keymap({
        Enter: splitListItem(schema.nodes.list_item),
        "Mod-[": liftListItem(schema.nodes.list_item),
        "Mod-]": sinkListItem(schema.nodes.list_item),
      }),
      keymap(baseKeymap),
      createInputRules(schema),
    ];

    const state = EditorState.create({
      doc: initialDoc,
      plugins,
    });

    // We need to track menu state in a ref for the handleKeyDown
    let isMenuOpen = false;
    let currentQuery = "";
    let currentSelectedIndex = 0;

    const view = new EditorView(editorRef.current, {
      state,
      editable: () => !readOnly,
      dispatchTransaction(transaction: Transaction) {
        console.log(
          "dispatchTransaction called, docChanged:",
          transaction.docChanged
        );

        const newState = view.state.apply(transaction);
        view.updateState(newState);

        // Track selection for toolbar
        const { from, to, empty } = newState.selection;
        if (!empty && to - from > 0) {
          // There's a text selection - show toolbar
          try {
            const coords = view.coordsAtPos(from);
            const editorRect = editorRef.current?.getBoundingClientRect();
            if (editorRect) {
              // Get active marks at selection
              const activeMarks = new Set<string>();
              const storedMarks =
                newState.storedMarks || newState.selection.$from.marks();
              storedMarks.forEach((mark) => activeMarks.add(mark.type.name));

              setSelectionToolbar({
                visible: true,
                position: {
                  top: coords.top - editorRect.top,
                  left:
                    coords.left - editorRect.left + (to - from > 10 ? 50 : 0),
                },
                activeMarks,
              });
            }
          } catch {
            // Position calculation failed, hide toolbar
            setSelectionToolbar((prev) => ({ ...prev, visible: false }));
          }
        } else {
          // No selection - hide toolbar
          setSelectionToolbar((prev) => ({ ...prev, visible: false }));
        }

        if (transaction.docChanged) {
          const json = newState.doc.toJSON();
          isInternalChangeRef.current = true; // Mark as internal change
          onChangeRef.current(json);

          // Check for slash command trigger
          const { $from } = newState.selection;
          const textBefore = $from.parent.textContent.slice(
            0,
            $from.parentOffset
          );

          console.log(
            "textBefore:",
            textBefore,
            "parentOffset:",
            $from.parentOffset
          );

          const slashMatch = textBefore.match(/(^|\s)\/([^\s]*)$/);
          console.log("slashMatch:", slashMatch);

          if (slashMatch) {
            const query = slashMatch[2] || "";

            if (!isMenuOpen) {
              console.log("Opening menu, query:", query);
              // Opening menu for the first time
              try {
                const coords = view.coordsAtPos($from.pos);
                const editorRect = editorRef.current?.getBoundingClientRect();
                if (editorRect) {
                  isMenuOpen = true;
                  currentQuery = query;
                  currentSelectedIndex = 0;
                  setMenuState({
                    open: true,
                    query,
                    position: {
                      top: coords.bottom - editorRect.top,
                      left: coords.left - editorRect.left,
                    },
                    selectedIndex: 0,
                  });
                }
              } catch {
                console.error("Failed to get coords");
              }
            } else {
              // Menu already open, update query
              if (query !== currentQuery) {
                currentQuery = query;
                currentSelectedIndex = 0;
                setMenuState((prev) => ({ ...prev, query, selectedIndex: 0 }));
              }
            }
          } else if (isMenuOpen) {
            console.log("Closing menu - no slash found");
            // No slash pattern found, close menu
            isMenuOpen = false;
            currentQuery = "";
            currentSelectedIndex = 0;
            setMenuState((prev) => ({
              ...prev,
              open: false,
              query: "",
              selectedIndex: 0,
            }));
          }
        }
      },
      handleKeyDown: (view, event) => {
        // Handle slash menu keyboard navigation
        if (isMenuOpen) {
          const filtered = SLASH_COMMANDS.filter(
            (cmd) =>
              cmd.label.toLowerCase().includes(currentQuery.toLowerCase()) ||
              cmd.description.toLowerCase().includes(currentQuery.toLowerCase())
          );

          if (event.key === "ArrowDown") {
            event.preventDefault();
            currentSelectedIndex = Math.min(
              currentSelectedIndex + 1,
              filtered.length - 1
            );
            setMenuState((prev) => ({
              ...prev,
              selectedIndex: currentSelectedIndex,
            }));
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            currentSelectedIndex = Math.max(currentSelectedIndex - 1, 0);
            setMenuState((prev) => ({
              ...prev,
              selectedIndex: currentSelectedIndex,
            }));
            return true;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            const cmd = filtered[currentSelectedIndex];
            if (cmd) {
              isMenuOpen = false;
              executeCommand(cmd);
            }
            return true;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            isMenuOpen = false;
            currentQuery = "";
            currentSelectedIndex = 0;
            setMenuState((prev) => ({
              ...prev,
              open: false,
              query: "",
              selectedIndex: 0,
            }));
            return true;
          }
        }
        return false;
      },
      attributes: {
        class: "outline-none min-h-[40px]",
        "data-placeholder": placeholder,
      },
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [initialDoc, readOnly, placeholder, executeCommand]);

  // Handle menu item click
  const handleMenuClick = useCallback(
    (command: SlashCommand) => {
      executeCommand(command);
    },
    [executeCommand]
  );

  return (
    <div className={cn("relative w-full", className)}>
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 40px;
          width: 100%;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 0.5rem;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.25;
          margin-bottom: 0.5rem;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.3;
          margin-bottom: 0.5rem;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror ul {
          list-style: disc;
        }
        .ProseMirror ol {
          list-style: decimal;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #6b7280;
          font-style: italic;
        }
        .ProseMirror pre {
          background: #f3f4f6;
          border-radius: 0.5rem;
          padding: 0.75rem;
          font-family: monospace;
          font-size: 0.875rem;
          overflow-x: auto;
        }
        .ProseMirror code {
          background: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        .ProseMirror p:empty::before,
        .ProseMirror h1:empty::before,
        .ProseMirror h2:empty::before,
        .ProseMirror h3:empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
      <div
        ref={editorRef}
        className="w-full break-words whitespace-pre-wrap"
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
      />
      {menuState.open && filteredCommands.length > 0 && (
        <div
          className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[220px] overflow-hidden"
          style={{
            top: menuState.position.top + 24,
            left: Math.max(0, menuState.position.left),
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
                handleMenuClick(cmd);
              }}
              className={cn(
                "w-full px-3 py-2 flex items-center gap-3 text-left transition-colors",
                index === menuState.selectedIndex
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
      )}

      {/* Selection Toolbar */}
      {selectionToolbar.visible && (
        <div
          className="absolute z-50 bg-gray-900 rounded-lg shadow-xl py-1 px-1 flex items-center gap-0.5"
          style={{
            top: selectionToolbar.position.top - 45,
            left: Math.max(0, selectionToolbar.position.left),
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Bold */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              if (viewRef.current) {
                toggleMark(schema.marks.strong)(
                  viewRef.current.state,
                  viewRef.current.dispatch
                );
                viewRef.current.focus();
              }
            }}
            className={cn(
              "w-8 h-8 rounded flex items-center justify-center transition-colors",
              selectionToolbar.activeMarks.has("strong")
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
              if (viewRef.current) {
                toggleMark(schema.marks.em)(
                  viewRef.current.state,
                  viewRef.current.dispatch
                );
                viewRef.current.focus();
              }
            }}
            className={cn(
              "w-8 h-8 rounded flex items-center justify-center transition-colors",
              selectionToolbar.activeMarks.has("em")
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
              if (viewRef.current) {
                toggleMark(schema.marks.code)(
                  viewRef.current.state,
                  viewRef.current.dispatch
                );
                viewRef.current.focus();
              }
            }}
            className={cn(
              "w-8 h-8 rounded flex items-center justify-center transition-colors",
              selectionToolbar.activeMarks.has("code")
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
              if (viewRef.current) {
                toggleMark(schema.marks.link, { href: "" })(
                  viewRef.current.state,
                  viewRef.current.dispatch
                );
                viewRef.current.focus();
              }
            }}
            className={cn(
              "w-8 h-8 rounded flex items-center justify-center transition-colors",
              selectionToolbar.activeMarks.has("link")
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
      )}
    </div>
  );
};

export default ProseMirrorEditor;

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
import { baseKeymap, setBlockType } from "prosemirror-commands";
import {
  inputRules,
  wrappingInputRule,
  textblockTypeInputRule,
  InputRule,
} from "prosemirror-inputrules";
import { wrapInList, splitListItem, liftListItem, sinkListItem } from "prosemirror-schema-list";
import { cn } from "@/lib/utils";

// --- Custom Schema ---
const createSchema = () => {
  const nodes = addListNodes(
    basicSchema.spec.nodes,
    "paragraph block*",
    "block"
  );

  return new Schema({
    nodes: nodes.update("doc", {
      content: "block+",
    }).update("code_block", {
      ...basicSchema.spec.nodes.get("code_block"),
      toDOM: () => ["pre", { class: "bg-gray-100 rounded-lg p-3 font-mono text-sm" }, ["code", 0]],
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
  action: (view: EditorView) => void;
}

// --- Slash Commands ---
const getSlashCommands = (): SlashCommand[] => [
  {
    id: "heading1",
    label: "Heading 1",
    description: "Large heading",
    icon: <span className="font-bold text-lg">H1</span>,
    action: (view) => {
      setBlockType(schema.nodes.heading, { level: 1 })(view.state, view.dispatch);
    },
  },
  {
    id: "heading2",
    label: "Heading 2",
    description: "Medium heading",
    icon: <span className="font-bold text-base">H2</span>,
    action: (view) => {
      setBlockType(schema.nodes.heading, { level: 2 })(view.state, view.dispatch);
    },
  },
  {
    id: "heading3",
    label: "Heading 3",
    description: "Small heading",
    icon: <span className="font-bold text-sm">H3</span>,
    action: (view) => {
      setBlockType(schema.nodes.heading, { level: 3 })(view.state, view.dispatch);
    },
  },
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Plain text",
    icon: <span className="text-gray-500">¶</span>,
    action: (view) => {
      setBlockType(schema.nodes.paragraph)(view.state, view.dispatch);
    },
  },
  {
    id: "bullet_list",
    label: "Bullet List",
    description: "Unordered list",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="4" cy="6" r="2" fill="currentColor" />
        <line x1="9" y1="6" x2="21" y2="6" />
        <circle cx="4" cy="12" r="2" fill="currentColor" />
        <line x1="9" y1="12" x2="21" y2="12" />
        <circle cx="4" cy="18" r="2" fill="currentColor" />
        <line x1="9" y1="18" x2="21" y2="18" />
      </svg>
    ),
    action: (view) => {
      wrapInList(schema.nodes.bullet_list)(view.state, view.dispatch);
    },
  },
  {
    id: "ordered_list",
    label: "Numbered List",
    description: "Ordered list",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <text x="2" y="8" fontSize="8" fill="currentColor" stroke="none">1.</text>
        <line x1="9" y1="6" x2="21" y2="6" />
        <text x="2" y="14" fontSize="8" fill="currentColor" stroke="none">2.</text>
        <line x1="9" y1="12" x2="21" y2="12" />
        <text x="2" y="20" fontSize="8" fill="currentColor" stroke="none">3.</text>
        <line x1="9" y1="18" x2="21" y2="18" />
      </svg>
    ),
    action: (view) => {
      wrapInList(schema.nodes.ordered_list)(view.state, view.dispatch);
    },
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
    action: (view) => {
      const { $from, to } = view.state.selection;
      const blockquote = schema.nodes.blockquote;
      const paragraph = schema.nodes.paragraph;
      
      const tr = view.state.tr.replaceRangeWith(
        $from.before(),
        to,
        blockquote.create(null, paragraph.create())
      );
      view.dispatch(tr);
    },
  },
  {
    id: "code_block",
    label: "Code Block",
    description: "Code snippet",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16,18 22,12 16,6" />
        <polyline points="8,6 2,12 8,18" />
      </svg>
    ),
    action: (view) => {
      setBlockType(schema.nodes.code_block)(view.state, view.dispatch);
    },
  },
];

// --- Input Rules ---
const createInputRules = (schema: Schema) => {
  const rules: InputRule[] = [];

  // Heading rules
  rules.push(textblockTypeInputRule(/^#\s$/, schema.nodes.heading, { level: 1 }));
  rules.push(textblockTypeInputRule(/^##\s$/, schema.nodes.heading, { level: 2 }));
  rules.push(textblockTypeInputRule(/^###\s$/, schema.nodes.heading, { level: 3 }));

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

// --- Slash Command Menu Component ---
interface SlashMenuProps {
  commands: SlashCommand[];
  selectedIndex: number;
  query: string;
  position: { top: number; left: number };
  onSelect: (command: SlashCommand) => void;
}

const SlashMenu: React.FC<SlashMenuProps> = ({ commands, selectedIndex, query, position, onSelect }) => {
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  if (filteredCommands.length === 0) return null;

  return (
    <div
      className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[220px] overflow-hidden"
      style={{ top: position.top + 24, left: Math.max(0, position.left) }}
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
  
  // Slash menu state - using refs to avoid re-render issues in callbacks
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const menuOpenRef = useRef(menuOpen);
  const menuQueryRef = useRef(menuQuery);
  const selectedIndexRef = useRef(selectedIndex);
  
  useEffect(() => { menuOpenRef.current = menuOpen; }, [menuOpen]);
  useEffect(() => { menuQueryRef.current = menuQuery; }, [menuQuery]);
  useEffect(() => { selectedIndexRef.current = selectedIndex; }, [selectedIndex]);

  const commands = useMemo(() => getSlashCommands(), []);
  
  const filteredCommands = useMemo(() => 
    commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(menuQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(menuQuery.toLowerCase())
    ),
    [commands, menuQuery]
  );

  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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

  // Execute a slash command
  const executeCommand = useCallback((command: SlashCommand) => {
    const view = viewRef.current;
    if (!view) return;

    // Find and delete the "/" and query from the document
    const { $from } = view.state.selection;
    const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
    const slashMatch = textBefore.match(/(^|\s)\/([^\s]*)$/);
    
    if (slashMatch) {
      const slashAndQuery = "/" + (slashMatch[2] || "");
      const deleteLength = slashAndQuery.length;
      const deleteFrom = $from.pos - deleteLength;
      const deleteTo = $from.pos;
      
      // Delete the slash+query
      const tr = view.state.tr.delete(deleteFrom, deleteTo);
      view.dispatch(tr);
    }
    
    // Close menu
    setMenuOpen(false);
    setMenuQuery("");
    setSelectedIndex(0);
    
    // Execute command synchronously - view.state is now updated after dispatch
    // Use a microtask to ensure React state updates are processed
    Promise.resolve().then(() => {
      if (viewRef.current) {
        const v = viewRef.current;
        v.focus();
        // Now execute the command on the fresh state
        command.action(v);
      }
    });
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

    const view = new EditorView(editorRef.current, {
      state,
      editable: () => !readOnly,
      dispatchTransaction(transaction: Transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        
        if (transaction.docChanged) {
          const json = newState.doc.toJSON();
          onChangeRef.current(json);
          
          // Check for slash command trigger
          const { $from } = newState.selection;
          const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
          
          // Check if we have a slash trigger pattern
          const slashMatch = textBefore.match(/(^|\s)\/([^\s]*)$/);
          
          if (slashMatch) {
            const query = slashMatch[2] || "";
            
            if (!menuOpenRef.current) {
              // Opening menu for the first time
              try {
                const coords = view.coordsAtPos($from.pos);
                const editorRect = editorRef.current?.getBoundingClientRect();
                if (editorRect) {
                  setMenuPosition({
                    top: coords.bottom - editorRect.top,
                    left: coords.left - editorRect.left,
                  });
                }
              } catch {
                // coords might fail if position is invalid
              }
              setMenuQuery(query);
              setSelectedIndex(0);
              setMenuOpen(true);
            } else {
              // Menu already open, update query
              if (query !== menuQueryRef.current) {
                setMenuQuery(query);
                setSelectedIndex(0);
              }
            }
          } else if (menuOpenRef.current) {
            // No slash pattern found, close menu
            setMenuOpen(false);
            setMenuQuery("");
            setSelectedIndex(0);
          }
        }
      },
      handleKeyDown: (view, event) => {
        // Handle slash menu keyboard navigation
        if (menuOpenRef.current) {
          const currentCommands = getSlashCommands();
          const query = menuQueryRef.current;
          const filtered = currentCommands.filter(
            (cmd) =>
              cmd.label.toLowerCase().includes(query.toLowerCase()) ||
              cmd.description.toLowerCase().includes(query.toLowerCase())
          );
          
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
            return true;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            const cmd = filtered[selectedIndexRef.current];
            if (cmd) {
              executeCommand(cmd);
            }
            return true;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setMenuOpen(false);
            setMenuQuery("");
            setSelectedIndex(0);
            return true;
          }
          if (event.key === "Backspace") {
            // Check if we're about to delete the slash
            const { $from } = view.state.selection;
            const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
            if (textBefore === "/") {
              // Will delete the slash, close menu after allowing the deletion
              setTimeout(() => {
                setMenuOpen(false);
                setMenuQuery("");
                setSelectedIndex(0);
              }, 0);
            }
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

  return (
    <div className={cn("relative", className)}>
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 40px;
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
      {menuOpen && (
        <SlashMenu
          commands={commands}
          selectedIndex={selectedIndex}
          query={menuQuery}
          position={menuPosition}
          onSelect={executeCommand}
        />
      )}
    </div>
  );
};

export default ProseMirrorEditor;

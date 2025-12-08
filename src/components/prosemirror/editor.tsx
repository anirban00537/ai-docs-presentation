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
import { Node as ProseMirrorNode } from "prosemirror-model";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import {
  splitListItem,
  liftListItem,
  sinkListItem,
} from "prosemirror-schema-list";
import { cn } from "@/lib/utils";
import { schema } from "./schema";
import { createInputRules } from "./input-rules";
import { SlashCommand, SLASH_COMMANDS } from "./commands";
import { SlashMenu } from "./slash-menu";
import { SelectionToolbar } from "./selection-toolbar";
import { PROSEMIRROR_STYLES } from "./styles";

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
    activeAlignment: string;
  }>({
    visible: false,
    position: { top: 0, left: 0 },
    activeMarks: new Set(),
    activeAlignment: "left",
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

              // Get active alignment
              const { $from } = newState.selection;
              const node = $from.parent;
              const activeAlignment = node.attrs.textAlign || "left";

              setSelectionToolbar({
                visible: true,
                position: {
                  top: coords.top - editorRect.top,
                  left:
                    coords.left - editorRect.left + (to - from > 10 ? 50 : 0),
                },
                activeMarks,
                activeAlignment,
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
      <style>{PROSEMIRROR_STYLES}</style>
      <div
        ref={editorRef}
        className="w-full break-words whitespace-pre-wrap"
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
      />
      <SlashMenu
        open={menuState.open}
        query={menuState.query}
        position={menuState.position}
        selectedIndex={menuState.selectedIndex}
        onSelect={handleMenuClick}
      />
      <SelectionToolbar
        visible={selectionToolbar.visible}
        position={selectionToolbar.position}
        activeMarks={selectionToolbar.activeMarks}
        activeAlignment={selectionToolbar.activeAlignment}
        view={viewRef.current}
      />
    </div>
  );
};

export default ProseMirrorEditor;

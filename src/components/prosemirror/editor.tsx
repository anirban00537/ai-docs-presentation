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
import { placeholderPlugin } from "./plugins/placeholder-plugin";
import { ImageUrlModal } from "./plugins/image-plugin";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { getFontFamily } from "@/lib/fonts";

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
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;

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

  // Image modal state
  const [imageModal, setImageModal] = useState<{
    open: boolean;
    nodePos: number | null;
    currentSrc: string;
  }>({
    open: false,
    nodePos: null,
    currentSrc: "",
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

    // For image - insert as atom node only (user clicks below to add text)
    if (command.nodeType === "image") {
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

          // Create image node with empty src (placeholder state)
          const imageNode = nodeType.create({ src: "", alt: "", title: "" });

          // Insert only the image - user can click below to add more content
          const newTr = v.state.tr.replaceWith(start, end, imageNode);
          v.dispatch(newTr);
          v.focus();
        }
      }, 0);
      return;
    }

    // For simple block types (heading, paragraph, code_block)
    // Check if we're inside a list_item - if so, we need to replace it instead of using setNodeMarkup
    const currentNode = $from.node($from.depth);
    const isInListItem = currentNode.type.name === "list_item";

    if (isInListItem) {
      // We're inside a list item, need to replace it with the new block type
      dispatch(tr);

      setTimeout(() => {
        if (viewRef.current) {
          const v = viewRef.current;
          const { $from: newFrom } = v.state.selection;
          const start = newFrom.before(newFrom.depth);
          const end = newFrom.after(newFrom.depth);

          // Get the text content from the list item
          const textContent = currentNode.textContent;

          // Create the new node with the text content
          const newNode = nodeType.create(
            command.attrs || {},
            textContent ? schema.text(textContent) : undefined
          );

          const newTr = v.state.tr.replaceWith(start, end, newNode);
          v.dispatch(newTr);
          v.focus();
        }
      }, 0);

      // Close menu
      setMenuState((prev) => ({
        ...prev,
        open: false,
        query: "",
        selectedIndex: 0,
      }));
      return;
    }

    // Use setNodeMarkup to change the block type in place (when not in list)
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
      placeholderPlugin,
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
      nodeViews: {
        image(node, view, getPos) {
          const dom = document.createElement("div");
          dom.className = "prosemirror-image-wrapper my-2";
          dom.contentEditable = "false";

          const { src, alt } = node.attrs;

          // Content container for image/placeholder
          const contentContainer = document.createElement("div");

          if (src) {
            // Render image
            const figure = document.createElement("figure");
            figure.className =
              "prosemirror-image relative cursor-pointer group rounded-lg overflow-hidden";
            const img = document.createElement("img");
            img.src = src;
            img.alt = alt || "";
            img.className =
              "w-full h-auto max-h-[500px] object-contain rounded-lg transition-all duration-200 group-hover:opacity-90";
            img.onerror = () => {
              figure.innerHTML = `
                <div class="flex flex-col items-center justify-center gap-2 p-6 border border-red-200 rounded-xl bg-red-50/50">
                  <span class="text-red-400">Failed to load image</span>
                  <span class="text-xs text-red-400">Click to update URL</span>
                </div>
              `;
            };
            figure.appendChild(img);

            // Hover overlay
            const overlay = document.createElement("div");
            overlay.className =
              "absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors";
            overlay.innerHTML = `<span class="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-white/90 rounded-full text-sm font-medium text-gray-700 shadow-sm">Click to edit</span>`;
            figure.appendChild(overlay);

            contentContainer.appendChild(figure);
          } else {
            // Render placeholder
            const placeholderEl = document.createElement("div");
            placeholderEl.className =
              "flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 hover:border-gray-400 cursor-pointer transition-all duration-200";
            placeholderEl.innerHTML = `
              <div class="p-4 rounded-full bg-gray-200/80">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21,15 16,10 5,21" />
                </svg>
              </div>
              <div class="text-center">
                <p class="text-sm font-medium text-gray-600">Click to add an image</p>
                <p class="text-xs text-gray-400 mt-1">Enter a URL to display an image</p>
              </div>
            `;
            contentContainer.appendChild(placeholderEl);
          }

          dom.appendChild(contentContainer);

          // Click handler for image/placeholder to open modal
          contentContainer.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const pos = typeof getPos === "function" ? getPos() : undefined;
            if (pos !== undefined) {
              setImageModal({
                open: true,
                nodePos: pos,
                currentSrc: src || "",
              });
            }
          });

          return {
            dom,
            ignoreMutation: () => true,
            stopEvent: () => true,
          };
        },
      },
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [initialDoc, readOnly, placeholder, executeCommand, theme]);

  // Handle menu item click
  const handleMenuClick = useCallback(
    (command: SlashCommand) => {
      executeCommand(command);
    },
    [executeCommand]
  );

  // Handle image URL submission
  const handleImageUrlSubmit = useCallback(
    (url: string) => {
      const view = viewRef.current;
      if (!view || imageModal.nodePos === null) return;

      const { state, dispatch } = view;
      const tr = state.tr.setNodeMarkup(imageModal.nodePos, undefined, {
        src: url,
        alt: "",
        title: "",
      });
      dispatch(tr);

      setImageModal({
        open: false,
        nodePos: null,
        currentSrc: "",
      });
    },
    [imageModal.nodePos]
  );

  // Handle image modal close
  const handleImageModalClose = useCallback(() => {
    setImageModal({
      open: false,
      nodePos: null,
      currentSrc: "",
    });
  }, []);

  // Generate dynamic styles based on theme
  const dynamicStyles = useMemo(() => {
    const fontFamily = getFontFamily(theme.fontFamily || "Inter");
    return `
      ${PROSEMIRROR_STYLES}
      .ProseMirror {
        color: ${theme.bodyColor};
        font-family: ${fontFamily};
      }
      .ProseMirror h1,
      .ProseMirror h2,
      .ProseMirror h3,
      .ProseMirror h4 {
        color: ${theme.headingColor};
      }
      .ProseMirror p.is-empty::before,
      .ProseMirror h1.is-empty::before,
      .ProseMirror h2.is-empty::before,
      .ProseMirror h3.is-empty::before,
      .ProseMirror h4.is-empty::before {
        color: ${theme.bodyColor}80;
      }
      /* Image bottom cursor blinking animation */
      @keyframes image-cursor-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      .image-bottom-cursor {
        animation: image-cursor-blink 1s step-end infinite;
      }
      /* Image bottom area hover effect */
      .prosemirror-image-wrapper .group:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }
    `;
  }, [theme]);

  return (
    <div className={cn("relative w-full", className)}>
      <style>{dynamicStyles}</style>
      <div
        ref={editorRef}
        className="w-full wrap-break-word whitespace-pre-wrap"
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
      <ImageUrlModal
        open={imageModal.open}
        onClose={handleImageModalClose}
        onSubmit={handleImageUrlSubmit}
        initialUrl={imageModal.currentSrc}
      />
    </div>
  );
};

export default ProseMirrorEditor;

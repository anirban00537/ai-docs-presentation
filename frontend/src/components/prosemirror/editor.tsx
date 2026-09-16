"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import { createPortal } from "react-dom";
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
import { defaultMarkdownParser } from "prosemirror-markdown";
import { cn } from "@/lib/utils";
import { schema } from "./schema";
import { createInputRules } from "./input-rules";
import { SlashCommand, SLASH_COMMANDS } from "./commands";
import { SlashMenu } from "./slash-menu";
import { SelectionToolbar } from "./selection-toolbar";
import { injectBaseStyles } from "./styles";
import { createPlaceholderPlugin } from "./plugins/placeholder-plugin";
import { useAppSelector } from "@/store/hooks";
import {
  selectTheme,
  DEFAULT_THEME,
  type Theme,
} from "@/store/slices/cardsSlice";
import { getFontFamily } from "@/lib/fonts";


// Legacy ProseMirrorDocument type (for backward compatibility)
interface LegacyProseMirrorDocument {
  type: "doc";
  content: any[];
}

// --- Main Editor Component ---
type ProseMirrorEditorProps = {
  value: string | LegacyProseMirrorDocument | any; // Accept both Markdown string and legacy JSON
  onChange: (value: any) => void;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  blockId?: string;
  /** Optional theme prop. If not provided, falls back to Redux store theme */
  theme?: Theme | (Theme & { bodyColor?: string });
};

// Helper to parse markdown syntax in text and convert to marks
const parseMarkdownInText = (text: string): Array<{ text: string; marks?: any[] }> => {
  const segments: Array<{ text: string; marks?: any[] }> = [];
  let currentPos = 0;
  
  // Regex to match **bold** or *italic*
  const markdownRegex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let match;
  
  while ((match = markdownRegex.exec(text)) !== null) {
    // Add text before the match (if any)
    if (match.index > currentPos) {
      segments.push({ text: text.substring(currentPos, match.index) });
    }
    
    // Add the matched text with appropriate mark
    if (match[1]) {
      // **bold**
      segments.push({ 
        text: match[2], 
        marks: [{ type: 'strong' }] 
      });
    } else if (match[3]) {
      // *italic*
      segments.push({ 
        text: match[4], 
        marks: [{ type: 'em' }] 
      });
    }
    
    currentPos = match.index + match[0].length;
  }
  
  // Add remaining text (if any)
  if (currentPos < text.length) {
    segments.push({ text: text.substring(currentPos) });
  }
  
  return segments.length > 0 ? segments : [{ text }];
};

// Helper to normalize JSON structure (fix legacy types, case issues, and markdown syntax)
const normalizeProseMirrorJSON = (json: any): any => {
  if (!json || typeof json !== 'object') return json;
  
  // Array traversal
  if (Array.isArray(json)) {
    return json.map(normalizeProseMirrorJSON);
  }

  // Create a new object to avoid mutating the original
  const newJson: any = {};
  
  // Copy all properties first
  Object.keys(json).forEach(key => {
    newJson[key] = json[key];
  });

  // Fix node type names (CamelCase -> SnakeCase)
  if (newJson.type === 'bulletList') newJson.type = 'bullet_list';
  if (newJson.type === 'orderedList') newJson.type = 'ordered_list';
  if (newJson.type === 'listItem') newJson.type = 'list_item';
  
  // Fix missing type for text nodes
  if (!newJson.type && typeof newJson.text === 'string') {
    newJson.type = 'text';
  }
  
  // Fix mark names
  if (newJson.marks && Array.isArray(newJson.marks)) {
    newJson.marks = newJson.marks.map((m: any) => {
       if (m.type === 'bold') return { ...m, type: 'strong' };
       return m;
    });
  }

  // Fix image attributes (src/url -> imageUrl compatibility)
  if (newJson.type === 'image' && newJson.attrs) {
    // Clone attrs to avoid mutation
    newJson.attrs = { ...newJson.attrs };
    if ((newJson.attrs.url || newJson.attrs.src) && !newJson.attrs.imageUrl) {
       newJson.attrs.imageUrl = newJson.attrs.url || newJson.attrs.src;
    }
  }

  // Recursive normalize content
  if (newJson.content && Array.isArray(newJson.content)) {
    // First, normalize all children and Filter out empty text nodes (ProseMirror crashes on empty JSON text nodes)
    newJson.content = newJson.content
      .map(normalizeProseMirrorJSON)
      .filter((child: any) => !(child.type === 'text' && !child.text));
    
    // Then, expand text nodes that contain markdown syntax
    // This applies to parent nodes like paragraph, heading, list_item
    if (['paragraph', 'heading', 'list_item'].includes(newJson.type)) {
      const expandedContent: any[] = [];
      
      for (const child of newJson.content) {
        if (child.type === 'text' && typeof child.text === 'string' && /\*\*|\*/.test(child.text)) {
          // This text node contains markdown - expand it
          const segments = parseMarkdownInText(child.text);
          segments.forEach(segment => {
            expandedContent.push({
              type: 'text',
              text: segment.text,
              ...(segment.marks && segment.marks.length > 0 ? { marks: segment.marks } : {})
            });
          });
        } else {
          // No markdown, keep as is
          expandedContent.push(child);
        }
      }
      
      newJson.content = expandedContent;
    }
  }

  return newJson;
};

export const ProseMirrorEditor = memo(function ProseMirrorEditor({
  value,
  onChange,
  readOnly = false,
  className,
  placeholder = "Type '/' for commands...",
  blockId,
  theme: themeProp,
}: ProseMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const isInternalChangeRef = useRef(false); // Track if change is from editor itself
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;

  // Inject base styles globally once
  useEffect(() => {
    injectBaseStyles();
  }, []);

  // Generate unique ID for scoping styles - always unique to prevent conflicts when multiple cards have same blockId
  const editorIdRef = useRef<string>(
    blockId
      ? `${blockId}-${Math.random().toString(36).substr(2, 9)}`
      : `prosemirror-${Math.random().toString(36).substr(2, 9)}`
  );

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

  // Error state for parsing failures
  const [parseError, setParseError] = useState<string | null>(null);



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


    // Handle both Markdown string and legacy JSON format
    let prosemirrorDoc: ProseMirrorNode | null = null;
    
    // Normalize value: If it's a ProseMirror JSON object, stringify it to use the robust string parsing path
    let stringValue = value;
    if (value && typeof value === 'object' && value.type === 'doc') {
       stringValue = JSON.stringify(value);
    }

    if (typeof stringValue === "string") {
      // Check if the string is actually a JSON string (AI sometimes returns stringified JSON)
      const trimmed = stringValue.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && parsed.type === 'doc') {
             const normalized = normalizeProseMirrorJSON(parsed);
             prosemirrorDoc = ProseMirrorNode.fromJSON(schema, normalized);
             setParseError(null); 
          }
        } catch (e) {
          // Not valid JSON, proceed to Markdown parsing
        }
      }

      // If not successfully parsed as JSON, treat as Markdown
      if (!prosemirrorDoc) {
        try {
          prosemirrorDoc = defaultMarkdownParser.parse(stringValue);
        } catch (error) {
          return;
        }
      }
    } else {
      // Invalid format, skip
      return;
    }

    if (prosemirrorDoc) {
      const currentDoc = viewRef.current.state.doc;

      // Only update if content is actually different
      if (!currentDoc.eq(prosemirrorDoc)) {
        // Additional check: compare JSON to ensure content really changed
        const currentJSON = currentDoc.toJSON();
        const newJSON = prosemirrorDoc.toJSON();
        const contentChanged =
          JSON.stringify(currentJSON) !== JSON.stringify(newJSON);

        if (contentChanged) {
          const newState = EditorState.create({
            doc: prosemirrorDoc,
            plugins: viewRef.current.state.plugins,
          });
          viewRef.current.updateState(newState);
        }
      }
    }
  }, [value]);

  // Parse initial value to ProseMirror doc
  const initialDoc = useMemo(() => {
    // Normalize value: If it's a ProseMirror JSON object, stringify it
    let stringValue = value;
    if (value && typeof value === 'object' && value.type === 'doc') {
       stringValue = JSON.stringify(value);
    }

    if (typeof stringValue === "string") {
      const trimmed = stringValue.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && parsed.type === 'doc') {
             const normalized = normalizeProseMirrorJSON(parsed);
             return ProseMirrorNode.fromJSON(schema, normalized);
          }
        } catch (e) {
          // Ignore
        }
      }
      
      // Markdown fallback
      try {
        return defaultMarkdownParser.parse(stringValue);
      } catch {
        // Invalid Markdown
      }
    }
    
    return schema.node("doc", null, [schema.node("heading", { level: 2 })]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Execute a slash command
  const executeCommand = useCallback((command: SlashCommand) => {
    const view = viewRef.current;
    if (!view) return;


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

    const placeholderText = placeholder || "Type '/' for commands";
    
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
      createPlaceholderPlugin(placeholderText),
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
              const align = node.attrs.textAlign || "left";
              // Validate alignment (fallback to left if invalid)
              const validAligns = ["left", "center", "right", "justify"];
              const activeAlignment = validAligns.includes(align)
                ? align
                : "left";

              setSelectionToolbar((prev) => {
                // Check if marks changed (simple size check and content check)
                const marksChanged = prev.activeMarks.size !== activeMarks.size || 
                  Array.from(activeMarks).some(m => !prev.activeMarks.has(m));
                
                // Only update if something actually changed
                if (
                  prev.visible &&
                  !marksChanged &&
                  prev.activeAlignment === activeAlignment &&
                  prev.position.top === coords.top &&
                  prev.position.left === coords.left + (to - from > 10 ? 40 : 0)
                ) {
                  return prev; // No change needed
                }
                return {
                  visible: true,
                  position: {
                    top: coords.top,
                    left: coords.left + (to - from > 10 ? 40 : 0),
                  },
                  activeMarks,
                  activeAlignment,
                };
              });
            }
          } catch {
            // Position calculation failed, hide toolbar
            setSelectionToolbar((prev) => {
              if (!prev.visible) return prev; // Already hidden
              return { ...prev, visible: false };
            });
          }
        } else {
          // No selection - hide toolbar only if currently visible
          setSelectionToolbar((prev) => {
            if (!prev.visible) return prev; // Already hidden
            return { ...prev, visible: false };
          });
        }

        if (transaction.docChanged) {
          // Pass the ProseMirror JSON document directly
          const json = newState.doc.toJSON();
          isInternalChangeRef.current = true; // Mark as internal change
          onChangeRef.current(json);

          // Check for slash command trigger
          const { $from } = newState.selection;
          const textBefore = $from.parent.textContent.slice(
            0,
            $from.parentOffset
          );


          const slashMatch = textBefore.match(/(^|\s)\/([^\s]*)$/);

          if (slashMatch) {
            const query = slashMatch[2] || "";

            if (!isMenuOpen) {
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
                      top: coords.bottom,
                      left: coords.left,
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

  // Handle menu close (for outside click, scroll, etc.)
  const handleMenuClose = useCallback(() => {
    setMenuState((prev) => ({
      ...prev,
      open: false,
      query: "",
      selectedIndex: 0,
    }));
  }, []);



  // Generate dynamic styles based on theme, scoped to this editor instance
  // NOTE: Base styles are injected globally once via injectBaseStyles()
  const dynamicStyles = useMemo(() => {
    const fontFamily = getFontFamily(theme.fontFamily || "Inter");
    const editorId = editorIdRef.current;
    return `
      [data-prosemirror-id="${editorId}"] .ProseMirror {
        color: ${theme.bodyColor} !important;
        font-family: ${fontFamily} !important;
      }
      [data-prosemirror-id="${editorId}"] .ProseMirror h1,
      [data-prosemirror-id="${editorId}"] .ProseMirror h2,
      [data-prosemirror-id="${editorId}"] .ProseMirror h3,
      [data-prosemirror-id="${editorId}"] .ProseMirror h4 {
        color: ${theme.themeType === 'dark' ? theme.bodyColor : theme.headingColor} !important;
      }
      [data-prosemirror-id="${editorId}"] .ProseMirror p,
      [data-prosemirror-id="${editorId}"] .ProseMirror li,
      [data-prosemirror-id="${editorId}"] .ProseMirror ul,
      [data-prosemirror-id="${editorId}"] .ProseMirror ol,
      [data-prosemirror-id="${editorId}"] .ProseMirror span,
      [data-prosemirror-id="${editorId}"] .ProseMirror div,
      [data-prosemirror-id="${editorId}"] .ProseMirror strong,
      [data-prosemirror-id="${editorId}"] .ProseMirror em {
        color: ${theme.bodyColor} !important;
      }
      [data-prosemirror-id="${editorId}"] .ProseMirror h1 *,
      [data-prosemirror-id="${editorId}"] .ProseMirror h2 *,
      [data-prosemirror-id="${editorId}"] .ProseMirror h3 *,
      [data-prosemirror-id="${editorId}"] .ProseMirror h4 * {
        color: ${theme.headingColor} !important;
      }
      /* Override inline color styles in HTML content */
      [data-prosemirror-id="${editorId}"] .ProseMirror [style*="color"] {
        color: ${theme.bodyColor} !important;
      }
      [data-prosemirror-id="${editorId}"] .ProseMirror h1[style*="color"],
      [data-prosemirror-id="${editorId}"] .ProseMirror h2[style*="color"],
      [data-prosemirror-id="${editorId}"] .ProseMirror h3[style*="color"],
      [data-prosemirror-id="${editorId}"] .ProseMirror h4[style*="color"] {
        color: ${theme.headingColor} !important;
      }
      [data-prosemirror-id="${editorId}"] .ProseMirror p.is-empty::before,
      [data-prosemirror-id="${editorId}"] .ProseMirror h1.is-empty::before,
      [data-prosemirror-id="${editorId}"] .ProseMirror h2.is-empty::before,
      [data-prosemirror-id="${editorId}"] .ProseMirror h3.is-empty::before,
      [data-prosemirror-id="${editorId}"] .ProseMirror h4.is-empty::before {
        color: ${theme.bodyColor}80 !important;
      }
      /* Hide ALL browser extensions - writing tools, password managers, etc */
      [data-prosemirror-id="${editorId}"] grammarly-extension,
      [data-prosemirror-id="${editorId}"] grammarly-desktop-integration,
      [data-prosemirror-id="${editorId}"] .gr_,
      [data-prosemirror-id="${editorId}"] [data-grammarly-part],
      [data-prosemirror-id="${editorId}"] [class*="grammarly"],
      [data-prosemirror-id="${editorId}"] ltframe,
      [data-prosemirror-id="${editorId}"] [class*="languagetool"],
      [data-prosemirror-id="${editorId}"] [class*="prowritingaid"],
      [data-prosemirror-id="${editorId}"] [class*="ginger"],
      [data-prosemirror-id="${editorId}"] [class*="whitesmoke"],
      [data-prosemirror-id="${editorId}"] [class*="wordtune"],
      [data-prosemirror-id="${editorId}"] [class*="quillbot"],
      [data-prosemirror-id="${editorId}"] [class*="sapling"],
      [data-prosemirror-id="${editorId}"] [class*="writer"],
      [data-prosemirror-id="${editorId}"] [class*="reverso"],
      [data-prosemirror-id="${editorId}"] [class*="trinka"],
      [data-prosemirror-id="${editorId}"] [class*="ludwig"],
      [data-prosemirror-id="${editorId}"] [class*="textexpander"],
      [data-prosemirror-id="${editorId}"] [class*="perfectit"],
      [data-prosemirror-id="${editorId}"] [class*="hemingway"],
      [data-prosemirror-id="${editorId}"] [class*="honey"],
      [data-prosemirror-id="${editorId}"] [class*="lastpass"],
      [data-prosemirror-id="${editorId}"] [class*="1password"],
      [data-prosemirror-id="${editorId}"] [class*="dashlane"],
      [data-prosemirror-id="${editorId}"] [class*="bitwarden"],
      [data-prosemirror-id="${editorId}"] [data-lastpass-icon-root],
      [data-prosemirror-id="${editorId}"] [data-extension],
      [data-prosemirror-id="${editorId}"] [class*="extension"],
      [data-prosemirror-id="${editorId}"] iframe[src*="extension"],
      [data-prosemirror-id="${editorId}"] [id*="grammarly"],
      [data-prosemirror-id="${editorId}"] [id*="ginger"],
      [data-prosemirror-id="${editorId}"] [id*="wordtune"],
      [data-prosemirror-id="${editorId}"] [id*="quillbot"],
      [data-prosemirror-id="${editorId}"] [id*="sapling"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    `;
  }, [theme]);

  return (
    <div
      className={cn("relative w-full", className)}
      data-prosemirror-id={editorIdRef.current}
    >
      <style key={`prosemirror-styles-${editorIdRef.current}`}>
        {dynamicStyles}
      </style>
      
      {parseError && (
        <div className="w-full h-full min-h-[40px]" />
      )}

      <div
        ref={editorRef}
        className="w-full wrap-break-word whitespace-pre-wrap"
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        data-grammarly-disable="true"
        spellCheck="false"
      />
      {/* Edit UI - hidden in readOnly mode */}
      {!readOnly && (
        <>
          {menuState.open && typeof document !== 'undefined' && createPortal(
            <SlashMenu
              open={menuState.open}
              query={menuState.query}
              position={menuState.position}
              selectedIndex={menuState.selectedIndex}
              onSelect={handleMenuClick}
              onClose={handleMenuClose}
            />,
            document.body
          )}
          {selectionToolbar.visible && typeof document !== 'undefined' && createPortal(
            <SelectionToolbar
              visible={selectionToolbar.visible}
              position={selectionToolbar.position}
              activeMarks={selectionToolbar.activeMarks}
              activeAlignment={selectionToolbar.activeAlignment}
              view={viewRef.current}
              onClose={() =>
                setSelectionToolbar((prev) => ({ ...prev, visible: false }))
              }
            />,
            document.body
          )}

        </>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo - re-render when content, readOnly, or THEME COLORS change
  // Theme colors must be compared to ensure text colors update when theme changes
  const prevTheme = prevProps.theme;
  const nextTheme = nextProps.theme;

  // Check if theme colors changed
  const themeColorsEqual =
    prevTheme?.bodyColor === nextTheme?.bodyColor &&
    prevTheme?.headingColor === nextTheme?.headingColor &&
    prevTheme?.fontFamily === nextTheme?.fontFamily;

  return prevProps.value === nextProps.value &&
    prevProps.readOnly === nextProps.readOnly &&
    prevProps.blockId === nextProps.blockId &&
    prevProps.placeholder === nextProps.placeholder &&
    themeColorsEqual;
});

export default ProseMirrorEditor;

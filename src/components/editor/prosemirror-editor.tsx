"use client";

import React, { useEffect, useRef, useState } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, toggleMark, setBlockType } from "prosemirror-commands";
import { history, undo, redo } from "prosemirror-history";
import { gapCursor } from "prosemirror-gapcursor";
import { inputRules, wrappingInputRule, textblockTypeInputRule, smartQuotes } from "prosemirror-inputrules";
import { Plugin } from "prosemirror-state";
import { cn } from "@/lib/utils";
// ... (previous imports)
import { DOMSerializer } from "prosemirror-model";
import { Bold, Italic, Code, Heading1, Heading2, Quote } from "lucide-react";

// ... existing schema ...

// Create schema with list support
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks,
});

type ProseMirrorEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
};

export const ProseMirrorEditor: React.FC<ProseMirrorEditorProps> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  onKeyDown,
  readOnly = false,
  className,
  style,
  autoFocus = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);
  const onKeyDownRef = useRef(onKeyDown);

  // Bubble Menu State
  const [menuState, setMenuState] = React.useState<{
    show: boolean;
    left: number;
    top: number;
  }>({ show: false, left: 0, top: 0 });

  // Keep refs updated
  useEffect(() => {
    onChangeRef.current = onChange;
    onFocusRef.current = onFocus;
    onBlurRef.current = onBlur;
  }, [onChange, onFocus, onBlur, onKeyDown]);

  useEffect(() => {
    onKeyDownRef.current = onKeyDown;
  }, [onKeyDown]);

  useEffect(() => {
    if (!editorRef.current) return;

    // Placeholder plugin - simplified logic
    const placeholderPlugin = new Plugin({
      props: {
        attributes: {
          class: "ProseMirror",
        },
      },
      view(editorView) {
        const updatePlaceholder = () => {
          const { state } = editorView;
           const isEmpty = state.doc.textContent.trim().length === 0 && 
                         state.doc.childCount === 1 && 
                         state.doc.firstChild?.type.name === "paragraph" &&
                         state.doc.firstChild.content.size === 0;

          const editorDOM = editorView.dom as HTMLElement;
          if (isEmpty && placeholder) {
            editorDOM.classList.add("is-editor-empty");
            editorDOM.setAttribute("data-placeholder", placeholder);
          } else {
            editorDOM.classList.remove("is-editor-empty");
            editorDOM.removeAttribute("data-placeholder");
          }
        };

        updatePlaceholder();
        return {
          update: updatePlaceholder,
        };
      },
    });

    // Bubble Menu Plugin
    const bubbleMenuPlugin = new Plugin({
        view(editorView) {
            return {
                update: (view, prevState) => {
                    const { state } = view;
                    const { selection } = state;
                    const { empty, from, to } = selection;

                    if (empty) {
                        setMenuState(prev => ({ ...prev, show: false }));
                        return;
                    }

                    const start = view.coordsAtPos(from);
                    const end = view.coordsAtPos(to);
                    const left = Math.max((start.left + end.left) / 2, start.left + 3); 
                    
                    setMenuState({
                        show: true,
                        left: left,
                        top: start.top - 40, 
                    });
                }
            }
        }
    });

    // Create initial state logic using HTML Parsing
    const getInitialDoc = (content: string) => {
        if (!content) return mySchema.node("doc", null, [mySchema.node("paragraph")]);
        // Simple heuristic: if it looks like HTML, parse as HTML. 
        // Otherwise treat as plain text for backward compatibility with old blocks.
        if (content.trim().startsWith("<")) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = content;
            return DOMParser.fromSchema(mySchema).parse(tempDiv);
        } else {
             // Fallback for plain text: create a paragraph
             return mySchema.node("doc", null, [
                 mySchema.node("paragraph", null, mySchema.text(content))
             ]);
        }
    };

    const initialDoc = getInitialDoc(value);
    
    const state = EditorState.create({
      schema: mySchema,
      doc: initialDoc,
      plugins: [
        history(),
        gapCursor(),
        placeholderPlugin,
        bubbleMenuPlugin,
        keymap({
          ...baseKeymap,
          "Mod-z": undo,
          "Mod-y": redo,
          "Mod-Shift-z": redo,
        }),
      ],
    });

    // Create editor view
    const view = new EditorView(editorRef.current, {
      state,
      editable: () => !readOnly,
      dispatchTransaction: (transaction) => {
        const newState = view.state.apply(transaction);
        view.updateState(newState);

        if (transaction.docChanged) {
            // Serialize to HTML
            const serializer = DOMSerializer.fromSchema(mySchema);
            const fragment = serializer.serializeFragment(newState.doc.content);
            const tempDiv = document.createElement("div");
            tempDiv.appendChild(fragment);
            const html = tempDiv.innerHTML; // Basic HTML serialization
            
            if (html !== value) {
                onChangeRef.current?.(html);
            }
        }
      },
      handleDOMEvents: {
        focus: () => {
          onFocusRef.current?.();
          return false;
        },
        blur: () => {
           onBlurRef.current?.();
           return false;
        },
      },
    });

    viewRef.current = view;

    // ... (rest of style application)
    if (style) {
      const editorDOM = view.dom as HTMLElement;
      Object.assign(editorDOM.style, style);
    }
    if (placeholder) {
      const editorDOM = view.dom as HTMLElement;
      editorDOM.setAttribute("data-placeholder", placeholder);
    }
    if (autoFocus && !readOnly) {
      setTimeout(() => {
        view.focus();
      }, 0);
    }

    const dom = view.dom as HTMLElement;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (onKeyDownRef.current) {
        onKeyDownRef.current(event);
      }
    };
    dom.addEventListener("keydown", handleKeyDown);

    return () => {
      dom.removeEventListener("keydown", handleKeyDown);
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // UseEffects for external prop updates
  useEffect(() => {
    if (!viewRef.current) return;
    
    // We avoid re-parsing HTML loop by storing local state, but if external value differs significantly...
    // HTML comparison is tricky. For now, rely on internal state unless we detect a major forced update or initial load situation?
    // Actually, simple way: if view doesn't have focus, update it.
    if (!viewRef.current.hasFocus()) {
         // Create a temp element to check equality safely? Or just trust the string.
         // Let's just re-parse if different string and not focused.
         // But "different string" might just be attribute order.
         // For prototype, updating only when not focused is "safe enough".
         // However, we need to compare serialized current state.
         
         const serializer = DOMSerializer.fromSchema(mySchema);
         const fragment = serializer.serializeFragment(viewRef.current.state.doc.content);
         const tempDiv = document.createElement("div");
         tempDiv.appendChild(fragment);
         const currentHTML = tempDiv.innerHTML;

         if (value !== currentHTML) {
              // Parse new value
             let newDoc;
             if (value.trim().startsWith("<")) {
                const tempDiv2 = document.createElement("div");
                tempDiv2.innerHTML = value;
                newDoc = DOMParser.fromSchema(mySchema).parse(tempDiv2);
             } else {
                 newDoc = value ? mySchema.node("doc", null, [
                     mySchema.node("paragraph", null, mySchema.text(value))
                 ]) : mySchema.node("doc", null, [mySchema.node("paragraph")]);
             }
             
             const newState = EditorState.create({
                 doc: newDoc,
                 schema: mySchema,
                 plugins: viewRef.current.state.plugins
             });
             viewRef.current.updateState(newState);
         }
    }
  }, [value]);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.setProps({
        editable: () => !readOnly,
      });
    }
  }, [readOnly]);

    useEffect(() => {
    if (!viewRef.current) return;
    const editorDOM = viewRef.current.dom as HTMLElement;
    if (style) {
      Object.assign(editorDOM.style, style);
    }
    if (placeholder) {
      editorDOM.setAttribute("data-placeholder", placeholder);
    } else {
      editorDOM.removeAttribute("data-placeholder");
    }
  }, [style, placeholder]);

  // Helpers for menu
  const runCommand = (command: any) => {
      if (!viewRef.current) return;
      command(viewRef.current.state, viewRef.current.dispatch, viewRef.current);
      viewRef.current.focus();
  };

  return (
    <>
      <style jsx global>{`
        /* ... styles ... */
        .ProseMirror { outline: none; }
        /* Add selection blue background logic if needed, typically default browser handles it */
        /* ... existing styles ... */
        .ProseMirror h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
        .ProseMirror h3 { font-size: 1.17em; font-weight: bold; margin-bottom: 0.5em; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
        .ProseMirror blockquote { border-left: 4px solid #ccc; padding-left: 1em; margin-left: 0; font-style: italic; }
        .ProseMirror pre { background: #f4f4f4; padding: 0.5em; border-radius: 4px; }
        .ProseMirror p { margin-bottom: 0.5em; }
        .ProseMirror p:last-child { margin-bottom: 0; }
        .is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #adb5bd; pointer-events: none; height: 0; }
      `}</style>
      
      <div
        ref={editorRef}
        className={cn(
          "prosemirror-editor w-full outline-none",
          readOnly ? "cursor-default" : "cursor-text",
          className
        )}
        style={style}
      />
      
      {/* Floating Bubble Menu */}
      {menuState.show && (
          <div 
             className="fixed z-[9999] flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg border border-gray-200 animate-in fade-in zoom-in-95 duration-100"
             style={{
                 left: menuState.left,
                 top: menuState.top,
                 transform: 'translateX(-50%)'
             }}
             onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} // Prevent stealing focus
          >
             <button onClick={() => runCommand(toggleMark(mySchema.marks.strong))} className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black">
                 <Bold size={16} />
             </button>
             <button onClick={() => runCommand(toggleMark(mySchema.marks.em))} className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black">
                 <Italic size={16} />
             </button>
             <button onClick={() => runCommand(toggleMark(mySchema.marks.code))} className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black">
                 <Code size={16} />
             </button>
             <div className="w-px h-4 bg-gray-200 mx-1" />
              <button onClick={() => runCommand(setBlockType(mySchema.nodes.heading, { level: 1 }))} className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black">
                 <Heading1 size={16} />
             </button>
             <button onClick={() => runCommand(setBlockType(mySchema.nodes.heading, { level: 2 }))} className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black">
                 <Heading2 size={16} />
             </button>
             <button onClick={() => runCommand(wrappingInputRule(/^\s*>\s$/, mySchema.nodes.blockquote))} className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black">
                 <Quote size={16} /> {/* Placeholder for blockquote toggle logic which is complex in vanilla PM without helper */}
             </button>
          </div>
      )}
    </>
  );
};


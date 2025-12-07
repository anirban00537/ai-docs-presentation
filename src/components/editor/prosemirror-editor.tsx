"use client";

import React, { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { history, undo, redo } from "prosemirror-history";
import { gapCursor } from "prosemirror-gapcursor";
import { inputRules, wrappingInputRule, textblockTypeInputRule, smartQuotes } from "prosemirror-inputrules";
import { Plugin } from "prosemirror-state";
import { cn } from "@/lib/utils";
import { defaultMarkdownParser, defaultMarkdownSerializer } from "prosemirror-markdown";

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

    // Placeholder plugin
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

    // Markdown Input Rules
    const markdownInputRules = inputRules({
      rules: [
        // Headings: # space, ## space, etc.
        textblockTypeInputRule(
          new RegExp("^(#{1,6})\\s$"),
          mySchema.nodes.heading,
          (match) => ({ level: match[1].length })
        ),
        // Blockquote: > space
        wrappingInputRule(/^\s*>\s$/, mySchema.nodes.blockquote),
        // Code Block: ```
        textblockTypeInputRule(/^```$/, mySchema.nodes.code_block),
        // Ordered List: 1. space
        wrappingInputRule(
            /^(\d+)\.\s$/,
            mySchema.nodes.ordered_list,
            (match) => ({ order: +match[1] }),
            (match, node) => node.childCount + node.attrs.order === +match[1]
        ),
        // Bullet List: - space or * space
        wrappingInputRule(/^\s*([-+*])\s$/, mySchema.nodes.bullet_list),
        // Smart quotes
        ...smartQuotes,
      ],
    });

    // Create initial state using Markdown Parser
    const initialDoc = defaultMarkdownParser.parse(value || "") || mySchema.node("doc", null, [mySchema.node("paragraph")]);
    
    const state = EditorState.create({
      schema: mySchema,
      doc: initialDoc,
      plugins: [
        history(),
        gapCursor(),
        placeholderPlugin,
        markdownInputRules, // Use our extended rules
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

        // Serialize to Markdown on change
        if (transaction.docChanged) {
            const markdown = defaultMarkdownSerializer.serialize(newState.doc);
            if (markdown !== value) {
                onChangeRef.current?.(markdown);
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

    // Apply styles to editor DOM
    if (style) {
      const editorDOM = view.dom as HTMLElement;
      Object.assign(editorDOM.style, style);
    }

    // Set placeholder attribute
    if (placeholder) {
      const editorDOM = view.dom as HTMLElement;
      editorDOM.setAttribute("data-placeholder", placeholder);
    }
    
    // Autofocus
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
  }, []); // Only run once on mount

  // Update content when value prop changes (but not from user input to avoid cursor jumps/loops)
  // Converting back from markdown to check equality is expensive and tricky due to formatting diffs.
  // Ideally we only update if the external value is significantly different or if we want to force reset.
  // For now, let's keep it simple: if the editor is not focused, or if we really need to sync.
  // A common pattern is to only update if the document is totally different, but here we'll skip 
  // live bidirectional sync while typing to prevent cursor jump, relying on internal state.
  // HOWEVER, initial load or undo/redo from parent might need handling.
  // For this "Gamma" prototype, let's just assume local state is source of truth while focused.

  useEffect(() => {
    if (!viewRef.current) return;
    
    // If the new value matches what we just serialized, don't re-parse (prevents cursor jump logic loops)
    const currentMarkdown = defaultMarkdownSerializer.serialize(viewRef.current.state.doc);
    if (value !== currentMarkdown && !viewRef.current.hasFocus()) {
         const newDoc = defaultMarkdownParser.parse(value || "");
         if (newDoc) {
             const newState = EditorState.create({
                 doc: newDoc,
                 schema: mySchema,
                 plugins: viewRef.current.state.plugins
             });
             viewRef.current.updateState(newState);
         }
    }
  }, [value]);

  // Update readOnly state
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.setProps({
        editable: () => !readOnly,
      });
    }
  }, [readOnly]);

  // Update styles and placeholder when they change
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

  return (
    <div
      ref={editorRef}
      className={cn(
        "prosemirror-editor w-full outline-none",
        readOnly ? "cursor-default" : "cursor-text",
        className
      )}
      style={style}
    />
  );
};


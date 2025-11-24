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
import { inputRules, wrappingInputRule, textblockTypeInputRule } from "prosemirror-inputrules";
import { Plugin } from "prosemirror-state";
import { cn } from "@/lib/utils";

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
          const isEmpty = state.doc.textContent.trim().length === 0;
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

    // Create initial state
    const state = EditorState.create({
      schema: mySchema,
      plugins: [
        history(),
        gapCursor(),
        placeholderPlugin,
        keymap({
          ...baseKeymap,
          "Mod-z": undo,
          "Mod-y": redo,
          "Mod-Shift-z": redo,
        }),
        inputRules({
          rules: [
            wrappingInputRule(/^\s*>\s$/, mySchema.nodes.blockquote),
            textblockTypeInputRule(/^```$/, mySchema.nodes.code_block),
          ],
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

        // Extract text content and call onChange
        const textContent = newState.doc.textContent;
        if (textContent !== value) {
          onChangeRef.current?.(textContent);
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

    // Set initial content
    if (value) {
      const doc = mySchema.node("doc", null, [
        mySchema.node("paragraph", null, mySchema.text(value)),
      ]);
      const newState = EditorState.create({
        doc,
        schema: mySchema,
        plugins: view.state.plugins,
      });
      view.updateState(newState);
    }

    // Auto focus if requested
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

  // Update content when value prop changes (but not from user input)
  useEffect(() => {
    if (!viewRef.current) return;
    const currentText = viewRef.current.state.doc.textContent;
    if (currentText !== value) {
      const doc = value
        ? mySchema.node("doc", null, [
            mySchema.node("paragraph", null, mySchema.text(value)),
          ])
        : mySchema.node("doc", null, [mySchema.node("paragraph")]);
      const newState = EditorState.create({
        doc,
        schema: mySchema,
        plugins: viewRef.current.state.plugins,
      });
      viewRef.current.updateState(newState);
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


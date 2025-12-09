"use client";

import React, { useEffect, useRef } from "react";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import {
  schema as markdownSchema,
  defaultMarkdownParser,
  defaultMarkdownSerializer,
} from "prosemirror-markdown";
import { cn } from "@/lib/utils";
import { PROSEMIRROR_STYLES } from "./prosemirror/styles";

interface MarkdownViewerProps {
  content: string;
  className?: string;
  editable?: boolean;
  onChange?: (content: string) => void;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  className,
  editable = true,
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const contentRef = useRef<string>(content);

  useEffect(() => {
    if (!editorRef.current) return;

    // Update content ref
    contentRef.current = content;

    // Parse markdown content
    let doc;
    try {
      doc = defaultMarkdownParser.parse(content || "");
    } catch {
      // If parsing fails, create empty doc
      doc = markdownSchema.nodes.doc.create();
    }

    const plugins = [
      history(),
      keymap({ "Mod-z": undo, "Mod-y": redo, "Mod-Shift-z": redo }),
      keymap(baseKeymap),
    ];

    const state = EditorState.create({
      doc,
      schema: markdownSchema,
      plugins,
    });

    const view = new EditorView(editorRef.current, {
      state,
      editable: () => editable,
      dispatchTransaction: (transaction: Transaction) => {
        if (!viewRef.current) return;

        const newState = viewRef.current.state.apply(transaction);
        viewRef.current.updateState(newState);

        // Call onChange if content changed
        if (transaction.docChanged && onChange) {
          const markdown = defaultMarkdownSerializer.serialize(newState.doc);
          onChange(markdown);
        }
      },
      attributes: {
        class: "ProseMirror",
      },
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only initialize once

  // Update content when it changes externally
  useEffect(() => {
    if (!viewRef.current || contentRef.current === content) return;

    try {
      const newDoc = defaultMarkdownParser.parse(content || "");
      const currentDoc = viewRef.current.state.doc;

      // Only update if content is actually different
      if (newDoc.content.size !== currentDoc.content.size) {
        const newState = EditorState.create({
          doc: newDoc,
          schema: markdownSchema,
          plugins: viewRef.current.state.plugins,
        });
        viewRef.current.updateState(newState);
        contentRef.current = content;
      }
    } catch (error) {
      console.error("Error parsing markdown:", error);
    }
  }, [content]);

  return (
    <div className={cn("relative w-full", className)}>
      <style>{PROSEMIRROR_STYLES}</style>
      <div
        ref={editorRef}
        className="w-full wrap-break-word whitespace-pre-wrap"
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
      />
    </div>
  );
};

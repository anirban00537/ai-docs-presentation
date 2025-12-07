"use client";

import React, { useMemo, useEffect, useRef, useCallback } from "react";
import YooptaEditor, { createYooptaEditor } from "@yoopta/editor";
import Paragraph from "@yoopta/paragraph";
import Blockquote from "@yoopta/blockquote";
import Code from "@yoopta/code";
import { HeadingOne, HeadingTwo, HeadingThree } from "@yoopta/headings";
import { BulletedList, NumberedList, TodoList } from "@yoopta/lists";
import Link from "@yoopta/link";
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from "@yoopta/marks";
import ActionMenuList, { DefaultActionMenuRender } from "@yoopta/action-menu-list";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";

import { cn } from "@/lib/utils";

// Initialize plugins
const plugins = [
  Paragraph,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  BulletedList,
  NumberedList,
  TodoList,
  Blockquote,
  Code,
  Link,
];

const marks = [
  Bold, 
  Italic, 
  CodeMark, 
  Underline, 
  Strike, 
  Highlight,
];

// Define tools for the action menu which appears on '/'
const TOOLS = {
  ActionMenu: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
};

type YooptaEditorWrapperProps = {
  value: any; // Yoopta uses complex JSON object, initial value might be string from old editor
  onChange: (value: any) => void;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  blockId?: string; // Unique identifier for this editor instance
};

export const YooptaEditorWrapper: React.FC<YooptaEditorWrapperProps> = ({
  value,
  onChange,
  readOnly = false,
  className,
  placeholder = "Type '/' for commands",
  style,
  blockId,
}) => {
  // Create a stable editor instance per blockId
  const editor = useMemo(() => createYooptaEditor(), []);
  const onChangeRef = useRef(onChange);
  
  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  // Get initial value - only used on mount
  const initialValue = useMemo(() => {
    if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
      return value;
    }
    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only use initial value on mount

  // Handle editor changes
  const handleChange = useCallback((newValue: any) => {
    onChangeRef.current(newValue);
  }, []);

  return (
    <>
      {/* CSS to hide Grammarly and other extension elements */}
      <style>{`
        .yoopta-editor-container grammarly-extension,
        .yoopta-editor-container grammarly-popups,
        .yoopta-editor-container [data-grammarly-shadow-root],
        .yoopta-editor-container .gr-top-layer,
        .yoopta-editor-container grammarly-desktop-integration {
          display: none !important;
          visibility: hidden !important;
        }
        .yoopta-editor-container [contenteditable] {
          -webkit-user-modify: read-write-plaintext-only;
        }
      `}</style>
      <div 
          className={cn("yoopta-editor-container w-full break-words whitespace-pre-wrap min-h-[40px]", className)}
          style={style}
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          suppressContentEditableWarning
      >
        <YooptaEditor
          editor={editor}
          plugins={plugins}
          marks={marks}
          tools={TOOLS}
          placeholder={placeholder}
          readOnly={readOnly}
          value={initialValue}
          width="100%"
          style={{ width: '100%' }}
          onChange={handleChange}
          className="w-full"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          autoFocus={false}
        />
      </div>
    </>
  );
};

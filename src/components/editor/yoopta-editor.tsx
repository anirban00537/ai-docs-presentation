"use client";

import React, { useMemo, useEffect, useRef } from "react";
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
};

export const YooptaEditorWrapper: React.FC<YooptaEditorWrapperProps> = ({
  value,
  onChange,
  readOnly = false,
  className,
  placeholder = "Type '/' for commands",
  style,
}) => {
  const editor = useMemo(() => createYooptaEditor(), []);
  
  // We need to handle the "value" prop carefully. 
  // Yoopta manages its own state. "value" is usually initialData.
  // If we want controlled component behavior, we need to sync, but strict controlled mode 
  // in rich text editors is hard. 
  // For this use case (Gamma-like), we often just want to save the content.
  
  // Also, we need to convert old "string" or "html" content to Yoopta format if possible,
  // or just reset if it's incompatible. 
  // For now, if value is a string (from previous steps), we might initialize with empty or a default paragraph.

  const initialValue = useMemo(() => {
     if (typeof value === 'object' && value !== null) {
         return value;
     }
     // Fallback for string/empty
     return undefined; // Let Yoopta use its default empty state
  }, []);

  return (
    <div 
        className={cn("yoopta-editor-container w-full", className)}
        style={style}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        marks={marks}
        tools={TOOLS}
        placeholder={placeholder}
        readOnly={readOnly}
        value={initialValue}
        onChange={(val: any) => {
            // val is the new editor state
            onChange(val);
        }}
        className="w-full"
      />
    </div>
  );
};

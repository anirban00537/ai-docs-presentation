import React, { useCallback, useMemo, memo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  type StepCardContent,
} from "../definitions";
import {
    createStepCardContent,
} from "../definitions/step-card-block";

interface StepCardBlockProps {
  block: Block;
  onUpdate: (content: StepCardContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const StepCardBlock = memo(function StepCardBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: StepCardBlockProps) {
  const content = block.content as StepCardContent;
  const [isEditingNumber, setIsEditingNumber] = useState(false);

  const stepNumber = content?.stepNumber ?? 1;

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createStepCardContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        type: "step-card-block",
        editorContent: newEditorContent,
      });
    },
    [content, onUpdate, readOnly]
  );

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newNumber = parseInt(e.target.value, 10);
      if (!isNaN(newNumber) && newNumber > 0 && newNumber <= 99) {
        onUpdate({
          ...content,
          type: "step-card-block",
          stepNumber: newNumber,
        });
      }
    },
    [content, onUpdate]
  );

  const isDark = theme.themeType === 'dark';

  return (
    <div
      className="w-full relative transition-all duration-300"
      style={{ 
        paddingTop: '20px', // Space for the overlapping badge
      }}
    >
      {/* Numbered Badge - Positioned at top center, overlapping the border */}
      <div 
        className="absolute z-10 flex items-center justify-center"
        style={{
          top: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: theme.primary,
          color: isDark ? '#000000' : '#ffffff',
          fontWeight: 700,
          fontSize: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {!readOnly && isEditingNumber ? (
          <input
            type="number"
            min="1"
            max="99"
            value={stepNumber}
            onChange={handleNumberChange}
            onBlur={() => setIsEditingNumber(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingNumber(false)}
            autoFocus
            className="w-full h-full text-center bg-transparent border-none outline-none font-bold"
            style={{ 
              color: isDark ? '#000000' : '#ffffff',
              fontSize: '1rem',
            }}
          />
        ) : (
          <span 
            onClick={() => !readOnly && setIsEditingNumber(true)}
            className={!readOnly ? "cursor-pointer" : ""}
          >
            {stepNumber}
          </span>
        )}
      </div>

      {/* Card Container with full border */}
      <div
        className="w-full transition-all duration-300 hover:shadow-md"
        style={{ 
          borderRadius: theme.cardBorderRadius ?? "12px",
          border: `2px solid ${theme.primary}`,
          backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)',
          minHeight: '80px',
          boxSizing: 'border-box',
        }}
      >
        {/* Content Area */}
        <div className="p-4 pt-5">
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Add step details..."}
            className="prose-sm leading-relaxed"
            readOnly={readOnly}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
});

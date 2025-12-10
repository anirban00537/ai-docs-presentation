import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createTimelineContent,
  type TimelineContent,
  type TimelineStep,
} from "../definitions";
import { TimelineStepComponent } from "./TimelineStep";

interface TimelineBlockProps {
  block: Block;
  onUpdate: (content: TimelineContent) => void;
  theme: Theme;
  placeholder?: string;
}

const applyAlpha = (hex: string, alpha: number): string => {
  const raw = hex?.replace("#", "");
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.substring(0, 2), 16);
  const g = parseInt(raw.substring(2, 4), 16);
  const b = parseInt(raw.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
}) => {
  const content = block.content as TimelineContent;
  const steps = content?.steps ?? createTimelineContent().steps;
  const title = content?.title;

  const handleTitleChange = useCallback(
    (newDoc: any) => {
      onUpdate({
        ...(content ?? createTimelineContent()),
        title: newDoc,
      });
    },
    [content, onUpdate]
  );

  const handleStepTitleChange = useCallback(
    (stepIndex: number, newDoc: any) => {
      const newSteps = [...steps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        title: newDoc,
      };
      onUpdate({
        ...(content ?? createTimelineContent()),
        steps: newSteps,
      });
    },
    [content, onUpdate, steps]
  );

  const handleStepDescriptionChange = useCallback(
    (stepIndex: number, newDoc: any) => {
      const newSteps = [...steps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        description: newDoc,
      };
      onUpdate({
        ...(content ?? createTimelineContent()),
        steps: newSteps,
      });
    },
    [content, onUpdate, steps]
  );

  return (
    <div className="w-full">
      {/* Optional Title */}
      {title && (
        <div className="mb-8">
          <ProseMirrorEditor
            key={`${block.id}-title`}
            blockId={`${block.id}-title`}
            value={title}
            onChange={handleTitleChange}
            placeholder="Timeline title"
            className="text-2xl font-bold"
            style={{
              color: theme.headingColor,
            }}
          />
        </div>
      )}

      {/* Timeline Steps */}
      <div className="relative">
        {/* Vertical Line */}
        <div
          className="absolute left-6 top-0 bottom-0 w-0.5"
          style={{
            backgroundColor: applyAlpha(theme.primary, 0.2),
          }}
        />

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step: TimelineStep, index: number) => (
            <TimelineStepComponent
              key={index}
              step={step}
              stepIndex={index}
              blockId={block.id}
              theme={theme}
              onTitleChange={handleStepTitleChange}
              onDescriptionChange={handleStepDescriptionChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


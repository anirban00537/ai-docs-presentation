import React, { useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { TimelineStep as TimelineStepType } from "../definitions";
import { createTimelineContent } from "../definitions";
import type { Theme } from "@/lib/editor/types";

interface TimelineStepProps {
  step: TimelineStepType;
  stepIndex: number;
  blockId: string;
  theme: Theme;
  onTitleChange: (index: number, newDoc: any) => void;
  onDescriptionChange: (index: number, newDoc: any) => void;
}

const applyAlpha = (hex: string, alpha: number): string => {
  const raw = hex?.replace("#", "");
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.substring(0, 2), 16);
  const g = parseInt(raw.substring(2, 4), 16);
  const b = parseInt(raw.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const TimelineStepComponent: React.FC<TimelineStepProps> = ({
  step,
  stepIndex,
  blockId,
  theme,
  onTitleChange,
  onDescriptionChange,
}) => {
  const stepContent = step ?? createTimelineContent().steps[0];

  const titleDoc = useMemo(() => {
    if (stepContent?.title?.type === "doc") return stepContent.title;
    return createTimelineContent().steps[0].title;
  }, [stepContent?.title]);

  const descriptionDoc = useMemo(() => {
    if (stepContent?.description?.type === "doc")
      return stepContent.description;
    return createTimelineContent().steps[0].description;
  }, [stepContent?.description]);

  const icon = stepContent?.icon ?? "•";

  return (
    <div className="relative flex gap-6">
      {/* Icon/Number Circle */}
      <div className="relative z-10 shrink-0">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold shadow-md"
          style={{
            backgroundColor: theme.primary,
            color: theme.cardBackground,
            border: `3px solid ${theme.cardBackground}`,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        {/* Step Title */}
        <div className="mb-2">
          <ProseMirrorEditor
            key={`${blockId}-step-${stepIndex}-title`}
            blockId={`${blockId}-step-${stepIndex}-title`}
            value={titleDoc}
            onChange={(newDoc) => onTitleChange(stepIndex, newDoc)}
            placeholder={`Step ${stepIndex + 1} title`}
            className="text-xl font-semibold"
          />
        </div>

        {/* Step Description */}
        <div>
          <ProseMirrorEditor
            key={`${blockId}-step-${stepIndex}-description`}
            blockId={`${blockId}-step-${stepIndex}-description`}
            value={descriptionDoc}
            onChange={(newDoc) => onDescriptionChange(stepIndex, newDoc)}
            placeholder={`Step ${stepIndex + 1} description`}
            className="text-base"
          />
        </div>
      </div>
    </div>
  );
};


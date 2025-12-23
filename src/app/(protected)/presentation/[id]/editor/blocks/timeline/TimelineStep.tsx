import React, { useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { TimelineStep as TimelineStepType } from "../definitions";
import { createTimelineContent } from "../definitions";
import type { Theme, ProseMirrorDocument } from "@/types/presentation";

interface TimelineStepProps {
  step: TimelineStepType;
  stepIndex: number;
  blockId: string;
  theme: Theme;
  onTitleChange: (index: number, newDoc: ProseMirrorDocument) => void;
  onDescriptionChange: (index: number, newDoc: ProseMirrorDocument) => void;
  readOnly?: boolean;
}

export const TimelineStepComponent = memo(function TimelineStepComponent({
  step,
  stepIndex,
  blockId,
  theme,
  onTitleChange,
  onDescriptionChange,
  readOnly = false,
}: TimelineStepProps) {
  const stepContent = step ?? createTimelineContent().steps[0];

  const titleDoc = useMemo(() => {
    return stepContent?.title ?? createTimelineContent().steps[0].title;
  }, [stepContent?.title]);

  const descriptionDoc = useMemo(() => {
    return (
      stepContent?.description ?? createTimelineContent().steps[0].description
    );
  }, [stepContent?.description]);

  return (
    <div className="relative flex gap-6">
      {/* Step Number Badge */}
      <div className="relative z-20 shrink-0">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all border shadow-sm"
          style={{ 
            backgroundColor: `${theme.primary}10`,
            borderColor: `${theme.primary}20`,
            color: theme.primary,
            backdropFilter: "blur(8px)"
          }}
        >
          {stepIndex + 1}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 pt-1 group/content">
        {/* Step Title */}
        <div className="mb-2">
          <ProseMirrorEditor
            key={`${blockId}-step-${stepIndex}-title`}
            blockId={`${blockId}-step-${stepIndex}-title`}
            value={titleDoc}
            onChange={(newDoc) => onTitleChange(stepIndex, newDoc)}
            placeholder={`Step ${stepIndex + 1} title`}
            className="text-lg font-bold tracking-tight leading-tight group-hover/content:translate-x-1 transition-transform"
            theme={theme}
            readOnly={readOnly}
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
            className="text-sm opacity-60 leading-relaxed group-hover/content:translate-x-1 transition-transform duration-300"
            theme={theme}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
});

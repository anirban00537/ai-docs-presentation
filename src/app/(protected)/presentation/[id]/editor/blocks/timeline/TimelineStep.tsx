import React, { useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { TimelineStep as TimelineStepType } from "../definitions";
import { createTimelineContent } from "../definitions";
import type { Theme, ProseMirrorDocument } from "@/types/presentation";
import { EmojiPickerTrigger } from "../../ui/LazyEmojiPicker";

interface TimelineStepProps {
  step: TimelineStepType;
  stepIndex: number;
  blockId: string;
  theme: Theme;
  onTitleChange: (index: number, newDoc: ProseMirrorDocument) => void;
  onDescriptionChange: (index: number, newDoc: ProseMirrorDocument) => void;
  onIconChange: (index: number, icon: string) => void;
  readOnly?: boolean;
}

export const TimelineStepComponent = memo(function TimelineStepComponent({
  step,
  stepIndex,
  blockId,
  theme,
  onTitleChange,
  onDescriptionChange,
  onIconChange,
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

  const icon = stepContent?.icon ?? "•";

  return (
    <div className="relative flex gap-5">
      {/* Step Marker */}
      <div className="relative z-20 shrink-0">
        <EmojiPickerTrigger
          icon={icon}
          onEmojiSelect={(emoji) => onIconChange(stepIndex, emoji)}
          disabled={readOnly}
          size="md"
          backgroundColor={`${theme.primary}15`}
          className="font-medium"
        />
      </div>

      {/* Content */}
      <div className="flex-1 pb-2 pt-1">
        {/* Step Title */}
        <div className="mb-1">
          <ProseMirrorEditor
            key={`${blockId}-step-${stepIndex}-title`}
            blockId={`${blockId}-step-${stepIndex}-title`}
            value={titleDoc}
            onChange={(newDoc) => onTitleChange(stepIndex, newDoc)}
            placeholder={`Step ${stepIndex + 1} title`}
            className="text-base font-semibold"
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
            className="text-sm opacity-60"
            theme={theme}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
});

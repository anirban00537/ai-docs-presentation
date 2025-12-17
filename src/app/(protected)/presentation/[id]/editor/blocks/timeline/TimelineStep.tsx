import React, { useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { TimelineStep as TimelineStepType } from "../definitions";
import { createTimelineContent } from "../definitions";
import type { Theme } from "@/lib/editor/types";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimelineStepProps {
  step: TimelineStepType;
  stepIndex: number;
  blockId: string;
  theme: Theme;
  onTitleChange: (index: number, newDoc: any) => void;
  onDescriptionChange: (index: number, newDoc: any) => void;
  onIconChange: (index: number, icon: string) => void;
}

export const TimelineStepComponent: React.FC<TimelineStepProps> = ({
  step,
  stepIndex,
  blockId,
  theme,
  onTitleChange,
  onDescriptionChange,
  onIconChange,
}) => {
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
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-medium transition-all hover:scale-110 cursor-pointer outline-none"
              style={{
                backgroundColor: `${theme.primary}15`,
                color: theme.primary,
              }}
              title="Change icon"
            >
              {icon}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none shadow-xl">
            <EmojiPicker
              onEmojiClick={(emoji) => onIconChange(stepIndex, emoji.emoji)}
            />
          </PopoverContent>
        </Popover>
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
          />
        </div>
      </div>
    </div>
  );
};

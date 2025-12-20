import React, { useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createTimelineContent,
  type TimelineContent,
  type TimelineStep,
} from "../definitions";
import { TimelineStepComponent } from "./TimelineStep";
import { BlockWrapper } from "../BlockWrapper";
import { createParagraphContent } from "../definitions/common";

interface TimelineBlockProps {
  block: Block;
  onUpdate: (content: TimelineContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}) => {
  const content = block.content as TimelineContent;
  const steps = content?.steps ?? createTimelineContent().steps;
  const title = content?.title ?? undefined;

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
      newSteps[stepIndex] = { ...newSteps[stepIndex], title: newDoc };
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
      newSteps[stepIndex] = { ...newSteps[stepIndex], description: newDoc };
      onUpdate({
        ...(content ?? createTimelineContent()),
        steps: newSteps,
      });
    },
    [content, onUpdate, steps]
  );

  const handleStepIconChange = useCallback(
    (stepIndex: number, newIcon: string) => {
      const newSteps = [...steps];
      newSteps[stepIndex] = { ...newSteps[stepIndex], icon: newIcon };
      onUpdate({
        ...(content ?? createTimelineContent()),
        steps: newSteps,
      });
    },
    [content, onUpdate, steps]
  );

  const addStep = useCallback(() => {
    onUpdate({
      ...(content ?? createTimelineContent()),
      steps: [
        ...steps,
        {
          title: createParagraphContent("New Step"),
          description: createParagraphContent("Description for the new step"),
          icon: "📌",
        },
      ],
    });
  }, [content, onUpdate, steps]);

  return (
    <BlockWrapper onAdd={!readOnly ? addStep : undefined} theme={theme} readOnly={readOnly}>
      <CommonCard theme={theme} className="w-full h-full p-6">
        <div className="w-full h-full flex flex-col py-2">
          {/* Optional Title */}
          {title && (
            <div className="mb-8 pl-2">
              <ProseMirrorEditor
                key={`${block.id}-title`}
                blockId={`${block.id}-title`}
                value={title}
                onChange={handleTitleChange}
                placeholder="Timeline title"
                className="text-xl font-bold tracking-tight"
                theme={theme}
                readOnly={readOnly}
              />
            </div>
          )}

          {/* Timeline Steps */}
          <div className="relative">
            {/* Vertical Line */}
            <div
              className="absolute left-[19px] top-3 bottom-6 w-0.5"
              style={{
                backgroundColor: `${theme.primary}20`,
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
                  onIconChange={handleStepIconChange}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>
        </div>
      </CommonCard>
    </BlockWrapper>
  );
};

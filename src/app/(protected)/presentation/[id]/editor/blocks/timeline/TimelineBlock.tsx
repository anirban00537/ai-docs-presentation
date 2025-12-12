import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createTimelineContent,
  type TimelineContent,
  type TimelineStep,
} from "../definitions";
import { TimelineStepComponent } from "./TimelineStep";
import { withAlpha } from "../utils";
import { BlockWrapper } from "../BlockWrapper";
import { createParagraphContent } from "../definitions/common";

interface TimelineBlockProps {
  block: Block;
  onUpdate: (content: TimelineContent) => void;
  theme: Theme;
  placeholder?: string;
}

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
    <BlockWrapper onAdd={addStep} theme={theme}>
      <div className="w-full h-full flex flex-col py-4">
        {/* Optional Title */}
        {title && (
          <div className="mb-10 pl-2">
            <ProseMirrorEditor
              key={`${block.id}-title`}
              blockId={`${block.id}-title`}
              value={title}
              onChange={handleTitleChange}
              placeholder="Timeline title"
              className="text-2xl font-bold tracking-tight"
            />
          </div>
        )}

        {/* Timeline Steps */}
        <div className="relative pl-4">
          {/* Vertical Line */}
          <div
            className="absolute left-[23px] top-4 bottom-8 w-px border-l-2 border-dashed"
            style={{
              borderColor: withAlpha(theme.primary, 0.3),
            }}
          />

          {/* Steps */}
          <div className="space-y-10">
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
    </BlockWrapper>
  );
};


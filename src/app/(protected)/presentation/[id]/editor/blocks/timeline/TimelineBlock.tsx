import React, { useCallback, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  createTimelineContent,
  type TimelineContent,
  type TimelineStep,
} from "../definitions";
import { TimelineStepComponent } from "./TimelineStep";
import { BlockWrapper } from "../../block/BlockWrapper";
import { CommonCard } from "../CommonCard";

interface TimelineBlockProps {
  block: Block;
  onUpdate: (content: TimelineContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const TimelineBlock = memo(function TimelineBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: TimelineBlockProps) {
  const content = block.content as TimelineContent;
  const steps = content?.steps ?? createTimelineContent().steps;
  const title = content?.title ?? undefined;

  const handleTitleChange = useCallback(
    (newDoc: ProseMirrorDocument) => {
      onUpdate({
        ...(content ?? createTimelineContent()),
        title: newDoc,
      });
    },
    [content, onUpdate]
  );

  const handleStepTitleChange = useCallback(
    (stepIndex: number, newDoc: ProseMirrorDocument) => {
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
    (stepIndex: number, newDoc: ProseMirrorDocument) => {
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
    (stepIndex: number, icon: string) => {
      const newSteps = [...steps];
      newSteps[stepIndex] = { ...newSteps[stepIndex], icon };
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
          title: "New Step",
          description: "Description for the new step",
        },
      ],
    });
  }, [content, onUpdate, steps]);

  return (
    <BlockWrapper
      onAdd={!readOnly ? addStep : undefined}
      theme={theme}
      readOnly={readOnly}
    >
      <CommonCard 
        theme={theme} 
        className="w-full h-full transition-all duration-300 hover:shadow-xl"
      >
        <div 
          className="w-full h-full flex flex-col p-12 relative overflow-hidden"
          style={{ borderRadius: theme.cardBorderRadius ?? "12px" }}
        >
          {/* Minimal Gradient Background Blob */}
          <div
            className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.03] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
            style={{ backgroundColor: theme.primary }}
          />

          {/* Optional Title */}
          {title && (
            <div className="mb-12 relative z-10">
              <ProseMirrorEditor
                key={`${block.id}-title`}
                blockId={`${block.id}-title`}
                value={title}
                onChange={handleTitleChange}
                placeholder="Timeline title"
                className="text-2xl font-black tracking-tighter"
                theme={theme}
                readOnly={readOnly}
              />
              <div 
                className="w-12 h-1 rounded-full mt-4"
                style={{ backgroundColor: `${theme.primary}20` }}
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
});

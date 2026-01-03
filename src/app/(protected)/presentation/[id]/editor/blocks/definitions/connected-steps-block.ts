import { nanoid } from "@reduxjs/toolkit";
import { 
  Block, 
  BlockType, 
  ConnectedStepsContent, 
  ConnectedStepsItem,
  getDefaultHeadingContent 
} from "@/types/presentation";

export const createConnectedStepItem = (index: number = 0): ConnectedStepsItem => ({
  id: nanoid(),
  title: index === -1 ? "" : `Step ${index + 1}`,
  description: "This is a placeholder description. You can edit this text to provide more details about this specific step in the process.",
});

export const createConnectedStepsContent = (): ConnectedStepsContent => ({
  type: "connected-steps-block",
  items: [
    createConnectedStepItem(0),
    createConnectedStepItem(1),
    createConnectedStepItem(2),
  ],
});

export const normalizeConnectedStepsContent = (content: unknown): ConnectedStepsContent => {
  const defaultContent = createConnectedStepsContent();
  if (!content || typeof content !== "object") return defaultContent;
  
  const c = content as Partial<ConnectedStepsContent>;
  if (c.type !== "connected-steps-block") return defaultContent;

  const items = Array.isArray(c.items) 
    ? c.items.map((item: any) => ({
        id: item.id || nanoid(),
        title: item.title || getDefaultHeadingContent(),
        description: item.description || getDefaultHeadingContent(),
      }))
    : defaultContent.items;

  return {
    type: "connected-steps-block",
    items,
  };
};

export const createConnectedStepsBlock = (): Block => {
  return {
    id: nanoid(),
    type: "connected-steps-block" as BlockType,
    content: createConnectedStepsContent(),
  };
};

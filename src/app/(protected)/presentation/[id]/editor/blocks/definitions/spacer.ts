import { SpacerContent } from "@/types/presentation";

export const createSpacerContent = (height: number = 64): SpacerContent => ({
  type: "spacer",
  height,
});

export const normalizeSpacerContent = (content: any): SpacerContent => {
  const incoming = content as SpacerContent | undefined;
  return {
    type: "spacer",
    height: typeof incoming?.height === "number" ? incoming.height : 64,
  };
};

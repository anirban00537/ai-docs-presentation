export interface DividerContent {
  type: "divider";
  style?: "solid" | "dashed" | "dotted" | "double";
  spacing?: "small" | "medium" | "large";
}

export const createDividerContent = (): DividerContent => ({
  type: "divider",
  style: "solid",
  spacing: "medium",
});

export const normalizeDividerContent = (content: any): DividerContent => {
  const incoming = content as DividerContent | undefined;
  if (incoming) {
    return {
      type: "divider",
      style: incoming.style ?? "solid",
      spacing: incoming.spacing ?? "medium",
    };
  }
  return createDividerContent();
};


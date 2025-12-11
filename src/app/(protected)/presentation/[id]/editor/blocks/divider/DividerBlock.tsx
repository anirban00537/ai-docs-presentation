import React from "react";
import type { Block, Theme } from "@/lib/editor/types";
import { createDividerContent, type DividerContent } from "../definitions";

interface DividerBlockProps {
  block: Block;
  onUpdate: (content: DividerContent) => void;
  theme: Theme;
  placeholder?: string;
}

const applyAlpha = (hex: string, alpha: number): string => {
  const raw = hex?.replace("#", "");
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.substring(0, 2), 16);
  const g = parseInt(raw.substring(2, 4), 16);
  const b = parseInt(raw.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const DividerBlock: React.FC<DividerBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = block.content as DividerContent;
  const style = content?.style ?? "solid";
  const spacing = content?.spacing ?? "medium";

  const spacingMap = {
    small: "py-4",
    medium: "py-8",
    large: "py-12",
  };

  const borderStyleMap = {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
    double: "double",
  };

  return (
    <div
      className={`w-full h-full ${spacingMap[spacing]} flex items-center justify-center`}
    >
      {style === "double" ? (
        <div className="w-full flex flex-col gap-2">
          <div
            className="w-full h-0.5"
            style={{
              borderTop: `2px ${borderStyleMap[style]} ${applyAlpha(
                theme.primary,
                0.3
              )}`,
            }}
          />
          <div
            className="w-full h-0.5"
            style={{
              borderTop: `2px ${borderStyleMap[style]} ${applyAlpha(
                theme.primary,
                0.3
              )}`,
            }}
          />
        </div>
      ) : (
        <div
          className="w-full"
          style={{
            borderTop: `1px ${borderStyleMap[style]} ${applyAlpha(
              theme.primary,
              0.2
            )}`,
          }}
        />
      )}
    </div>
  );
};

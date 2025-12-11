import React from "react";
import type { Block, Theme } from "@/lib/editor/types";
import { createDividerContent, type DividerContent } from "../definitions";
import { withAlpha } from "../utils";

interface DividerBlockProps {
  block: Block;
  onUpdate: (content: DividerContent) => void;
  theme: Theme;
  placeholder?: string;
}

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
        <div className="w-full flex flex-col gap-1.5 opacity-60">
          <div
            className="w-full h-px"
            style={{
              backgroundColor: withAlpha(theme.primary, 0.3),
            }}
          />
          <div
            className="w-full h-px"
            style={{
               backgroundColor: withAlpha(theme.primary, 0.3),
            }}
          />
        </div>
      ) : (
        <div
          className="w-full opacity-60"
          style={{
            borderTop: `1px ${borderStyleMap[style]} ${withAlpha(
              theme.primary,
              0.3
            )}`,
          }}
        />
      )}
    </div>
  );
};


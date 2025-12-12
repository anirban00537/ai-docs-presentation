import React, { useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createLogoGridContent, type LogoGridContent } from "../definitions";
import { withAlpha } from "../utils";

interface LogoGridBlockProps {
  block: Block;
  onUpdate: (content: LogoGridContent) => void;
  theme: Theme;
  placeholder?: string;
}

export const LogoGridBlock: React.FC<LogoGridBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = (block.content as LogoGridContent) ?? createLogoGridContent();
  const { logos, columns, grayscale = true } = content;

  const handleNameChange = useCallback(
    (index: number, newContent: any) => {
      const newLogos = [...logos];
      newLogos[index] = {
        ...newLogos[index],
        name: newContent,
      };
      onUpdate({
        ...content,
        logos: newLogos,
      });
    },
    [logos, content, onUpdate]
  );

  const gridClass =
    columns === 3
      ? "grid-cols-3"
      : columns === 4
      ? "grid-cols-4"
      : columns === 5
      ? "grid-cols-5"
      : "grid-cols-6";

  return (
    <div
      className={`grid ${gridClass} gap-8 w-full`}
      style={{
        padding: "2rem",
      }}
    >
      {logos.map((logo, index) => (
        <div
          key={index}
          className="group flex items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.5),
            backdropFilter: "blur(8px)",
            border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
          }}
        >
          {logo.image ? (
            <img
              src={logo.image}
              alt=""
              className={`max-w-full max-h-16 object-contain transition-all duration-300 ${
                grayscale ? "grayscale group-hover:grayscale-0" : ""
              }`}
            />
          ) : (
            <div className="w-full">
              <ProseMirrorEditor
                key={`${block.id}-logo-${index}`}
                blockId={`${block.id}-logo-${index}`}
                value={logo.name}
                onChange={(newContent) => handleNameChange(index, newContent)}
                placeholder="Company Name"
                className="text-center font-semibold text-sm opacity-70"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

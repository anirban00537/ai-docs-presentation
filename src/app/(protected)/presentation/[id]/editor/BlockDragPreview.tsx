"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  IconFileText,
  IconHash,
  IconMessageCircle,
  IconTarget,
  IconQuote,
  IconTimeline,
} from "@tabler/icons-react";
import { Theme, Block } from "@/store/slices/slidesSlice";

const getBlockTypeIcon = (type: string) => {
  switch (type) {
    case "number-card":
      return <IconHash size={16} />;
    case "testimonial":
      return <IconMessageCircle size={16} />;
    case "cta":
      return <IconTarget size={16} />;
    case "quote":
      return <IconQuote size={16} />;
    case "timeline":
      return <IconTimeline size={16} />;
    default:
      return <IconFileText size={16} />;
  }
};

const getBlockTypeLabel = (type: string) => {
  switch (type) {
    case "number-card":
      return "Number Card";
    case "testimonial":
      return "Testimonial";
    case "cta":
      return "CTA Banner";
    case "quote":
      return "Quote";
    case "timeline":
      return "Timeline";
    case "prosemirror":
      return "Text Block";
    default:
      return type;
  }
};

interface BlockDragPreviewProps {
  block?: Block | null;
  blockType?: string | null;
  theme: Theme;
}

export const BlockDragPreview: React.FC<BlockDragPreviewProps> = ({
  block,
  blockType,
  theme,
}) => {
  const isDark = theme.themeType === "dark";
  const type = block?.type || blockType || "prosemirror";

  if (!block && !blockType) return null;

  return (
    <motion.div
      initial={{ scale: block ? 0.95 : 0.9, opacity: block ? 0.8 : 0 }}
      animate={{ scale: 1, opacity: 0.95 }}
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: isDark
          ? "rgba(30, 30, 35, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        maxWidth: block ? "280px" : undefined,
      }}
    >
      <div className="px-3 py-2.5 flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{
            backgroundColor: `${theme.primary}15`,
            color: theme.primary,
          }}
        >
          {getBlockTypeIcon(type)}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-medium"
            style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
          >
            {getBlockTypeLabel(type)}
          </div>
        </div>
      </div>
      {/* Subtle accent line */}
      <div
        className="h-0.5 w-full"
        style={{ backgroundColor: theme.primary }}
      />
    </motion.div>
  );
};

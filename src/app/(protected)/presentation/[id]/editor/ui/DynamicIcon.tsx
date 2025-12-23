"use client";

import React from "react";
import * as Icons from "@tabler/icons-react";

interface DynamicIconProps {
  name: string;
  size?: number | string;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * DynamicIcon renders a Tabler icon by name.
 * Standard format for icons is "IconRocket", "IconSettings", etc.
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  size = 24,
  stroke = 2,
  className = "",
  style = {},
}) => {
  if (!name) return null;

  // Check if it's a Tabler icon name
  const IconComponent = (Icons as any)[name];

  if (IconComponent) {
    return (
      <IconComponent
        size={size}
        stroke={stroke}
        className={className}
        style={style}
      />
    );
  }

  // Fallback to rendering as emoji or text
  return (
    <span
      className={className}
      style={{
        fontSize: typeof size === "number" ? `${size}px` : size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        ...style,
      }}
    >
      {name}
    </span>
  );
};

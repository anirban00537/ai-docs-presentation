import React from "react";
import { cn } from "@/lib/utils";

export const ToolbarSeparator: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        "h-5 w-px bg-black/10 rounded-full",
        className
      )}
    />
  );
};


import React from "react";
import { Edit2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Theme } from "@/lib/editor/types";


interface BlockWrapperProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onAdd?: () => void;
  className?: string;
  hideEditButton?: boolean;
  theme?: Theme;
  customControls?: React.ReactNode;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  children,
  onEdit,
  onAdd,
  className = "",
  hideEditButton = false,
  theme,
  customControls,
}) => {
  const buttonStyle = theme
    ? {
        backgroundColor: theme.primary,
        color: "#ffffff",
        border: "none",
      }
    : {};

  return (
    <div className={cn("relative group w-full h-full", className)}>
      {/* Content */}
      {children}

      {/* Hover Controls */}
      <div className="absolute top-4 right-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto flex gap-2">
        {customControls}
        {!hideEditButton && onAdd && (
           <Button
            variant={theme ? "default" : "secondary"}
            size="sm"
            className={cn(
              "shadow-lg backdrop-blur-md transition-all transform hover:scale-105 px-3",
              !theme && "bg-background/80 hover:bg-background border"
            )}
            style={buttonStyle}
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            title="Add Item"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
        {!hideEditButton && onEdit && (
          <Button
            variant={theme ? "default" : "secondary"}
            size="sm"
            className={cn(
               "shadow-lg backdrop-blur-md transition-all transform hover:scale-105",
               !theme && "bg-background/80 hover:bg-background border"
            )}
            style={buttonStyle}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit2 className="w-3.5 h-3.5 mr-2" />
            Edit Block
          </Button>
        )}
      </div>
    </div>
  );
};

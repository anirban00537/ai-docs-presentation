import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

interface DraggableBlockOptionProps {
  id: string;
  blockType: string;
  icon: React.ReactNode;
  label: string;
}

export const DraggableBlockOption: React.FC<DraggableBlockOptionProps> = ({
  id,
  blockType,
  icon,
  label,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { type: "block-option", blockType },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all"
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = `${theme.primary}10`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
        style={{
          backgroundColor: isDragging ? `${theme.primary}20` : `${theme.primary}10`,
          color: theme.primary,
        }}
      >
        {icon}
      </div>
      <span
        className="text-[11px] font-medium text-center leading-tight"
        style={{ color: isDark ? "#e5e7eb" : "#374151" }}
      >
        {label}
      </span>
    </div>
  );
};

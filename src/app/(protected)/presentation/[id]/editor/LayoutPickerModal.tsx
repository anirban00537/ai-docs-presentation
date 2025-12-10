import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { layoutTemplates, type LayoutTemplate } from "./layoutTemplates";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

interface LayoutPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayout: (template: LayoutTemplate) => void;
}

export const LayoutPickerModal: React.FC<LayoutPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLayout,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#cbd5e1" : "#475569";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const accent = isDark ? "#60a5fa" : "#2563eb";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[80vh] overflow-y-auto"
        style={{
          backgroundColor: isDark ? "rgba(12,12,14,0.95)" : theme.cardBackground,
          borderColor: borderColor,
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: textPrimary }}>Choose a Layout</DialogTitle>
          <DialogDescription style={{ color: textSecondary }}>
            Select a layout template to apply to your slide
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {layoutTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onSelectLayout(template);
                onClose();
              }}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.8)",
                borderColor: borderColor,
                color: textPrimary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.backgroundColor = isDark
                  ? "rgba(96,165,250,0.1)"
                  : "rgba(37,99,235,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = borderColor;
                e.currentTarget.style.backgroundColor = isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.8)";
              }}
            >
              <div className="text-4xl">{template.icon}</div>
              <div className="text-center">
                <div
                  className="font-medium text-sm"
                  style={{ color: textPrimary }}
                >
                  {template.name}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: textSecondary, opacity: 0.7 }}
                >
                  {template.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};


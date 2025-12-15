import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  layoutTemplates,
  layoutIconsMap,
  type LayoutTemplate,
} from "./layoutTemplates";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { motion } from "framer-motion";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl max-h-[85vh] overflow-hidden p-0"
        style={{
          backgroundColor: isDark ? "rgba(20,20,24,0.98)" : "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
          border: "none",
        }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle
            className="text-lg font-medium"
            style={{ color: isDark ? "#fff" : "#000" }}
          >
            Choose a Layout
          </DialogTitle>
          <p
            className="text-sm mt-1 opacity-50"
            style={{ color: isDark ? "#fff" : "#000" }}
          >
            Select a template for your new slide
          </p>
        </DialogHeader>

        {/* Layouts Grid */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {layoutTemplates.map((template, index) => (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => {
                  onSelectLayout(template);
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.primary}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${theme.primary}15`,
                    color: theme.primary,
                  }}
                >
                  {(() => {
                    const IconComponent = layoutIconsMap[template.id];
                    if (IconComponent) {
                      return <IconComponent size={24} stroke={1.5} />;
                    }
                    return (
                      <span className="text-2xl">
                        {typeof template.icon === "string" ? template.icon : "📄"}
                      </span>
                    );
                  })()}
                </div>

                {/* Label */}
                <span
                  className="text-xs font-medium text-center leading-tight"
                  style={{ color: isDark ? "#e5e7eb" : "#374151" }}
                >
                  {template.name}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Demo Button - Smaller and subtle */}
          <div className="mt-6 pt-4 border-t flex justify-center" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
            <button
              onClick={async () => {
                onClose();
                for (let i = 0; i < layoutTemplates.length; i++) {
                  onSelectLayout(layoutTemplates[i]);
                  await new Promise((resolve) => setTimeout(resolve, 300));
                }
              }}
              className="text-xs font-medium px-4 py-2 rounded-lg transition-all opacity-50 hover:opacity-100"
              style={{ color: isDark ? "#fff" : "#000" }}
            >
              Insert all templates (demo)
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

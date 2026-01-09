import React from "react";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BlockOption } from "../block-ui/BlockOption";
import type { BlockType } from "@/types/presentation";
import { BLOCK_DEFINITIONS } from "../engine";

interface BlockLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LibraryItem {
  type: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  category: "Core" | "Callouts" | "Cards & Boxes" | "Interactive" | "Format" | "Data";
  initialContent?: any;
}

const generateLibraryItems = (): LibraryItem[] => {
  return Object.values(BLOCK_DEFINITIONS).flatMap((def) => {
    // If definition has presets, use them
    if (def.presets && def.presets.length > 0) {
      return def.presets.map((preset) => {
        const Icon = preset.icon || def.icon;
        return {
          type: def.type,
          icon: Icon ? <Icon size={18} /> : null,
          label: preset.label,
          description: preset.description,
          category: def.category,
          initialContent: preset.createContent(),
        };
      });
    }

    // Otherwise use the definition itself
    const Icon = def.icon;
    return [{
      type: def.type,
      icon: Icon ? <Icon size={18} /> : null,
      label: def.label,
      description: def.description,
      category: def.category,
      initialContent: def.createContent(),
    }];
  });
};

const blockDefinitions = generateLibraryItems();


export const BlockLibraryPanel: React.FC<BlockLibraryPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const panelVariants = {
    hidden: {
      opacity: 0,
      x: 20,
      scale: 0.98,
      transition: { duration: 0.15 },
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.98,
      transition: { duration: 0.15 },
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="blocks-panel"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={panelVariants}
          className="relative z-40"
        >
          <div
            className="relative w-[380px] max-h-[75vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundColor: isDark
                ? "rgba(30, 30, 40, 0.5)"
                : "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              boxShadow: isDark
                ? `
                  0 1px 0 0 rgba(255, 255, 255, 0.1) inset,
                  0 -1px 0 0 rgba(0, 0, 0, 0.2) inset,
                  0 8px 40px rgba(0, 0, 0, 0.4),
                  0 2px 8px rgba(0, 0, 0, 0.2)
                `
                : `
                  0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
                  0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
                  0 8px 40px rgba(0, 0, 0, 0.08),
                  0 2px 8px rgba(0, 0, 0, 0.04)
                `,
            }}
          >
            {/* Glass shine overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.02) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.3) 100%)",
              }}
            />

            {/* Header */}
            <div className="relative px-4 py-3 flex items-center justify-between shrink-0">
              <span
                className="text-sm font-medium"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                Add Block
              </span>
              <button
                className="p-1.5 rounded-lg transition-all opacity-50 hover:opacity-100"
                onClick={onClose}
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Blocks Grid */}
            <div
              className={`relative flex-1 overflow-y-auto px-3 pb-3 ${isDark ? "custom-scrollbar-dark" : "custom-scrollbar-light"
                }`}
            >
              <p
                className="text-[11px] font-medium mb-2 px-1 opacity-50"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                Drag to add to your slide
              </p>
              <div className="space-y-6">
                {Array.from(new Set(blockDefinitions.map(b => b.category))).map(category => (
                  <div key={category}>
                    <h3
                      className="text-[10px] uppercase tracking-wider font-semibold mb-2 px-1 opacity-40 font-mono"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    >
                      {category}
                    </h3>
                    <div className="grid grid-cols-4 gap-1">
                      {blockDefinitions
                        .filter(b => b.category === category)
                        .map((block, index) => (
                          <BlockOption
                            key={`${block.type}-${index}`}
                            id={`block-option-${block.type}-${index}`}
                            blockType={block.type}
                            icon={block.icon}
                            label={block.label}
                            initialContent={block.initialContent}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

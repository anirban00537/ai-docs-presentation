import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectTheme,
  setTheme,
  Theme,
  DEFAULT_THEME,
} from "@/store/slices/slidesSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThemePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Predefined theme palettes
const THEME_PALETTES: Array<{ name: string; theme: Theme }> = [
  {
    name: "Default",
    theme: {
      primary: "#2B0AFF",
      headingColor: "#000000",
      bodyColor: "#272525",
      cardBackground: "#FFFFFF",
      pageBackground: "#F9FAFB",
      fontFamily: "Space Grotesk",
    },
  },
  {
    name: "Ocean",
    theme: {
      primary: "#0066CC",
      headingColor: "#0A2540",
      bodyColor: "#1A365D",
      cardBackground: "#FFFFFF",
      pageBackground: "#E6F2FF",
      fontFamily: "Outfit",
    },
  },
  {
    name: "Forest",
    theme: {
      primary: "#059669",
      headingColor: "#064E3B",
      bodyColor: "#065F46",
      cardBackground: "#FFFFFF",
      pageBackground: "#ECFDF5",
      fontFamily: "DM Sans",
    },
  },
  {
    name: "Sunset",
    theme: {
      primary: "#EA580C",
      headingColor: "#7C2D12",
      bodyColor: "#9A3412",
      cardBackground: "#FFFFFF",
      pageBackground: "#FFF7ED",
      fontFamily: "Plus Jakarta Sans",
    },
  },
  {
    name: "Purple",
    theme: {
      primary: "#7C3AED",
      headingColor: "#4C1D95",
      bodyColor: "#5B21B6",
      cardBackground: "#FFFFFF",
      pageBackground: "#F5F3FF",
      fontFamily: "Manrope",
    },
  },
  {
    name: "Rose",
    theme: {
      primary: "#E11D48",
      headingColor: "#881337",
      bodyColor: "#9F1239",
      cardBackground: "#FFFFFF",
      pageBackground: "#FFF1F2",
      fontFamily: "Work Sans",
    },
  },
  {
    name: "Dark",
    theme: {
      primary: "#8B5CF6",
      headingColor: "#FFFFFF",
      bodyColor: "#E5E7EB",
      cardBackground: "#1F2937",
      pageBackground: "#111827",
      fontFamily: "Ubuntu",
    },
  },
  {
    name: "Minimal",
    theme: {
      primary: "#000000",
      headingColor: "#000000",
      bodyColor: "#4B5563",
      cardBackground: "#FFFFFF",
      pageBackground: "#FAFAFA",
      fontFamily: "Open Sans",
    },
  },
  {
    name: "Midnight",
    theme: {
      primary: "#6366F1",
      headingColor: "#F8FAFC",
      bodyColor: "#CBD5E1",
      cardBackground: "#0F172A",
      pageBackground: "#020617",
      fontFamily: "Space Grotesk",
    },
  },
  {
    name: "Noir",
    theme: {
      primary: "#EC4899",
      headingColor: "#FFFFFF",
      bodyColor: "#D1D5DB",
      cardBackground: "#18181B",
      pageBackground: "#09090B",
      fontFamily: "Outfit",
    },
  },
  {
    name: "Cyber",
    theme: {
      primary: "#10B981",
      headingColor: "#F0FDF4",
      bodyColor: "#A7F3D0",
      cardBackground: "#064E3B",
      pageBackground: "#022C22",
      fontFamily: "DM Sans",
    },
  },
  {
    name: "Eclipse",
    theme: {
      primary: "#F59E0B",
      headingColor: "#FFFBEB",
      bodyColor: "#FDE68A",
      cardBackground: "#78350F",
      pageBackground: "#451A03",
      fontFamily: "Plus Jakarta Sans",
    },
  },
  {
    name: "Obsidian",
    theme: {
      primary: "#8B5CF6",
      headingColor: "#FAF5FF",
      bodyColor: "#E9D5FF",
      cardBackground: "#3B1F5C",
      pageBackground: "#1A0B2E",
      fontFamily: "Manrope",
    },
  },
  {
    name: "Twilight",
    theme: {
      primary: "#06B6D4",
      headingColor: "#ECFEFF",
      bodyColor: "#A5F3FC",
      cardBackground: "#083344",
      pageBackground: "#020617",
      fontFamily: "Work Sans",
    },
  },
  {
    name: "Neon",
    theme: {
      primary: "#F472B6",
      headingColor: "#FDF2F8",
      bodyColor: "#FBCFE8",
      cardBackground: "#831843",
      pageBackground: "#500724",
      fontFamily: "Sora",
    },
  },
  {
    name: "Carbon",
    theme: {
      primary: "#64748B",
      headingColor: "#F1F5F9",
      bodyColor: "#CBD5E1",
      cardBackground: "#1E293B",
      pageBackground: "#0F172A",
      fontFamily: "Geist",
    },
  },
];

export const ThemePanel: React.FC<ThemePanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme) || DEFAULT_THEME;

  // Animation variants
  const panelVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeInOut" as const },
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeInOut" as const },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (!isOpen) return null;

  const handleThemeSelect = (selectedTheme: Theme) => {
    dispatch(setTheme(selectedTheme));
  };

  const isThemeActive = (paletteTheme: Theme) => {
    return (
      paletteTheme.primary === currentTheme.primary &&
      paletteTheme.headingColor === currentTheme.headingColor &&
      paletteTheme.bodyColor === currentTheme.bodyColor &&
      paletteTheme.cardBackground === currentTheme.cardBackground &&
      paletteTheme.pageBackground === currentTheme.pageBackground
    );
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="theme-panel"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={panelVariants}
          className="absolute right-full top-1/2 -translate-y-1/2 mr-4 z-50 origin-right"
        >
          <Card
            className="w-80 overflow-hidden border shadow-2xl backdrop-blur-3xl rounded-3xl"
            style={{
              backgroundColor: `${currentTheme.cardBackground}aa`, // 66% opacity for glass effect
              borderColor: `${currentTheme.bodyColor}20`,
            }}
          >
            <CardHeader
              className="flex flex-row items-center justify-between p-4 pb-2 space-y-0 border-b"
              style={{
                borderColor: `${currentTheme.bodyColor}10`,
              }}
            >
              <CardTitle
                className="text-sm font-semibold"
                style={{ color: currentTheme.headingColor }}
              >
                Themes
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6 rounded-full transition-colors"
                style={{
                  color: currentTheme.bodyColor,
                }}
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-2 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <div className="flex flex-col gap-1">
                {THEME_PALETTES.map((palette) => {
                  const isActive = isThemeActive(palette.theme);
                  return (
                    <motion.div key={palette.name} variants={itemVariants}>
                      <button
                        onClick={() => handleThemeSelect(palette.theme)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group relative",
                          !isActive && "hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                        style={
                          isActive
                            ? {
                                backgroundColor: `${currentTheme.primary}15`, // 10% opacity
                              }
                            : undefined
                        }
                      >
                        {/* Theme Name & Status */}
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full transition-all duration-300",
                              isActive ? "scale-125" : "bg-transparent"
                            )}
                            style={
                              isActive
                                ? { backgroundColor: currentTheme.primary }
                                : undefined
                            }
                          />
                          <span
                            className="text-sm font-medium transition-colors"
                            style={{
                              color: isActive
                                ? currentTheme.headingColor
                                : currentTheme.bodyColor,
                              opacity: isActive ? 1 : 0.8,
                            }}
                          >
                            {palette.name}
                          </span>
                        </div>

                        {/* Theme Preview Mini-UI */}
                        <div className="flex items-center gap-1.5">
                          {/* Page Background Circle */}
                          <div
                            className="w-5 h-5 rounded-full border shadow-sm flex items-center justify-center overflow-hidden"
                            style={{
                              backgroundColor: palette.theme.pageBackground,
                              borderColor: `${currentTheme.bodyColor}20`,
                            }}
                            title="Page Background"
                          >
                            <div
                              className="w-2 h-2 rounded-full opacity-80"
                              style={{
                                backgroundColor: palette.theme.bodyColor,
                              }}
                            />
                          </div>

                          {/* Primary Color Badge */}
                          <div
                            className="w-5 h-5 rounded-full border shadow-sm"
                            style={{
                              backgroundColor: palette.theme.primary,
                              borderColor: `${currentTheme.bodyColor}20`,
                            }}
                            title="Primary Color"
                          />

                          {/* Checkmark for Active State */}
                          <div className="w-5 flex items-center justify-center">
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 20,
                                }}
                              >
                                <Check
                                  className="w-4 h-4"
                                  style={{ color: currentTheme.primary }}
                                />
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

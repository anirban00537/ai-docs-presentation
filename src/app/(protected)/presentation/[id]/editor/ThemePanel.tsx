import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectTheme,
  setTheme,
  Theme,
  DEFAULT_THEME,
} from "@/store/slices/slidesSlice";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getAdminThemes } from "@/services/themes";

interface ThemePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemePanel: React.FC<ThemePanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = currentTheme.themeType === "dark";
  const accent = isDark ? "#60a5fa" : "#2563eb"; // tailwind blue-400 / blue-600
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#cbd5e1" : "#475569";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const [themes, setThemes] = useState<Array<{ name: string; theme: Theme }>>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch themes from API
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setIsLoading(true);
        const response = await getAdminThemes();

        if (
          response.success &&
          response.data?.list &&
          Array.isArray(response.data.list)
        ) {
          const themePalettes = response.data.list
            .map((theme: any) => {
              const themeDataObj = (theme.themeData as Theme) || {};
              const themeData: Theme = {
                ...DEFAULT_THEME,
                ...themeDataObj,
              };

              return {
                name: theme.name || "Unnamed Theme",
                theme: themeData,
              };
            })
            .filter((palette) => palette && palette.theme && palette.name); // Filter out any invalid entries

          if (themePalettes.length > 0) {
            setThemes(themePalettes);
          } else {
            console.warn(
              "No valid themes found after processing. Response:",
              response
            );
            setThemes([
              {
                name: "Default",
                theme: DEFAULT_THEME,
              },
            ]);
          }
        } else {
          console.warn("No themes found in response:", response);
          setThemes([
            {
              name: "Default",
              theme: DEFAULT_THEME,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch themes:", error);
        // Fallback to default themes if API fails
        setThemes([
          {
            name: "Default",
            theme: DEFAULT_THEME,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchThemes();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleThemeSelect = (selectedTheme: Theme) => {
    // Update Redux state - middleware will handle API call
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
          className="absolute right-full top-1/2 -translate-y-1/2 mr-4 z-40 origin-right"
        >
          <div
            className="w-80 h-[600px] max-h-[80vh] flex flex-col rounded-xl backdrop-blur-sm overflow-hidden"
            style={{
              backgroundColor: isDark
                ? "rgba(12,12,14,0.9)"
                : currentTheme.cardBackground + "E6",
              border: `1px solid ${borderColor}`,
            }}
          >
            {/* Header */}
            <div
              className="px-3 py-2.5 flex items-center justify-between gap-1"
              style={{
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              {/* Title */}
              <div
                className="text-sm font-medium px-1"
                style={{ color: textPrimary }}
              >
                Themes
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-transparent"
                  onClick={onClose}
                  style={{
                    color: textPrimary,
                    opacity: 0.5,
                  }}
                  aria-label="Close"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>
            {/* Themes List */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar custom-scrollbar-light">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <span
                    className="text-sm"
                    style={{ color: textPrimary, opacity: 0.6 }}
                  >
                    Loading themes...
                  </span>
                </div>
              ) : themes.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <span
                    className="text-sm"
                    style={{ color: textPrimary, opacity: 0.6 }}
                  >
                    No themes available
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {themes.map((palette, index) => {
                    const isActive = isThemeActive(palette.theme);
                    return (
                      <motion.div
                        key={`${palette.name}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                      >
                        <button
                          onClick={() => handleThemeSelect(palette.theme)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group relative"
                          )}
                          style={{
                            backgroundColor: isActive
                              ? "rgba(37,99,235,0.12)"
                              : "transparent",
                            color: isActive ? textPrimary : textSecondary,
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = isDark
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(148,163,184,0.12)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }
                          }}
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
                                opacity: 1,
                                fontWeight: isActive ? 600 : 500,
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
                                borderColor: borderColor,
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
                                borderColor: borderColor,
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
                                    style={{ color: accent }}
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
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

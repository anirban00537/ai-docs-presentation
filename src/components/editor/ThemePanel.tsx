import React, { useEffect, useState } from "react";
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
import { getAdminThemes } from "@/services/themes";

interface ThemePanelProps {
  isOpen: boolean;
  onClose: () => void;
  presentationId?: string | null;
}

export const ThemePanel: React.FC<ThemePanelProps> = ({
  isOpen,
  onClose,
  presentationId,
}) => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme) || DEFAULT_THEME;
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
              // Extract themeData object (could be Theme type or plain object)
              const themeDataObj = (theme.themeData as any) || {};

              // Build theme object with fallbacks
              const themeData: Theme = {
                primary:
                  themeDataObj.primary ||
                  theme.primary ||
                  DEFAULT_THEME.primary,
                headingColor:
                  themeDataObj.headingColor ||
                  theme.headingColor ||
                  DEFAULT_THEME.headingColor,
                bodyColor:
                  themeDataObj.bodyColor ||
                  theme.bodyColor ||
                  DEFAULT_THEME.bodyColor,
                cardBackground:
                  themeDataObj.cardBackground ||
                  theme.cardBackground ||
                  DEFAULT_THEME.cardBackground,
                pageBackground:
                  themeDataObj.pageBackground ||
                  theme.pageBackground ||
                  DEFAULT_THEME.pageBackground,
                fontFamily:
                  themeDataObj.fontFamily ||
                  theme.fontFamily ||
                  DEFAULT_THEME.fontFamily,
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
          className="absolute right-full top-1/2 -translate-y-1/2 mr-4 z-50 origin-right"
        >
          <Card
            className="w-80 overflow-hidden border shadow-2xl backdrop-blur-3xl rounded-3xl"
            style={{
              backgroundColor: currentTheme.cardBackground,
              borderColor: `${currentTheme.primary}20`,
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <span
                    className="text-sm"
                    style={{ color: currentTheme.bodyColor, opacity: 0.6 }}
                  >
                    Loading themes...
                  </span>
                </div>
              ) : themes.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <span
                    className="text-sm"
                    style={{ color: currentTheme.bodyColor, opacity: 0.6 }}
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
                              ? `${currentTheme.primary}15`
                              : "transparent",
                            color: isActive
                              ? currentTheme.headingColor
                              : currentTheme.bodyColor,
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = `${currentTheme.bodyColor}10`;
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
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

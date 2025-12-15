import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectTheme,
  setTheme,
  Theme,
  DEFAULT_THEME,
} from "@/store/slices/slidesSlice";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminThemes } from "@/services/themes";

interface ThemePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemePanel: React.FC<ThemePanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = currentTheme.themeType === "dark";
  const [themes, setThemes] = useState<Array<{ name: string; theme: Theme }>>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            .filter((palette) => palette && palette.theme && palette.name);

          if (themePalettes.length > 0) {
            setThemes(themePalettes);
          } else {
            setThemes([{ name: "Default", theme: DEFAULT_THEME }]);
          }
        } else {
          setThemes([{ name: "Default", theme: DEFAULT_THEME }]);
        }
      } catch (error) {
        console.error("Failed to fetch themes:", error);
        setThemes([{ name: "Default", theme: DEFAULT_THEME }]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchThemes();
    }
  }, [isOpen]);

  const panelVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.98 },
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
          transition={{ duration: 0.15 }}
          className="relative z-40"
        >
          <div
            className="w-72 max-h-[75vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundColor: isDark ? "rgba(20,20,24,0.98)" : "rgba(255,255,255,0.98)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span
                className="text-sm font-medium"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                Themes
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-all opacity-50 hover:opacity-100"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Themes List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <span
                    className="text-sm opacity-50"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    Loading...
                  </span>
                </div>
              ) : themes.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <span
                    className="text-sm opacity-50"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    No themes available
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  {themes.map((palette, index) => {
                    const isActive = isThemeActive(palette.theme);
                    return (
                      <motion.button
                        key={`${palette.name}-${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleThemeSelect(palette.theme)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl transition-all"
                        style={{
                          backgroundColor: isActive ? `${currentTheme.primary}15` : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = isDark
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.03)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        {/* Theme Name & Colors */}
                        <div className="flex items-center gap-2.5">
                          {/* Color Previews */}
                          <div className="flex -space-x-1">
                            <div
                              className="w-5 h-5 rounded-full border-2"
                              style={{
                                backgroundColor: palette.theme.pageBackground,
                                borderColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.8)",
                              }}
                            />
                            <div
                              className="w-5 h-5 rounded-full border-2"
                              style={{
                                backgroundColor: palette.theme.primary,
                                borderColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.8)",
                              }}
                            />
                          </div>
                          
                          <span
                            className="text-sm"
                            style={{
                              color: isDark ? "#e5e7eb" : "#374151",
                              fontWeight: isActive ? 500 : 400,
                            }}
                          >
                            {palette.name}
                          </span>
                        </div>

                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <Check size={16} style={{ color: currentTheme.primary }} />
                          </motion.div>
                        )}
                      </motion.button>
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

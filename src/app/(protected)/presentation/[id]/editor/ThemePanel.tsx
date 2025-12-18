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
import { applyCardStylePreset } from "@/lib/editor/card-styles";

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
  const [activeTab, setActiveTab] = useState<"presets" | "customize">("presets");

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

  const updateThemeProperty = (updates: Partial<Theme>) => {
    dispatch(setTheme({ ...currentTheme, ...updates }));
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

  const cardStyleOptions = [
    { id: "standard", label: "Standard", desc: "Subtle rounding and shadows" },
    { id: "flat", label: "Flat", desc: "Clean design with no borders" },
    { id: "outline", label: "Outline", desc: "Outlined boxes with hard edges" },
    { id: "sharp", label: "Sharp", desc: "Flat design with sharp edges" },
    { id: "blocky", label: "Blocky", desc: "Square cards with a 3D effect" },
    { id: "glass", label: "Glass", desc: "Soft and transparent" },
    { id: "rounded", label: "Rounded", desc: "Gentle, inviting corners" },
    { id: "soft-cloud", label: "Soft Cloud", desc: "Soft shadows with subtle contrast" },
    { id: "capsule", label: "Capsule", desc: "Rounded corners with playful blocks" },
  ];

  const getPreviewStyles = (styleId: string): React.CSSProperties => {
    const primary = currentTheme.primary;
    switch (styleId) {
      case "standard": return { borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.05)" };
      case "flat": return { borderRadius: "3px", border: "none" };
      case "outline": return { borderRadius: "2px", border: `1.5px solid ${primary}` };
      case "sharp": return { borderRadius: "0px", border: "1px solid rgba(0,0,0,0.1)" };
      case "blocky": return { borderRadius: "0px", boxShadow: `2px 2px 0px ${primary}`, border: `1.5px solid ${primary}` };
      case "glass": return { borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.4)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.5)" };
      case "rounded": return { borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" };
      case "soft-cloud": return { borderRadius: "6px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", border: "none" };
      case "capsule": return { borderRadius: "14px", boxShadow: `2px 2px 0px ${primary}`, border: `1.5px solid ${primary}` };
      default: return {};
    }
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
            className="relative w-80 max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundColor: isDark 
                ? "rgba(30, 30, 40, 0.7)" 
                : "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              boxShadow: isDark
                ? "0 8px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.1)"
                : "0 8px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0,0,0,0.05)",
            }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-sm font-semibold"
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  Design & Theme
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-all opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tab Switcher */}
              <div 
                className="flex p-1 rounded-xl gap-1 mb-2"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
              >
                <button
                  onClick={() => setActiveTab("presets")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === "presets" 
                      ? (isDark ? "bg-white/10 shadow-sm text-white" : "bg-white shadow-sm text-black")
                      : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                >
                  Presets
                </button>
                <button
                  onClick={() => setActiveTab("customize")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === "customize" 
                      ? (isDark ? "bg-white/10 shadow-sm text-white" : "bg-white shadow-sm text-black")
                      : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                >
                  Customize
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className={`flex-1 overflow-y-auto px-4 pb-6 ${isDark ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}`}>
              {activeTab === "presets" ? (
                /* THEMES LIST */
                <div className="space-y-1 py-2">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-40">
                      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: isDark ? "#fff" : "#000", borderTopColor: "transparent" }} />
                      <span className="text-xs" style={{ color: isDark ? "#fff" : "#000" }}>Loading palettes...</span>
                    </div>
                  ) : themes.map((palette, index) => {
                    const isActive = isThemeActive(palette.theme);
                    return (
                      <motion.button
                        key={`${palette.name}-${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => handleThemeSelect(palette.theme)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl transition-all"
                        style={{
                          backgroundColor: isActive ? `${currentTheme.primary}15` : "transparent",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-1.5">
                            <div className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: palette.theme.pageBackground, borderColor: isDark ? "#000" : "#fff" }} />
                            <div className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: palette.theme.primary, borderColor: isDark ? "#000" : "#fff" }} />
                            {(palette.theme.secondaryColors || []).map((color, colorIndex) => (
                              <div 
                                key={colorIndex}
                                className="w-5 h-5 rounded-full border-2" 
                                style={{ backgroundColor: color, borderColor: isDark ? "#000" : "#fff" }} 
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium" style={{ color: isDark ? "#e5e7eb" : "#374151" }}>{palette.name}</span>
                        </div>
                        {isActive && <Check size={14} style={{ color: currentTheme.primary }} />}
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                /* CUSTOMIZATION CONTROLS */
                <div className="py-2 space-y-6">
                  {/* Card Design Section */}
                  <div className="space-y-4">
                    <label className="text-[11px] uppercase tracking-wider font-bold opacity-50 block" style={{ color: isDark ? "#fff" : "#000" }}>Card Design</label>
                    <div className="grid grid-cols-3 gap-3">
                      {cardStyleOptions.map((opt) => {
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              const updatedTheme = applyCardStylePreset(currentTheme, opt.id);
                              dispatch(setTheme(updatedTheme));
                            }}
                            className="group relative flex flex-col items-center gap-2 p-1.5 rounded-2xl transition-all duration-300 hover:bg-neutral-500/5"
                          >
                            <div 
                              className="w-full aspect-[4/3] rounded-lg transition-all duration-300 flex items-center justify-center overflow-hidden border border-transparent"
                              style={{ 
                                backgroundColor: isDark ? "#121216" : "#f8fafc",
                              }}
                            >
                              <div 
                                className="w-[70%] h-[50%] bg-white border border-transparent transition-transform duration-300 group-hover:scale-110" 
                                style={{
                                  ...getPreviewStyles(opt.id),
                                  backgroundColor: opt.id === "glass" ? undefined : (isDark ? "#2a2a35" : "#fff"),
                                  borderColor: (opt.id === "outline" || opt.id === "blocky" || opt.id === "capsule") 
                                    ? currentTheme.primary 
                                    : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
                                }}
                              />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className={`text-[10px] font-bold ${isDark ? 'text-white/70' : 'text-neutral-700'}`}>{opt.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Design Pattern */}
                  <div className="space-y-3">
                    <label className="text-[11px] uppercase tracking-wider font-bold opacity-50 block" style={{ color: isDark ? "#fff" : "#000" }}>Background Pattern</label>
                    <div className="grid grid-cols-3 gap-2">
                       {["none", "dots", "grid", "mesh", "glass", "waves"].map((pattern) => (
                         <button
                           key={pattern}
                           onClick={() => updateThemeProperty({ cardDesignPattern: pattern })}
                           className={`py-2.5 px-3 text-[10px] capitalize rounded-xl border transition-all ${
                             currentTheme.cardDesignPattern === pattern
                               ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                               : "border-transparent bg-neutral-500/5 opacity-70 hover:opacity-100"
                           }`}
                           style={{ color: currentTheme.cardDesignPattern === pattern ? "inherit" : (isDark ? "#fff" : "#000") }}
                         >
                           {pattern}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

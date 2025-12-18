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

  const shadowOptions = [
    { id: "none", label: "None", shadow: "none" },
    { id: "soft", label: "Soft", shadow: isDark ? "0 4px 12px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.08)" },
    { id: "hard", label: "Hard", shadow: isDark ? "4px 4px 0 rgba(0,0,0,0.4)" : "4px 4px 0 rgba(0,0,0,0.1)" },
    { id: "floating", label: "Float", shadow: isDark ? "0 12px 24px rgba(0,0,0,0.6)" : "0 10px 20px rgba(0,0,0,0.12)" },
    { id: "glow", label: "Glow", shadow: `0 0 15px ${currentTheme.primary}40` },
  ];

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
                  {/* Card Shadow Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-wider font-bold opacity-50" style={{ color: isDark ? "#fff" : "#000" }}>Card Shadow</label>
                      <span className="text-[10px] py-0.5 px-1.5 rounded-md bg-neutral-500/10 opacity-60" style={{ color: isDark ? "#fff" : "#000" }}>
                        {currentTheme.cardShadow || "none"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-neutral-500/5 p-2 rounded-2xl gap-2">
                      {shadowOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => updateThemeProperty({ cardShadow: opt.id as any })}
                          className={`group relative flex flex-col items-center gap-1.5 flex-1 transition-all`}
                        >
                          <div 
                            className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center overflow-hidden
                              ${currentTheme.cardShadow === opt.id ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-neutral-900 scale-110' : 'hover:scale-105'}
                            `}
                            style={{ 
                              backgroundColor: isDark ? "#1e1e28" : "#fff",
                              boxShadow: opt.shadow === "none" ? "none" : opt.shadow,
                              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                              borderWidth: opt.id === "none" ? "1px" : "0px"
                            }}
                          >
                            {currentTheme.cardShadow === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          </div>
                          <span className="text-[9px] font-medium opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: isDark ? "#fff" : "#000" }}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Roundness */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-wider font-bold opacity-50" style={{ color: isDark ? "#fff" : "#000" }}>Card Roundness</label>
                      <span className="text-[10px] py-0.5 px-1.5 rounded-md bg-neutral-500/10 opacity-60" style={{ color: isDark ? "#fff" : "#000" }}>
                        {currentTheme.cardRoundness || 0}px
                      </span>
                    </div>
                    <div className="flex items-center gap-4 bg-neutral-500/5 p-3 rounded-2xl">
                       <input 
                        type="range"
                        min="0"
                        max="48"
                        step="4"
                        value={currentTheme.cardRoundness || 0}
                        onChange={(e) => updateThemeProperty({ cardRoundness: parseInt(e.target.value) })}
                        className="flex-1 accent-primary h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                       />
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
                           className={`py-2 px-3 text-[10px] capitalize rounded-xl border transition-all ${
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

                  {/* Transparency */}
                  <div className="space-y-3">
                    <label className="text-[11px] uppercase tracking-wider font-bold opacity-50 block" style={{ color: isDark ? "#fff" : "#000" }}>Style Effect</label>
                    <div className="flex p-1 rounded-xl gap-1 bg-neutral-500/5">
                       {["default", "faded", "frosted"].map((effect) => (
                         <button
                           key={effect}
                           onClick={() => updateThemeProperty({ cardTransparency: effect as any })}
                           className={`flex-1 py-2 text-[10px] capitalize rounded-lg transition-all ${
                             currentTheme.cardTransparency === effect
                               ? (isDark ? "bg-white/10 text-white shadow-sm font-bold" : "bg-white text-black shadow-sm font-bold")
                               : "text-neutral-500 hover:text-neutral-700"
                           }`}
                         >
                           {effect}
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

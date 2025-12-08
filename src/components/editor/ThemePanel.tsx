import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTheme, setTheme, Theme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

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
      fontFamily: "Inter, system-ui, sans-serif",
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
      fontFamily: "Inter, system-ui, sans-serif",
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
      fontFamily: "Inter, system-ui, sans-serif",
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
      fontFamily: "Inter, system-ui, sans-serif",
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
      fontFamily: "Inter, system-ui, sans-serif",
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
      fontFamily: "Inter, system-ui, sans-serif",
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
      fontFamily: "Inter, system-ui, sans-serif",
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
      fontFamily: "Inter, system-ui, sans-serif",
    },
  },
];

export const ThemePanel: React.FC<ThemePanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;

  if (!isOpen) return null;

  const handleThemeSelect = (selectedTheme: Theme) => {
    dispatch(setTheme(selectedTheme));
  };

  const isThemeActive = (paletteTheme: Theme) => {
    return (
      paletteTheme.primary === theme.primary &&
      paletteTheme.headingColor === theme.headingColor &&
      paletteTheme.bodyColor === theme.bodyColor &&
      paletteTheme.cardBackground === theme.cardBackground &&
      paletteTheme.pageBackground === theme.pageBackground
    );
  };

  return (
    <div className="absolute right-14 top-0 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-700"
          >
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.434-.69-.434-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-700">Themes</h3>
        </div>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {THEME_PALETTES.map((palette) => {
          const isActive = isThemeActive(palette.theme);
          return (
            <button
              key={palette.name}
              onClick={() => handleThemeSelect(palette.theme)}
              className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                isActive
                  ? "border-blue-500 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{
                backgroundColor: palette.theme.pageBackground,
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}

              {/* Theme preview */}
              <div
                className="rounded-md p-2 mb-2"
                style={{
                  backgroundColor: palette.theme.cardBackground,
                  border: `1px solid ${palette.theme.primary}20`,
                }}
              >
                <div
                  className="h-2 rounded mb-1.5"
                  style={{ backgroundColor: palette.theme.primary }}
                />
                <div
                  className="h-1.5 rounded mb-1"
                  style={{ backgroundColor: palette.theme.headingColor }}
                />
                <div
                  className="h-1 rounded"
                  style={{ backgroundColor: palette.theme.bodyColor }}
                />
              </div>

              {/* Theme name */}
              <div className="text-xs font-medium text-center" style={{ color: palette.theme.headingColor }}>
                {palette.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};


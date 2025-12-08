import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTheme, setTheme, Theme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-72 shadow-lg z-50 max-h-[90vh] overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Themes</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
        {THEME_PALETTES.map((palette) => {
          const isActive = isThemeActive(palette.theme);
          return (
            <Button
              key={palette.name}
              variant="ghost"
              onClick={() => handleThemeSelect(palette.theme)}
              className={`relative p-3 h-auto rounded-lg border-2 transition-all hover:scale-105 ${
                isActive
                  ? "border-primary shadow-md"
                  : "border-border hover:border-primary/50"
              }`}
              style={{
                backgroundColor: palette.theme.pageBackground,
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
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
            </Button>
          );
        })}
        </div>
      </CardContent>
    </Card>
  );
};


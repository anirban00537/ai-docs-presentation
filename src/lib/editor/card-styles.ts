import { Theme } from "./types";

/**
 * Static definition of the 9 card styles.
 * This can be used to populate the theme object in the DB or Redux.
 */
export const CARD_STYLE_PRESETS: Record<string, any> = {
  standard: (primary: string, isDark: boolean) => ({
    cardBorderRadius: "12px",
    cardBoxShadow: isDark ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 4px 12px rgba(0, 0, 0, 0.08)",
    cardBorderWidth: "1px",
    cardBorderStyle: "solid",
    cardBackdropBlur: "0px",
    cardOpacity: 1,
  }),
  flat: () => ({
    cardBorderRadius: "8px",
    cardBoxShadow: "none",
    cardBorderWidth: "0px",
    cardBorderStyle: "none",
    cardBackdropBlur: "0px",
    cardOpacity: 1,
  }),
  outline: (primary: string) => ({
    cardBorderRadius: "4px",
    cardBoxShadow: "none",
    cardBorderWidth: "2px",
    cardBorderStyle: "solid",
    cardBackdropBlur: "0px",
    cardOpacity: 1,
  }),
  sharp: () => ({
    cardBorderRadius: "0px",
    cardBoxShadow: "none",
    cardBorderWidth: "1px",
    cardBorderStyle: "solid",
    cardBackdropBlur: "0px",
    cardOpacity: 1,
  }),
  blocky: (primary: string) => ({
    cardBorderRadius: "0px",
    cardBoxShadow: `4px 4px 0px ${primary}`,
    cardBorderWidth: "2px",
    cardBorderStyle: "solid",
    cardBackdropBlur: "0px",
    cardOpacity: 1,
  }),
  glass: (primary: string, isDark: boolean) => ({
    cardBorderRadius: "16px",
    cardBoxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
    cardBorderWidth: "1px",
    cardBorderStyle: "solid",
    cardBackdropBlur: "12px",
    cardOpacity: isDark ? 0.4 : 0.7,
  }),
  rounded: (primary: string, isDark: boolean) => ({
    cardBorderRadius: "24px",
    cardBoxShadow: isDark ? "0 8px 30px rgba(0, 0, 0, 0.4)" : "0 8px 16px rgba(0, 0, 0, 0.06)",
    cardBorderWidth: "1px",
    cardBorderStyle: "solid",
    cardBackdropBlur: "0px",
    cardOpacity: 1,
  }),
  "soft-cloud": (primary: string, isDark: boolean) => ({
    cardBorderRadius: "20px",
    cardBoxShadow: isDark ? "0 20px 50px rgba(0, 0, 0, 0.5)" : "0 10px 40px rgba(0, 0, 0, 0.05)",
    cardBorderWidth: "0px",
    cardBorderStyle: "none",
    cardBackdropBlur: "0px",
    cardOpacity: isDark ? 0.9 : 1,
  }),
  capsule: (primary: string) => ({
    cardBorderRadius: "60px",
    cardBoxShadow: `4px 4px 0px ${primary}`,
    cardBorderWidth: "2px",
    cardBorderStyle: "solid",
    cardBackdropBlur: "0px",
    cardOpacity: 1,
  }),
};

/**
 * Applies a card style preset to a theme object.
 */
export const applyCardStylePreset = (theme: Theme, styleId: string): Theme => {
  const isDark = theme.themeType === "dark";
  const primary = theme.primary;
  
  const generator = CARD_STYLE_PRESETS[styleId] || CARD_STYLE_PRESETS.standard;
  const props = generator(primary, isDark);
  
  return {
    ...theme,
    ...props,
  };
};

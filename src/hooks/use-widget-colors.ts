import type { GlobalTheme } from "@/store/slices/slidesSlice";

/**
 * Hook to resolve widget colors with global theme fallback
 * @param globalTheme - Global theme from props, not from Redux state
 */
export const useWidgetColors = (globalTheme?: GlobalTheme) => {
  return {
    resolveColor: (
      color: string | undefined,
      fallback: "surface" | "text" | "accent"
    ): string => {
      if (color !== undefined) return color;
      return globalTheme?.[fallback] ?? "#000000";
    },
    backgroundColor: (color: string | undefined) =>
      color ?? globalTheme?.surface ?? "#ffffff",
    textColor: (color: string | undefined) =>
      color ?? globalTheme?.text ?? "#0f172a",
    accentColor: (color: string | undefined) =>
      color ?? globalTheme?.accent ?? "#2563eb",
    globalTheme,
  };
};

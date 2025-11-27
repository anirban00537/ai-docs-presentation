import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";

/**
 * Hook to resolve widget colors with global theme fallback
 */
export const useWidgetColors = () => {
  const globalTheme = useAppSelector(selectGlobalTheme);

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

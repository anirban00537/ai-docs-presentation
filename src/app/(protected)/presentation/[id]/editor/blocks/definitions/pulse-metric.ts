export interface PulseMetricContent {
  type: "pulse-metric";
  value: string;
  label: string;
  trend: "up" | "down" | "neutral";
  sparklineType?: "smooth" | "step" | "linear" | "bars";
}

export const createPulseMetricContent = (
  value: string = "+125%",
  label: string = "Revenue Growth"
): PulseMetricContent => ({
  type: "pulse-metric",
  value,
  label,
  trend: "up",
  sparklineType: "smooth",
});

export const normalizePulseMetricContent = (
  content: any
): PulseMetricContent => {
  const incoming = content as PulseMetricContent | undefined;
  return {
    type: "pulse-metric",
    value: incoming?.value ?? "+125%",
    label: incoming?.label ?? "Revenue Growth",
    trend: incoming?.trend ?? "up",
    sparklineType: incoming?.sparklineType ?? "smooth",
  };
};

import { PulseMetricContentSchema, type PulseMetricContent } from "@/types/presentation";

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
  const result = PulseMetricContentSchema.safeParse(content);
  if (result.success) {
    return result.data;
  }
  
  return createPulseMetricContent(content?.value, content?.label);
};

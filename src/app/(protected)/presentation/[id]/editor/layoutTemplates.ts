import type { Row } from "@/lib/editor/types";
import { HeroLayout } from "./templates/HeroLayout";
import { FeatureLayout } from "./templates/FeatureLayout";
import { TestimonialLayout } from "./templates/TestimonialLayout";

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  getRows: () => Row[];
}

export const layoutTemplates: LayoutTemplate[] = [
  HeroLayout,
  FeatureLayout,
  TestimonialLayout,
];

import type { Row } from "@/lib/editor/types";
import { HeroLayout } from "./templates/HeroLayout";
import { FeatureLayout } from "./templates/FeatureLayout";
import { TestimonialLayout } from "./templates/TestimonialLayout";
import { QuoteLayout } from "./templates/QuoteLayout";
import { ProcessLayout } from "./templates/ProcessLayout";
import { SectionLayout } from "./templates/SectionLayout";

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
  QuoteLayout,
  ProcessLayout,
  SectionLayout,
];

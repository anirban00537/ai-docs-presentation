import type { Row } from "@/lib/editor/types";
import { HeroLayout } from "./templates/HeroLayout";
import { FeatureLayout } from "./templates/FeatureLayout";
import { TeamLayout } from "./templates/TeamLayout";
import { PricingLayout } from "./templates/PricingLayout";
import { GalleryLayout } from "./templates/GalleryLayout";
import { TestimonialLayout } from "./templates/TestimonialLayout";
import { QuoteLayout } from "./templates/QuoteLayout";
import { ProcessLayout } from "./templates/ProcessLayout";
import { SectionLayout } from "./templates/SectionLayout";
import { StatsLayout } from "./templates/StatsLayout";
import { FeatureShowcaseLayout } from "./templates/FeatureShowcaseLayout";
import { ComparisonLayout } from "./templates/ComparisonLayout";
import { FAQLayout } from "./templates/FAQLayout";
import { PartnersLayout } from "./templates/PartnersLayout";
import { VideoShowcaseLayout } from "./templates/VideoShowcaseLayout";
import { CodeExampleLayout } from "./templates/CodeExampleLayout";
import { ProgressLayout } from "./templates/ProgressLayout";
import { SocialProofLayout } from "./templates/SocialProofLayout";
import { AwardsLayout } from "./templates/AwardsLayout";

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
  TeamLayout,
  PricingLayout,
  GalleryLayout,
  TestimonialLayout,
  QuoteLayout,
  ProcessLayout,
  SectionLayout,
  StatsLayout,
  FeatureShowcaseLayout,
  ComparisonLayout,
  FAQLayout,
  PartnersLayout,
  VideoShowcaseLayout,
  CodeExampleLayout,
  ProgressLayout,
  SocialProofLayout,
  AwardsLayout,
];

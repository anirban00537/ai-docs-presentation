import type { Row, LayoutTemplate } from "@/types/presentation";
import type { Icon } from "@tabler/icons-react";
import {
  IconTarget,
  IconSparkles,
  IconUsers,
  IconTag,
  IconPhoto,
  IconMessageCircle,
  IconQuote,
  IconRoute,
  IconSection,
  IconChartBar,
  IconRocket,
  IconArrowsLeftRight,
  IconHelp,
  IconBuildingStore,
  IconVideo,
  IconCode,
  IconProgress,
  IconThumbUp,
  IconAward,
  IconAlertTriangle,
  IconFileText,
  IconBulb,
  IconTrendingUp,
  IconEye,
  IconMessage,
  IconMessages,
  IconMessage2,
  IconCurrencyDollar,
  IconBook,
  IconList,
  IconBrandGoogle,
  IconFileDescription,
  IconVersions,
  IconUserCircle,
  IconArrowRight,
  IconChecklist,
  IconTerminal2,
  IconHeading,
} from "@tabler/icons-react";
import { FeatureLayout } from "./templates/FeatureLayout";
import { IntroductionLayout } from "./templates/IntroductionLayout";
import { TeamLayout } from "./templates/TeamLayout";
import { PricingLayout } from "./templates/PricingLayout";
import { GalleryLayout } from "./templates/GalleryLayout";
import { TestimonialLayout } from "./templates/TestimonialLayout";
import { QuoteLayout } from "./templates/QuoteLayout";
import { ProcessLayout } from "./templates/ProcessLayout";
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
import { ProblemImageLayout } from "./templates/ProblemImageLayout";
import { ProblemSupportingPointsLayout } from "./templates/ProblemSupportingPointsLayout";
import { OpportunityMetricsLayout } from "./templates/OpportunityMetricsLayout";
import { DiscoveryInsightsLayout } from "./templates/DiscoveryInsightsLayout";
import { ProblemQuoteLayout } from "./templates/ProblemQuoteLayout";
import { ProblemTwoQuotesLayout } from "./templates/ProblemTwoQuotesLayout";
import { CustomerQuotesLayout } from "./templates/CustomerQuotesLayout";
import { PricingThreeTierLayout } from "./templates/PricingThreeTierLayout";
import { CustomerStoriesLayout } from "./templates/CustomerStoriesLayout";
import { ServicesListLayout } from "./templates/ServicesListLayout";
import { DocIntroLayout } from "./templates/DocIntroLayout";
import { ComparisonOldNewLayout } from "./templates/ComparisonOldNewLayout";
import { TargetAudiencesLayout } from "./templates/TargetAudiencesLayout";
import { NextStepsLayout } from "./templates/NextStepsLayout";
import { SummaryLayout } from "./templates/SummaryLayout";
import { MetricDashboardLayout } from "./templates/MetricDashboardLayout";
import { TechnicalWalkthroughLayout } from "./templates/TechnicalWalkthroughLayout";
import { KeyInsightsLayout } from "./templates/KeyInsightsLayout";

// JSON mapping of layout IDs to Tabler icon components
export const layoutIconsMap: Record<string, Icon> = {
  "hero-layout": IconTarget,
  "feature-layout": IconSparkles,
  "team-layout": IconUsers,
  "pricing-layout": IconTag,
  "gallery-layout": IconPhoto,
  "testimonial-layout": IconMessageCircle,
  "quote-layout": IconQuote,
  "process-layout": IconRoute,
  "section-layout": IconSection,
  "stats-layout": IconChartBar,
  "feature-showcase-layout": IconRocket,
  "comparison-layout": IconArrowsLeftRight,
  "faq-layout": IconHelp,
  "partners-layout": IconBuildingStore,
  "video-showcase-layout": IconVideo,
  "code-example-layout": IconCode,
  "progress-layout": IconProgress,
  "social-proof-layout": IconThumbUp,
  "awards-layout": IconAward,
  "problem-hero-layout": IconAlertTriangle,
  "problem-statement-layout": IconFileText,
  "problem-image-layout": IconPhoto,
  "problem-supporting-points-layout": IconBulb,
  "opportunity-metrics-layout": IconTrendingUp,
  "discovery-insights-layout": IconEye,
  "problem-quote-layout": IconMessage,
  "problem-two-quotes-layout": IconMessages,
  "customer-quotes-layout": IconMessage2,
  "pricing-three-tier-layout": IconCurrencyDollar,
  "customer-stories-layout": IconBook,
  "services-list-layout": IconList,
  "tagline-title-page-layout": IconBrandGoogle,
  "doc-intro-layout": IconFileDescription,
  "comparison-old-new-layout": IconVersions,
  "target-audiences-layout": IconUserCircle,
  "next-steps-layout": IconArrowRight,
  "summary-layout": IconChecklist,
  "metric-dashboard": IconChartBar,
  "technical-walkthrough": IconTerminal2,
  introduction: IconHeading,
  "key-insights": IconBulb,
};

export const layoutTemplates: LayoutTemplate[] = [
  FeatureLayout,
  TeamLayout,
  PricingLayout,
  GalleryLayout,
  TestimonialLayout,
  QuoteLayout,
  ProcessLayout,
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
  ProblemSupportingPointsLayout,
  IntroductionLayout,
  OpportunityMetricsLayout,
  DiscoveryInsightsLayout,
  ProblemQuoteLayout,
  ProblemTwoQuotesLayout,
  CustomerQuotesLayout,
  PricingThreeTierLayout,
  CustomerStoriesLayout,
  ServicesListLayout,
  DocIntroLayout,
  ComparisonOldNewLayout,
  TargetAudiencesLayout,
  NextStepsLayout,
  SummaryLayout,
  MetricDashboardLayout,
  TechnicalWalkthroughLayout,
  KeyInsightsLayout,
];

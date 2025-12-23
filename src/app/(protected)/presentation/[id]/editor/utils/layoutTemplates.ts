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
  // New icons for accent templates
  IconDeviceLaptop,
  IconUserHeart,
  IconReportAnalytics,
  IconStar,
  IconMoodSad,
  IconScreenShare,
  IconCalendarEvent,
  IconBuildingFactory,
  IconBuildingSkyscraper,
  IconMapPin,
} from "@tabler/icons-react";
import { FeatureLayout } from "../templates/FeatureLayout";
import { IntroductionLayout } from "../templates/IntroductionLayout";
import { TeamLayout } from "../templates/TeamLayout";
import { PricingLayout } from "../templates/PricingLayout";
import { GalleryLayout } from "../templates/GalleryLayout";
import { TestimonialLayout } from "../templates/TestimonialLayout";
import { QuoteLayout } from "../templates/QuoteLayout";
import { ProcessLayout } from "../templates/ProcessLayout";
import { StatsLayout } from "../templates/StatsLayout";
import { FeatureShowcaseLayout } from "../templates/FeatureShowcaseLayout";
import { ComparisonLayout } from "../templates/ComparisonLayout";
import { FAQLayout } from "../templates/FAQLayout";
import { PartnersLayout } from "../templates/PartnersLayout";
import { CodeExampleLayout } from "../templates/CodeExampleLayout";
import { ProgressLayout } from "../templates/ProgressLayout";
import { SocialProofLayout } from "../templates/SocialProofLayout";
import { AwardsLayout } from "../templates/AwardsLayout";
import { ProblemImageLayout } from "../templates/ProblemImageLayout";
import { ProblemSupportingPointsLayout } from "../templates/ProblemSupportingPointsLayout";
import { OpportunityMetricsLayout } from "../templates/OpportunityMetricsLayout";
import { DiscoveryInsightsLayout } from "../templates/DiscoveryInsightsLayout";
import { ProblemQuoteLayout } from "../templates/ProblemQuoteLayout";
import { ProblemTwoQuotesLayout } from "../templates/ProblemTwoQuotesLayout";
import { CustomerQuotesLayout } from "../templates/CustomerQuotesLayout";
import { PricingThreeTierLayout } from "../templates/PricingThreeTierLayout";
import { CustomerStoriesLayout } from "../templates/CustomerStoriesLayout";
import { ServicesListLayout } from "../templates/ServicesListLayout";
import { DocIntroLayout } from "../templates/DocIntroLayout";
import { ComparisonOldNewLayout } from "../templates/ComparisonOldNewLayout";
import { TargetAudiencesLayout } from "../templates/TargetAudiencesLayout";
import { NextStepsLayout } from "../templates/NextStepsLayout";
import { SummaryLayout } from "../templates/SummaryLayout";
import { MetricDashboardLayout } from "../templates/MetricDashboardLayout";
import { TechnicalWalkthroughLayout } from "../templates/TechnicalWalkthroughLayout";
import { KeyInsightsLayout } from "../templates/KeyInsightsLayout";

// New Accent Image Templates
import { HeroProductLayout } from "../templates/HeroProductLayout";
import { FounderStoryLayout } from "../templates/FounderStoryLayout";
import { CaseStudyHeroLayout } from "../templates/CaseStudyHeroLayout";
import { TeamSpotlightLayout } from "../templates/TeamSpotlightLayout";
import { ProblemVisualLayout } from "../templates/ProblemVisualLayout";
import { ProductDemoLayout } from "../templates/ProductDemoLayout";
import { EventAnnouncementLayout } from "../templates/EventAnnouncementLayout";
import { IndustryFocusLayout } from "../templates/IndustryFocusLayout";
import { ContextualTestimonialLayout } from "../templates/ContextualTestimonialLayout";
import { OfficeLocationLayout } from "../templates/OfficeLocationLayout";
import { CustomerJourneyLayout } from "../templates/CustomerJourneyLayout";

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
  // Accent Image Template Icons
  "hero-product-layout": IconRocket,
  "founder-story-layout": IconUserHeart,
  "case-study-hero-layout": IconReportAnalytics,
  "team-spotlight-layout": IconStar,
  "problem-visual-layout": IconMoodSad,
  "product-demo-layout": IconScreenShare,
  "event-announcement-layout": IconCalendarEvent,
  "industry-focus-layout": IconBuildingFactory,
  "contextual-testimonial-layout": IconMessageCircle,
  "office-location-layout": IconBuildingSkyscraper,
  "customer-journey-layout": IconMapPin,
};

export const layoutTemplates: LayoutTemplate[] = [
  // New Accent Image Templates (Featured at top)
  HeroProductLayout,
  ProductDemoLayout,
  CaseStudyHeroLayout,
  FounderStoryLayout,
  TeamSpotlightLayout,
  ProblemVisualLayout,
  EventAnnouncementLayout,
  IndustryFocusLayout,
  ContextualTestimonialLayout,
  OfficeLocationLayout,
  CustomerJourneyLayout,
  // Original Templates
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

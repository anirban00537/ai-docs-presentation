/**
 * Template Registry
 * Centralized export and registry for all slide templates.
 * Provides search, filter, and categorization capabilities.
 */

// Import all templates
import { AwardsLayout } from "./AwardsLayout";
import { CaseStudyHeroLayout } from "./CaseStudyHeroLayout";
import { CodeExampleLayout } from "./CodeExampleLayout";
import { ComparisonLayout } from "./ComparisonLayout";
import { ComparisonOldNewLayout } from "./ComparisonOldNewLayout";
import { ContextualTestimonialLayout } from "./ContextualTestimonialLayout";
import { CustomerJourneyLayout } from "./CustomerJourneyLayout";
import { CustomerQuotesLayout } from "./CustomerQuotesLayout";
import { CustomerStoriesLayout } from "./CustomerStoriesLayout";
import { DiscoveryInsightsLayout } from "./DiscoveryInsightsLayout";
import { DocIntroLayout } from "./DocIntroLayout";
import { EventAnnouncementLayout } from "./EventAnnouncementLayout";
import { FAQLayout } from "./FAQLayout";
import { FeatureLayout } from "./FeatureLayout";
import { FeatureShowcaseLayout } from "./FeatureShowcaseLayout";
import { FounderStoryLayout } from "./FounderStoryLayout";
import { GalleryLayout } from "./GalleryLayout";
import { HeroProductLayout } from "./HeroProductLayout";
import { IndustryFocusLayout } from "./IndustryFocusLayout";
import { IntroductionLayout } from "./IntroductionLayout";
import { KeyInsightsLayout } from "./KeyInsightsLayout";
import { MetricDashboardLayout } from "./MetricDashboardLayout";
import { NextStepsLayout } from "./NextStepsLayout";
import { OfficeLocationLayout } from "./OfficeLocationLayout";
import { OpportunityMetricsLayout } from "./OpportunityMetricsLayout";
import { PartnersLayout } from "./PartnersLayout";
import { PricingLayout } from "./PricingLayout";
import { PricingThreeTierLayout } from "./PricingThreeTierLayout";
import { ProblemImageLayout } from "./ProblemImageLayout";
import { ProblemQuoteLayout } from "./ProblemQuoteLayout";
import { ProblemSupportingPointsLayout } from "./ProblemSupportingPointsLayout";
import { ProblemTwoQuotesLayout } from "./ProblemTwoQuotesLayout";
import { ProblemVisualLayout } from "./ProblemVisualLayout";
import { ProcessLayout } from "./ProcessLayout";
import { ProductDemoLayout } from "./ProductDemoLayout";
import { ProgressLayout } from "./ProgressLayout";
import { QuoteLayout } from "./QuoteLayout";
import { ServicesListLayout } from "./ServicesListLayout";
import { SocialProofLayout } from "./SocialProofLayout";
import { StatsLayout } from "./StatsLayout";
import { SummaryLayout } from "./SummaryLayout";
import { TargetAudiencesLayout } from "./TargetAudiencesLayout";
import { TeamLayout } from "./TeamLayout";
import { TeamSpotlightLayout } from "./TeamSpotlightLayout";
import { TechnicalWalkthroughLayout } from "./TechnicalWalkthroughLayout";
import { TestimonialLayout } from "./TestimonialLayout";

import type { LayoutTemplate } from "@/types/presentation";
import type { TemplateCategory, TemplateMetadata } from "./template-utils";

// Re-export all templates for direct import
export {
  AwardsLayout,
  CaseStudyHeroLayout,
  CodeExampleLayout,
  ComparisonLayout,
  ComparisonOldNewLayout,
  ContextualTestimonialLayout,
  CustomerJourneyLayout,
  CustomerQuotesLayout,
  CustomerStoriesLayout,
  DiscoveryInsightsLayout,
  DocIntroLayout,
  EventAnnouncementLayout,
  FAQLayout,
  FeatureLayout,
  FeatureShowcaseLayout,
  FounderStoryLayout,
  GalleryLayout,
  HeroProductLayout,
  IndustryFocusLayout,
  IntroductionLayout,
  KeyInsightsLayout,
  MetricDashboardLayout,
  NextStepsLayout,
  OfficeLocationLayout,
  OpportunityMetricsLayout,
  PartnersLayout,
  PricingLayout,
  PricingThreeTierLayout,
  ProblemImageLayout,
  ProblemQuoteLayout,
  ProblemSupportingPointsLayout,
  ProblemTwoQuotesLayout,
  ProblemVisualLayout,
  ProcessLayout,
  ProductDemoLayout,
  ProgressLayout,
  QuoteLayout,
  ServicesListLayout,
  SocialProofLayout,
  StatsLayout,
  SummaryLayout,
  TargetAudiencesLayout,
  TeamLayout,
  TeamSpotlightLayout,
  TechnicalWalkthroughLayout,
  TestimonialLayout,
};

// Re-export utilities
export * from "./template-utils";

/**
 * Template registry entry with full metadata
 */
interface TemplateRegistryEntry {
  template: LayoutTemplate;
  metadata: TemplateMetadata;
}

/**
 * Complete template registry with metadata for all templates
 */
export const TEMPLATE_REGISTRY: TemplateRegistryEntry[] = [
  // Introduction Templates
  {
    template: IntroductionLayout,
    metadata: {
      id: "introduction",
      name: "Introduction",
      description: "Big title with small subtitle",
      icon: "IconHandWave",
      category: "introduction",
      keywords: ["title", "intro", "opening", "headline", "hero"],
      featured: true,
      useCases: ["Opening slide", "Section divider", "Title page"],
    },
  },
  {
    template: DocIntroLayout,
    metadata: {
      id: "doc-intro",
      name: "Document Introduction",
      description: "Professional document-style introduction",
      icon: "IconFileText",
      category: "introduction",
      keywords: ["document", "report", "formal", "introduction"],
      useCases: ["Reports", "Whitepapers", "Formal presentations"],
    },
  },

  // Content Templates
  {
    template: FeatureLayout,
    metadata: {
      id: "feature-layout",
      name: "Features",
      description: "Showcase product features",
      icon: "IconRocket",
      category: "content",
      keywords: ["features", "benefits", "product", "capabilities"],
      featured: true,
      useCases: ["Product demos", "Feature announcements"],
    },
  },
  {
    template: FeatureShowcaseLayout,
    metadata: {
      id: "feature-showcase",
      name: "Feature Showcase",
      description: "Highlight a single feature with details",
      icon: "IconStack",
      category: "content",
      keywords: ["feature", "highlight", "showcase", "demo"],
      useCases: ["Feature deep-dives", "Product walkthroughs"],
    },
  },
  {
    template: ProcessLayout,
    metadata: {
      id: "process-layout",
      name: "Process",
      description: "Step-by-step process visualization",
      icon: "IconSettings",
      category: "content",
      keywords: ["process", "steps", "workflow", "timeline", "how-to"],
      useCases: ["Onboarding flows", "How it works sections"],
    },
  },
  {
    template: ComparisonLayout,
    metadata: {
      id: "comparison-layout",
      name: "Comparison",
      description: "Compare options side by side",
      icon: "IconAdjustmentsHorizontal",
      category: "content",
      keywords: ["comparison", "versus", "vs", "options", "alternatives"],
      useCases: ["Product comparisons", "Plan differences"],
    },
  },
  {
    template: ComparisonOldNewLayout,
    metadata: {
      id: "comparison-old-new",
      name: "Before & After",
      description: "Compare old vs new approach",
      icon: "IconArrowsLeftRight",
      category: "content",
      keywords: ["before", "after", "old", "new", "transformation"],
      useCases: ["Product updates", "Transformations"],
    },
  },
  {
    template: FAQLayout,
    metadata: {
      id: "faq-layout",
      name: "FAQ Section",
      description: "Answer common questions",
      icon: "IconQuestionMark",
      category: "content",
      keywords: ["faq", "questions", "answers", "help", "support"],
      useCases: ["Support sections", "Product FAQs"],
    },
  },
  {
    template: CodeExampleLayout,
    metadata: {
      id: "code-example",
      name: "Code Example",
      description: "Show code snippets with syntax highlighting",
      icon: "IconCode",
      category: "content",
      keywords: ["code", "programming", "developer", "technical", "api"],
      useCases: ["Developer docs", "Technical presentations"],
    },
  },
  {
    template: TechnicalWalkthroughLayout,
    metadata: {
      id: "technical-walkthrough",
      name: "Technical Walkthrough",
      description: "Deep-dive into technical details",
      icon: "IconTerminal",
      category: "content",
      keywords: ["technical", "walkthrough", "architecture", "system"],
      useCases: ["Technical presentations", "Architecture reviews"],
    },
  },
  {
    template: ServicesListLayout,
    metadata: {
      id: "services-list",
      name: "Services List",
      description: "List your services or offerings",
      icon: "IconList",
      category: "content",
      keywords: ["services", "offerings", "list", "capabilities"],
      useCases: ["Service pages", "Capability decks"],
    },
  },

  // Data & Insights Templates
  {
    template: StatsLayout,
    metadata: {
      id: "stats-layout",
      name: "Statistics Dashboard",
      description: "Showcase key metrics with animated counters",
      icon: "IconChartBar",
      category: "data",
      keywords: ["stats", "metrics", "numbers", "kpi", "data"],
      featured: true,
      useCases: ["Performance reports", "Impact showcases"],
    },
  },
  {
    template: MetricDashboardLayout,
    metadata: {
      id: "metric-dashboard",
      name: "Metric Dashboard",
      description: "Multiple metrics in dashboard format",
      icon: "IconTrendingUp",
      category: "data",
      keywords: ["dashboard", "metrics", "analytics", "performance"],
      useCases: ["Executive reports", "Performance reviews"],
    },
  },
  {
    template: KeyInsightsLayout,
    metadata: {
      id: "key-insights",
      name: "Key Insights",
      description: "Highlight important findings",
      icon: "IconBolt",
      category: "data",
      keywords: ["insights", "findings", "takeaways", "learnings"],
      useCases: ["Research presentations", "Report summaries"],
    },
  },
  {
    template: DiscoveryInsightsLayout,
    metadata: {
      id: "discovery-insights",
      name: "Discovery Insights",
      description: "Share research discoveries",
      icon: "IconSearch",
      category: "data",
      keywords: ["discovery", "research", "insights", "findings"],
      useCases: ["User research", "Market analysis"],
    },
  },
  {
    template: OpportunityMetricsLayout,
    metadata: {
      id: "opportunity-metrics",
      name: "Opportunity Metrics",
      description: "Highlight growth opportunities",
      icon: "IconTrendingDown",
      category: "data",
      keywords: ["opportunity", "growth", "potential", "market"],
      useCases: ["Investment pitches", "Growth plans"],
    },
  },
  {
    template: ProgressLayout,
    metadata: {
      id: "progress-layout",
      name: "Progress Update",
      description: "Show project or goal progress",
      icon: "IconListDetails",
      category: "data",
      keywords: ["progress", "update", "status", "milestones"],
      useCases: ["Status updates", "Progress reports"],
    },
  },
  {
    template: SummaryLayout,
    metadata: {
      id: "summary-layout",
      name: "Summary",
      description: "Executive summary with key points",
      icon: "IconListCheck",
      category: "data",
      keywords: ["summary", "recap", "overview", "key-points"],
      useCases: ["Presentation summaries", "Executive briefs"],
    },
  },

  // Social Proof Templates
  {
    template: TestimonialLayout,
    metadata: {
      id: "testimonial-layout",
      name: "Testimonials",
      description: "Customer testimonials and reviews",
      icon: "IconMessageChat",
      category: "social-proof",
      keywords: ["testimonial", "review", "customer", "feedback"],
      featured: true,
      useCases: ["Customer stories", "Case studies"],
    },
  },
  {
    template: QuoteLayout,
    metadata: {
      id: "quote-layout",
      name: "Quote",
      description: "Feature a powerful quote",
      icon: "IconQuote",
      category: "social-proof",
      keywords: ["quote", "citation", "statement", "endorsement"],
      useCases: ["Expert quotes", "Customer endorsements"],
    },
  },
  {
    template: CustomerQuotesLayout,
    metadata: {
      id: "customer-quotes",
      name: "Customer Quotes",
      description: "Multiple customer quotes",
      icon: "IconMessages",
      category: "social-proof",
      keywords: ["customer", "quotes", "testimonials", "feedback"],
      useCases: ["Customer showcases", "Review collections"],
    },
  },
  {
    template: CustomerStoriesLayout,
    metadata: {
      id: "customer-stories",
      name: "Customer Stories",
      description: "In-depth customer success stories",
      icon: "IconBook",
      category: "social-proof",
      keywords: ["customer", "story", "case-study", "success"],
      useCases: ["Case studies", "Success stories"],
    },
  },
  {
    template: SocialProofLayout,
    metadata: {
      id: "social-proof",
      name: "Social Proof",
      description: "Showcase trust signals",
      icon: "IconShieldCheck",
      category: "social-proof",
      keywords: ["social-proof", "trust", "credibility", "logos"],
      useCases: ["Trust building", "Credibility sections"],
    },
  },
  {
    template: AwardsLayout,
    metadata: {
      id: "awards-layout",
      name: "Awards & Recognition",
      description: "Showcase awards and achievements",
      icon: "IconTrophy",
      category: "social-proof",
      keywords: ["awards", "recognition", "achievements", "badges"],
      useCases: ["About pages", "Company profiles"],
    },
  },
  {
    template: PartnersLayout,
    metadata: {
      id: "partners-layout",
      name: "Partners & Integrations",
      description: "Show partner logos and integrations",
      icon: "IconUsers",
      category: "social-proof",
      keywords: ["partners", "integrations", "logos", "ecosystem"],
      useCases: ["Partner showcases", "Integration pages"],
    },
  },
  {
    template: ProblemQuoteLayout,
    metadata: {
      id: "problem-quote",
      name: "Problem Quote",
      description: "Highlight a problem with a quote",
      icon: "IconMoodNeutral",
      category: "social-proof",
      keywords: ["problem", "pain-point", "quote", "challenge"],
      useCases: ["Problem statements", "Pain point highlights"],
    },
  },
  {
    template: ProblemTwoQuotesLayout,
    metadata: {
      id: "problem-two-quotes",
      name: "Problem with Two Quotes",
      description: "Multiple perspectives on a problem",
      icon: "IconMoodSad",
      category: "social-proof",
      keywords: ["problem", "quotes", "perspectives", "challenges"],
      useCases: ["Multi-perspective problems", "Diverse feedback"],
    },
  },
  {
    template: TargetAudiencesLayout,
    metadata: {
      id: "target-audiences",
      name: "Target Audiences",
      description: "Define your target personas",
      icon: "IconTarget",
      category: "social-proof",
      keywords: ["audience", "personas", "target", "segments"],
      useCases: ["Audience definition", "Market segments"],
    },
  },

  // Pricing Templates
  {
    template: PricingLayout,
    metadata: {
      id: "pricing-layout",
      name: "Pricing Plans",
      description: "Compare plans with clear features",
      icon: "IconTag",
      category: "pricing",
      keywords: ["pricing", "plans", "tiers", "subscription"],
      featured: true,
      useCases: ["Pricing pages", "Plan comparisons"],
    },
  },
  {
    template: PricingThreeTierLayout,
    metadata: {
      id: "pricing-three-tier",
      name: "Three-Tier Pricing",
      description: "Classic three-tier pricing layout",
      icon: "IconCreditCard",
      category: "pricing",
      keywords: ["pricing", "three-tier", "plans", "comparison"],
      useCases: ["SaaS pricing", "Plan selections"],
    },
  },

  // Team Templates
  {
    template: TeamLayout,
    metadata: {
      id: "team-layout",
      name: "Meet the Team",
      description: "Introduce your team members",
      icon: "IconUsersGroup",
      category: "team",
      keywords: ["team", "people", "about-us", "founders"],
      featured: true,
      useCases: ["About pages", "Team introductions"],
    },
  },

  // Media Templates
  {
    template: GalleryLayout,
    metadata: {
      id: "gallery-layout",
      name: "Image Gallery",
      description: "Showcase images in a grid",
      icon: "IconPhoto",
      category: "media",
      keywords: ["gallery", "images", "photos", "portfolio"],
      useCases: ["Portfolio", "Visual showcases"],
    },
  },
  {
    template: ProblemImageLayout,
    metadata: {
      id: "problem-image",
      name: "Problem with Image",
      description: "Illustrate a problem with visuals",
      icon: "IconPhoto",
      category: "media",
      keywords: ["problem", "image", "visual", "illustration"],
      useCases: ["Visual problem statements", "Illustrated challenges"],
    },
  },
  {
    template: ProblemSupportingPointsLayout,
    metadata: {
      id: "problem-supporting-points",
      name: "Problem with Supporting Points",
      description: "Problem statement with bullet points",
      icon: "IconPin",
      category: "media",
      keywords: ["problem", "points", "bullets", "details"],
      useCases: ["Detailed problem breakdowns"],
    },
  },

  // Closing Templates
  {
    template: NextStepsLayout,
    metadata: {
      id: "next-steps",
      name: "Next Steps",
      description: "Clear call-to-action with next steps",
      icon: "IconArrowRight",
      category: "closing",
      keywords: ["next-steps", "cta", "action", "closing"],
      featured: true,
      useCases: ["Closing slides", "Call-to-action pages"],
    },
  },

  // NEW: Accent Image Templates
  {
    template: HeroProductLayout,
    metadata: {
      id: "hero-product-layout",
      name: "Hero Product Showcase",
      description: "Product showcase with large image accent",
      icon: "IconRocket",
      category: "content",
      keywords: ["hero", "product", "showcase", "accent", "image"],
      featured: true,
      useCases: ["Product launches", "Feature highlights"],
    },
  },
  {
    template: FounderStoryLayout,
    metadata: {
      id: "founder-story-layout",
      name: "Founder Story",
      description: "Executive profile with portrait accent",
      icon: "IconUser",
      category: "team",
      keywords: ["founder", "story", "portrait", "executive", "about"],
      useCases: ["About us", "Origin stories", "Speaker intros"],
    },
  },
  {
    template: CaseStudyHeroLayout,
    metadata: {
      id: "case-study-hero-layout",
      name: "Case Study Hero",
      description: "Success story with visual proof",
      icon: "IconChartLine",
      category: "social-proof",
      keywords: ["case-study", "success", "customer", "proof"],
      featured: true,
      useCases: ["Case studies", "Success stories"],
    },
  },
  {
    template: TeamSpotlightLayout,
    metadata: {
      id: "team-spotlight-layout",
      name: "Team Spotlight",
      description: "Individual team member with large portrait",
      icon: "IconStar",
      category: "team",
      keywords: ["team", "spotlight", "portrait", "leader"],
      useCases: ["Leadership pages", "Speaker intros"],
    },
  },
  {
    template: ProblemVisualLayout,
    metadata: {
      id: "problem-visual-layout",
      name: "Problem Visual",
      description: "Problem statement with impactful visual banner",
      icon: "IconMoodNeutral",
      category: "content",
      keywords: ["problem", "visual", "pain", "challenge"],
      useCases: ["Problem slides", "Pain point visualization"],
    },
  },
  {
    template: ProductDemoLayout,
    metadata: {
      id: "product-demo-layout",
      name: "Product Demo",
      description: "Screenshot showcase with feature highlights",
      icon: "IconDeviceLaptop",
      category: "content",
      keywords: ["product", "demo", "screenshot", "features"],
      featured: true,
      useCases: ["Product demos", "Feature walkthroughs"],
    },
  },
  {
    template: EventAnnouncementLayout,
    metadata: {
      id: "event-announcement-layout",
      name: "Event Announcement",
      description: "Event promo with atmospheric background",
      icon: "IconConfetti",
      category: "content",
      keywords: ["event", "conference", "webinar", "announcement"],
      useCases: ["Event announcements", "Webinar invites"],
    },
  },
  {
    template: IndustryFocusLayout,
    metadata: {
      id: "industry-focus-layout",
      name: "Industry Focus",
      description: "Market analysis with industry visual",
      icon: "IconBuildingFactory",
      category: "data",
      keywords: ["industry", "market", "vertical", "analysis"],
      useCases: ["Market analysis", "Industry focus slides"],
    },
  },
  {
    template: ContextualTestimonialLayout,
    metadata: {
      id: "contextual-testimonial-layout",
      name: "Contextual Testimonial",
      description: "Testimonial with customer context visual",
      icon: "IconMessageChat",
      category: "social-proof",
      keywords: ["testimonial", "customer", "context", "visual"],
      useCases: ["Social proof", "Customer stories"],
    },
  },
  {
    template: OfficeLocationLayout,
    metadata: {
      id: "office-location-layout",
      name: "Office Location",
      description: "Company location with office visual",
      icon: "IconBuildingSkyscraper",
      category: "team",
      keywords: ["office", "location", "company", "workspace"],
      useCases: ["Company overview", "Recruitment"],
    },
  },
  {
    template: CustomerJourneyLayout,
    metadata: {
      id: "customer-journey-layout",
      name: "Customer Journey",
      description: "Journey visualization with visual banner",
      icon: "IconMapPin",
      category: "content",
      keywords: ["journey", "customer", "flow", "process"],
      useCases: ["UX presentations", "Journey mapping"],
    },
  },
];

/**
 * Get all templates
 */
export function getAllTemplates(): TemplateRegistryEntry[] {
  return TEMPLATE_REGISTRY;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): TemplateRegistryEntry[] {
  return TEMPLATE_REGISTRY.filter((entry) => entry.metadata.category === category);
}

/**
 * Get featured templates
 */
export function getFeaturedTemplates(): TemplateRegistryEntry[] {
  return TEMPLATE_REGISTRY.filter((entry) => entry.metadata.featured);
}

/**
 * Search templates by keyword
 */
export function searchTemplates(query: string): TemplateRegistryEntry[] {
  const lowerQuery = query.toLowerCase();
  return TEMPLATE_REGISTRY.filter((entry) => {
    const { name, description, keywords } = entry.metadata;
    return (
      name.toLowerCase().includes(lowerQuery) ||
      description.toLowerCase().includes(lowerQuery) ||
      keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): TemplateRegistryEntry | undefined {
  return TEMPLATE_REGISTRY.find((entry) => entry.metadata.id === id);
}

/**
 * Get all available categories with counts
 */
export function getCategories(): { category: TemplateCategory; count: number }[] {
  const categories: TemplateCategory[] = [
    "introduction",
    "content",
    "data",
    "social-proof",
    "pricing",
    "team",
    "media",
    "closing",
  ];
  
  return categories.map((category) => ({
    category,
    count: getTemplatesByCategory(category).length,
  }));
}

/**
 * Export Templates Script
 *
 * This script runs in the frontend context and exports template data
 * Run with: npx tsx scripts/export-templates.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Import all templates
import { FeatureLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/FeatureLayout";
import { PricingLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/PricingLayout";
import { TeamLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/TeamLayout";
import { StatsLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/StatsLayout";
import { TestimonialLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/TestimonialLayout";
import { VideoShowcaseLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/VideoShowcaseLayout";
import { ServicesListLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/ServicesListLayout";
import { SocialProofLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/SocialProofLayout";
import { TargetAudiencesLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/TargetAudiencesLayout";
import { ProblemQuoteLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/ProblemQuoteLayout";
import { ProblemSupportingPointsLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/ProblemSupportingPointsLayout";
import { ProblemTwoQuotesLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/ProblemTwoQuotesLayout";
import { ProcessLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/ProcessLayout";
import { ProgressLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/ProgressLayout";
import { QuoteLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/QuoteLayout";
import { OpportunityMetricsLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/OpportunityMetricsLayout";
import { PartnersLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/PartnersLayout";
import { PricingThreeTierLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/PricingThreeTierLayout";
import { ProblemImageLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/ProblemImageLayout";
import { FAQLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/FAQLayout";
import { FeatureShowcaseLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/FeatureShowcaseLayout";
import { GalleryLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/GalleryLayout";
import { NextStepsLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/NextStepsLayout";
import { CustomerQuotesLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/CustomerQuotesLayout";
import { CustomerStoriesLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/CustomerStoriesLayout";
import { DiscoveryInsightsLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/DiscoveryInsightsLayout";
import { DocIntroLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/DocIntroLayout";
import { ComparisonLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/ComparisonLayout";
import { ComparisonOldNewLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/ComparisonOldNewLayout";
import { CodeExampleLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/CodeExampleLayout";
import { AwardsLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/AwardsLayout";
import { IntroductionLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/IntroductionLayout";
import { KeyInsightsLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/KeyInsightsLayout";
import { MetricDashboardLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/MetricDashboardLayout";
import { SummaryLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/SummaryLayout";
import { TechnicalWalkthroughLayout } from "../src/app/(protected)/presentation/[id]/editor/templates/TechnicalWalkthroughLayout";

const templates = [
  FeatureLayout,
  PricingLayout,
  TeamLayout,
  StatsLayout,
  TestimonialLayout,
  VideoShowcaseLayout,
  ServicesListLayout,
  SocialProofLayout,
  TargetAudiencesLayout,
  ProblemQuoteLayout,
  ProblemSupportingPointsLayout,
  ProblemTwoQuotesLayout,
  ProcessLayout,
  ProgressLayout,
  QuoteLayout,
  OpportunityMetricsLayout,
  PartnersLayout,
  PricingThreeTierLayout,
  ProblemImageLayout,
  FAQLayout,
  FeatureShowcaseLayout,
  GalleryLayout,
  NextStepsLayout,
  CustomerQuotesLayout,
  CustomerStoriesLayout,
  DiscoveryInsightsLayout,
  DocIntroLayout,
  ComparisonLayout,
  ComparisonOldNewLayout,
  CodeExampleLayout,
  AwardsLayout,
  IntroductionLayout,
  KeyInsightsLayout,
  MetricDashboardLayout,
  SummaryLayout,
  TechnicalWalkthroughLayout,
];

/**
 * Normalize IDs to be deterministic
 */
function normalizeRows(rows: any[]): any[] {
  return rows.map((row, rowIndex) => ({
    ...row,
    id: `row-${rowIndex}`,
    blocks: row.blocks.map((block: any, blockIndex: number) => ({
      ...block,
      id: `block-${rowIndex}-${blockIndex}`,
    })),
  }));
}

async function main() {
  const outputDir = path.join(process.cwd(), "scripts", "template-exports");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const exports: any[] = [];

  for (const template of templates) {
    try {
      const rows = template.getRows();
      const normalizedRows = normalizeRows(rows);

      const templateData = {
        id: template.id,
        name: template.name,
        description: template.description,
        icon: template.icon,
        rows: normalizedRows,
      };

      exports.push(templateData);

      // Write individual JSON file
      const fileName = `${template.id.replace(/-layout$/, "")}.json`;
      const filePath = path.join(outputDir, fileName);
      fs.writeFileSync(
        filePath,
        JSON.stringify(templateData, null, 2),
        "utf-8"
      );

      console.log(`✓ Exported: ${template.id}`);
    } catch (error: any) {
      console.error(`Error exporting ${template.id}:`, error.message);
    }
  }

  // Write combined export
  const combinedPath = path.join(outputDir, "all-templates.json");
  fs.writeFileSync(combinedPath, JSON.stringify(exports, null, 2), "utf-8");

  console.log(`\n✅ Exported ${exports.length} templates to ${outputDir}`);
  console.log(`📦 Combined export: ${combinedPath}`);
}

main().catch(console.error);

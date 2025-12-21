import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import {
  BLOCK_TYPES,
  createFeatureListContent,
  createCtaContent,
} from "../blocks/definitions";
import type { Block } from "@/types/presentation";
import { createParagraphContent } from "@/types/presentation";

export const DocIntroLayout = {
  id: "doc-intro-layout",
  name: "Document Intro",
  description: "Introductory page for docs or proposals",
  icon: "📑",
  getRows: (): Row[] => {
    const intro: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "<h1 style=\"text-align: center\">Project Alpha: Executive Brief</h1>\n\n<p style=\"text-align: center\">This document outlines the strategic vision, scope, and implementation plan for the upcoming Q3 initiatives. Our goal is to align all stakeholders on the critical path to launch.</p>",
    };

    const sections = createFeatureListContent();
    sections.layout = "grid";
    sections.columns = 2; // 2x2 grid for 4 items
    sections.features = [
      {
        icon: "🎯",
        title: createParagraphContent("Strategic Vision"),
        description: createParagraphContent("To become the market leader in automated workflows by delivering a zero-touch experience for enterprise clients by Q4."),
      },
      {
        icon: "🗺️",
        title: createParagraphContent("Scope & Deliverables"),
        description: createParagraphContent("Includes the core platform rebuild, new API gateway, and the customer migration wizard. Out of scope: Legacy mobile app updates."),
      },
      {
        icon: "📅",
        title: createParagraphContent("Timeline & Milestones"),
        description: createParagraphContent("Phase 1 (Planning): June 1-15. Phase 2 (Dev): June 15 - Aug 15. Phase 3 (QA/Launch): Aug 15 - Sept 1."),
      },
      {
        icon: "📊",
        title: createParagraphContent("Success Metrics"),
        description: createParagraphContent("Targeting 99.99% uptime, <100ms API latency, and a 20% increase in user retention post-migration."),
      },
    ];

    const cta = createCtaContent();
    cta.heading = createParagraphContent("Ready to proceed?");
    cta.body = createParagraphContent("Please review the attached technical appendix before signing off on the budget allocation.");
    cta.buttonLabel = "Approve Project Charter";

    return [
      {
        id: nanoid(),
        blocks: [intro],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.FEATURE_LIST, content: sections },
        ],
      },
      {
        id: nanoid(),
        blocks: [{ id: nanoid(), type: BLOCK_TYPES.CTA, content: cta }],
      },
    ];
  },
};

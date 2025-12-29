/**
 * Template Registry
 * Centralized export and registry for all slide templates.
 * Provides search, filter, and categorization capabilities.
 */

// Import only remaining templates
import { CodeExampleLayout } from "./CodeExampleLayout";
import { IntroductionLayout } from "./IntroductionLayout";

import type { LayoutTemplate } from "@/types/presentation";
import type { TemplateCategory, TemplateMetadata } from "./template-utils";

// Re-export remaining templates for direct import
export {
  CodeExampleLayout,
  IntroductionLayout,
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

  // Content Templates
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
  ];

  return categories.map((category) => ({
    category,
    count: getTemplatesByCategory(category).length,
  }));
}

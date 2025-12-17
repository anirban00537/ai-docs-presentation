import type { ProseMirrorDocument } from "./common";
import { createParagraphContent } from "./common";

export interface LogoItem {
  image?: string;
  name: ProseMirrorDocument;
  link?: string;
}

export interface LogoGridContent {
  type: "logo-grid";
  logos: LogoItem[];
  columns: 3 | 4 | 5 | 6;
  grayscale?: boolean;
}

export const createLogoGridContent = (): LogoGridContent => ({
  type: "logo-grid",
  logos: [
    {
      name: createParagraphContent("Company 1"),
      link: "https://example.com",
    },
    {
      name: createParagraphContent("Company 2"),
      link: "https://example.com",
    },
    {
      name: createParagraphContent("Company 3"),
      link: "https://example.com",
    },
  ],
  columns: 4,
  grayscale: true,
});

import {
  normalizeToMarkdown,
  isLegacyProseMirrorFormat,
  isMarkdownFormat,
} from "@/lib/markdown/prosemirror-converter";

export const normalizeLogoGridContent = (content: any): LogoGridContent => {
  const incoming = content as LogoGridContent | undefined;
  if (incoming?.logos && Array.isArray(incoming.logos)) {
    return {
      type: "logo-grid",
      logos: incoming.logos.map((logo) => ({
        image: logo.image,
        name: isMarkdownFormat(logo.name)
          ? logo.name
          : isLegacyProseMirrorFormat(logo.name)
          ? normalizeToMarkdown(logo.name)
          : createParagraphContent("Company"),
        link: logo.link,
      })),
      columns: incoming.columns ?? 4,
      grayscale: incoming.grayscale ?? true,
    };
  }
  return createLogoGridContent();
};

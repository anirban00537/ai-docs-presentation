import type { LogoGridContent, ProseMirrorDocument } from "@/types/presentation";

import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
  isMarkdownFormat 
} from "@/lib/markdown/prosemirror-converter";

export const createLogoGridContent = (): LogoGridContent => ({
  type: "logo-grid",
  logos: [
    {
      name: "Company 1",
      link: "https://example.com",
    },
    {
      name: "Company 2",
      link: "https://example.com",
    },
    {
      name: "Company 3",
      link: "https://example.com",
    },
  ],
  columns: 4,
  grayscale: true,
});

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
          : "Company",
        link: logo.link,
      })),
      columns: incoming.columns ?? 4,
      grayscale: incoming.grayscale ?? true,
    };
  }
  return createLogoGridContent();
};

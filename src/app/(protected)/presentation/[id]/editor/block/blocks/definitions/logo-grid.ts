import { LogoGridContentSchema, type LogoGridContent } from "@/types/presentation";

import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
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
  if (!content || typeof content !== "object") return createLogoGridContent();

  const logos = Array.isArray(content.logos)
    ? content.logos.map((logo: any) => ({
        ...logo,
        name: isLegacyProseMirrorFormat(logo.name)
          ? normalizeToMarkdown(logo.name)
          : typeof logo.name === "string"
          ? logo.name
          : "Company",
      }))
    : [];

  const result = LogoGridContentSchema.safeParse({
    ...content,
    logos,
  });

  if (result.success) {
    return result.data;
  }

  return createLogoGridContent();
};

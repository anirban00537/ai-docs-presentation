import { ImageContent } from "@/types/presentation";

export const createImageContent = (url: string = "", alt?: string, attribution?: { name: string; link: string }): ImageContent => ({
  type: "image",
  url,
  alt: alt || "",
  caption: "",
  objectFit: "cover",
  attribution,
});

export const normalizeImageContent = (content: any): ImageContent => {
  return {
    type: "image",
    url: typeof content?.url === "string" ? content.url : "",
    alt: typeof content?.alt === "string" ? content.alt : "",
    caption: typeof content?.caption === "string" ? content.caption : "",
    width: typeof content?.width === "number" ? content.width : undefined,
    height: typeof content?.height === "number" ? content.height : undefined,
    objectFit: ["cover", "contain", "fill"].includes(content?.objectFit) ? content.objectFit : "cover",
    attribution: content?.attribution ? {
      name: typeof content.attribution.name === "string" ? content.attribution.name : "",
      link: typeof content.attribution.link === "string" ? content.attribution.link : "",
    } : undefined,
  };
};

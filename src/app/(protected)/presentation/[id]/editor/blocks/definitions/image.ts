export interface ImageContent {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  attribution?: {
    name: string;
    link: string;
  };
  objectFit?: "cover" | "contain" | "fill";
}

export const createImageContent = (url: string = "", alt?: string, attribution?: { name: string; link: string }): ImageContent => ({
  url,
  alt: alt || "",
  caption: "",
  objectFit: "cover",
  attribution,
});

export const normalizeImageContent = (content: any): ImageContent => {
  return {
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

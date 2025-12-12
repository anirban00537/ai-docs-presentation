import type { ProseMirrorDocument } from "./common";

export interface VideoContent {
  type: "video";
  source: "youtube" | "vimeo" | "custom";
  url: string;
  thumbnail?: string;
  autoplay?: boolean;
  loop?: boolean;
  title?: ProseMirrorDocument;
}

export const createVideoContent = (): VideoContent => ({
  type: "video",
  source: "youtube",
  url: "",
  thumbnail: "",
  autoplay: false,
  loop: false,
});

const hasValidDoc = (doc?: ProseMirrorDocument) =>
  doc?.type === "doc" && Array.isArray(doc.content);

export const normalizeVideoContent = (content: any): VideoContent => {
  const incoming = content as VideoContent | undefined;
  if (incoming) {
    return {
      type: "video",
      source: incoming.source ?? "youtube",
      url: incoming.url ?? "",
      thumbnail: incoming.thumbnail,
      autoplay: incoming.autoplay ?? false,
      loop: incoming.loop ?? false,
      title: hasValidDoc(incoming.title) ? incoming.title : undefined,
    };
  }
  return createVideoContent();
};

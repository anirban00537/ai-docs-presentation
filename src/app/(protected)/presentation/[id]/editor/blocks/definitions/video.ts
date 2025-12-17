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

import { normalizeToMarkdown, isLegacyProseMirrorFormat, isMarkdownFormat } from "@/lib/markdown/prosemirror-converter";

export const normalizeVideoContent = (content: any): VideoContent => {
  const incoming = content as VideoContent | undefined;
  if (incoming) {
    const title = incoming.title
      ? (isMarkdownFormat(incoming.title)
          ? incoming.title
          : isLegacyProseMirrorFormat(incoming.title)
          ? normalizeToMarkdown(incoming.title)
          : undefined)
      : undefined;
    
    return {
      type: "video",
      source: incoming.source ?? "youtube",
      url: incoming.url ?? "",
      thumbnail: incoming.thumbnail,
      autoplay: incoming.autoplay ?? false,
      loop: incoming.loop ?? false,
      title,
    };
  }
  return createVideoContent();
};

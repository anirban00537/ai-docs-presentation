import { VideoContentSchema, type VideoContent } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const createVideoContent = (): VideoContent => ({
  type: "video",
  source: "youtube",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  thumbnail: "",
  autoplay: false,
  loop: false,
});

export const normalizeVideoContent = (content: any): VideoContent => {
  if (!content || typeof content !== "object") return createVideoContent();

  const title = isLegacyProseMirrorFormat(content.title)
    ? normalizeToMarkdown(content.title)
    : typeof content.title === "string"
    ? content.title
    : undefined;
  
  const result = VideoContentSchema.safeParse({
    ...content,
    title,
  });

  if (result.success) {
    return result.data;
  }

  return createVideoContent();
};

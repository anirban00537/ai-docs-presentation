import React, { useCallback, useMemo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createVideoContent, type VideoContent } from "../definitions";
import { withAlpha } from "../utils";
import { IconPlayerPlay } from "@tabler/icons-react";

interface VideoBlockProps {
  block: Block;
  onUpdate: (content: VideoContent) => void;
  theme: Theme;
  placeholder?: string;
}

const getVideoEmbedUrl = (url: string, source: string): string => {
  if (!url) return "";

  if (source === "youtube") {
    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  if (source === "vimeo") {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : "";
  }

  return url;
};

export const VideoBlock: React.FC<VideoBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = (block.content as VideoContent) ?? createVideoContent();
  const { source, url, thumbnail, autoplay, loop, title } = content;
  const [isPlaying, setIsPlaying] = useState(false);

  const embedUrl = useMemo(() => {
    if (!isPlaying || !url) return "";
    const baseUrl = getVideoEmbedUrl(url, source);
    if (!baseUrl) return "";
    const params = new URLSearchParams();
    if (autoplay) params.append("autoplay", "1");
    if (loop) params.append("loop", "1");
    return params.toString() ? `${baseUrl}?${params}` : baseUrl;
  }, [url, source, autoplay, loop, isPlaying]);

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...content,
        url: e.target.value,
      });
    },
    [content, onUpdate]
  );

  const handleTitleChange = useCallback(
    (newContent: any) => {
      onUpdate({
        ...content,
        title: newContent,
      });
    },
    [content, onUpdate]
  );

  return (
    <div
      className="w-full rounded-2xl overflow-hidden relative group"
      style={{
        backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.75),
        backdropFilter: "blur(12px)",
        border: `1px solid ${withAlpha(theme.primary, 0.15)}`,
        boxShadow: `0 4px 12px -2px ${withAlpha(theme.primary, 0.05)}`,
      }}
    >
      {isPlaying && embedUrl ? (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          className="relative w-full flex items-center justify-center cursor-pointer"
          style={{
            aspectRatio: "16/9",
            backgroundColor: withAlpha(theme.primary, 0.05),
          }}
          onClick={() => url && setIsPlaying(true)}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.cardBackground,
                }}
              >
                <IconPlayerPlay className="size-10 ml-1" />
              </div>
              {title && (
                <div className="mb-2">
                  <ProseMirrorEditor
                    key={`${block.id}-title`}
                    blockId={`${block.id}-title`}
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Video Title"
                    className="text-lg font-semibold"
                  />
                </div>
              )}
            </div>
          )}
          {!thumbnail && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: withAlpha(theme.primary, 0.9),
                  color: theme.cardBackground,
                }}
              >
                <IconPlayerPlay className="size-10 ml-1" />
              </div>
            </div>
          )}
        </div>
      )}
      {!isPlaying && (
        <div className="p-4">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder={`Enter ${source} URL...`}
            className="w-full px-4 py-2 rounded-lg border text-sm"
            style={{
              backgroundColor: withAlpha(theme.cardBackground, 0.5),
              borderColor: withAlpha(theme.primary, 0.2),
              color: theme.bodyColor,
            }}
          />
        </div>
      )}
    </div>
  );
};

import React, { useMemo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import { createVideoContent, type VideoContent } from "../definitions";
import { IconVideo, IconPlayerPlay } from "@tabler/icons-react";
import { CommonCard } from "../CommonCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlockWrapper } from "../../block/BlockWrapper";

interface VideoBlockProps {
  block: Block;
  onUpdate: (content: VideoContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

const getVideoEmbedUrl = (
  url: string,
  source: string,
  autoplay = false,
  loop = false
): string => {
  if (!url) return "";

  let embedUrl = url;

  if (source === "youtube") {
    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    )?.[1];
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const params = new URLSearchParams();
      if (autoplay) params.append("autoplay", "1");
      if (loop) params.append("loop", "1");
      return params.toString() ? `${embedUrl}?${params}` : embedUrl;
    }
  }

  if (source === "vimeo") {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    if (videoId) {
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
      const params = new URLSearchParams();
      if (autoplay) params.append("autoplay", "1");
      if (loop) params.append("loop", "1");
      return params.toString() ? `${embedUrl}?${params}` : embedUrl;
    }
  }

  return embedUrl;
};

export const VideoBlock: React.FC<VideoBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = (block.content as VideoContent) ?? createVideoContent();
  const { source, url, autoplay, loop, title } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempSource, setTempSource] = useState(source);
  const [tempUrl, setTempUrl] = useState(url);
  const [tempAutoplay, setTempAutoplay] = useState(autoplay);
  const [tempLoop, setTempLoop] = useState(loop);
  const isDark = theme.themeType === "dark";

  const embedUrl = useMemo(() => {
    return getVideoEmbedUrl(url, source, autoplay, loop);
  }, [url, source, autoplay, loop]);

  const handleOpenEdit = () => {
    setTempSource(source);
    setTempUrl(url);
    setTempAutoplay(autoplay || false);
    setTempLoop(loop || false);
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      source: tempSource,
      url: tempUrl,
      autoplay: tempAutoplay,
      loop: tempLoop,
    });
    setIsEditOpen(false);
  };

  const handleTitleChange = (newContent: any) => {
    onUpdate({ ...content, title: newContent });
  };

  return (
    <BlockWrapper onEdit={handleOpenEdit} className="h-full" theme={theme}>
      <CommonCard
        theme={theme}
        className="w-full overflow-hidden relative group h-full flex flex-col border-none transition-all duration-300 hover:shadow-2xl"
        style={{ borderRadius: "24px" }}
      >
        {embedUrl ? (
          <>
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video player"
              />
            </div>
            {(title || !isDark) && (
              <div
                className="p-6 relative overflow-hidden"
                style={{ backgroundColor: isDark ? "rgba(30,30,35,0.5)" : "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}
              >
                {/* Minimal Gradient Background Blob */}
                <div
                  className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-[0.03] blur-xl pointer-events-none"
                  style={{ backgroundColor: theme.primary }}
                />
                <ProseMirrorEditor
                  key={`${block.id}-title`}
                  blockId={`${block.id}-title`}
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Video Title"
                  className="text-lg font-bold tracking-tight relative z-10"
                  theme={theme}
                />
              </div>
            )}
          </>
        ) : (
          <div
            className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-12 text-center cursor-pointer transition-all relative overflow-hidden group/empty"
            onClick={handleOpenEdit}
          >
            {/* Minimal Gradient Background Blob */}
            <div
              className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.05] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover/empty:scale-150"
              style={{ backgroundColor: theme.primary }}
            />
            
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 transition-all border shadow-sm group-hover/empty:scale-110 group-hover/empty:rotate-3"
              style={{
                backgroundColor: `${theme.primary}10`,
                borderColor: `${theme.primary}20`,
                color: theme.primary,
                backdropFilter: "blur(8px)"
              }}
            >
              <IconPlayerPlay size={28} strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
              <h3
                className="text-xl font-bold mb-2 tracking-tight"
                style={{ color: theme.headingColor }}
              >
                Add Video
              </h3>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 max-w-[200px] mx-auto"
                style={{ color: theme.bodyColor }}
              >
                Embed from YouTube, Vimeo, or direct link
              </p>
            </div>
          </div>
        )}

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent
            className="sm:max-w-[400px]"
            style={{
              backgroundColor: isDark
                ? "rgba(20,20,24,0.98)"
                : "rgba(255,255,255,0.98)",
              backdropFilter: "blur(20px)",
              border: "none",
            }}
          >
            <DialogHeader>
              <DialogTitle style={{ color: isDark ? "#fff" : "#000" }}>
                Video Settings
              </DialogTitle>
              <DialogDescription
                style={{
                  color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                }}
              >
                Configure video options.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label style={{ color: isDark ? "#fff" : "#000" }}>
                  Source
                </Label>
                <Select
                  value={tempSource}
                  onValueChange={(v: any) => setTempSource(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="custom">Direct Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label style={{ color: isDark ? "#fff" : "#000" }}>
                  Video URL
                </Label>
                <Input
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-between">
                <Label style={{ color: isDark ? "#fff" : "#000" }}>
                  Autoplay
                </Label>
                <Switch
                  checked={tempAutoplay}
                  onCheckedChange={setTempAutoplay}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label style={{ color: isDark ? "#fff" : "#000" }}>Loop</Label>
                <Switch checked={tempLoop} onCheckedChange={setTempLoop} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                style={{ backgroundColor: theme.primary }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CommonCard>
    </BlockWrapper>
  );
};

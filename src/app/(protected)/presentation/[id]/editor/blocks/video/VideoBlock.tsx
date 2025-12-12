import React, { useMemo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createVideoContent, type VideoContent } from "../definitions";
import { withAlpha } from "../utils";
import { IconVideo } from "@tabler/icons-react";
import { BlockWrapper } from "../BlockWrapper";
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

interface VideoBlockProps {
  block: Block;
  onUpdate: (content: VideoContent) => void;
  theme: Theme;
  placeholder?: string;
}

const getVideoEmbedUrl = (url: string, source: string, autoplay = false, loop = false): string => {
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
  const { source, url, thumbnail, autoplay, loop, title } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Local state for the modal form
  const [tempSource, setTempSource] = useState(source);
  const [tempUrl, setTempUrl] = useState(url);
  const [tempAutoplay, setTempAutoplay] = useState(autoplay);
  const [tempLoop, setTempLoop] = useState(loop);

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
    onUpdate({
      ...content,
      title: newContent,
    });
  };

  return (
    <BlockWrapper onEdit={handleOpenEdit} className="h-full" theme={theme}>
      <div
        className="w-full rounded-2xl overflow-hidden relative group h-full flex flex-col"
        style={{
          backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.75),
          backdropFilter: "blur(12px)",
          border: `1px solid ${withAlpha(theme.primary, 0.15)}`,
          boxShadow: `0 4px 12px -2px ${withAlpha(theme.primary, 0.05)}`,
        }}
      >
        {embedUrl ? (
          <>
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video player"
              />
            </div>
            {title && (
              <div className="p-4 bg-background/50 backdrop-blur-sm">
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
           </>
        ) : (
          <div
            className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors"
            style={{
              backgroundColor: withAlpha(theme.primary, 0.03),
            }}
            onClick={handleOpenEdit}
          >
             <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.cardBackground,
                }}
              >
                <IconVideo className="size-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Add Video</h3>
              <p className="text-sm opacity-60 max-w-xs mx-auto mb-6">
                Embed a video from YouTube, Vimeo, or a direct link.
              </p>
              <Button onClick={(e) => { e.stopPropagation(); handleOpenEdit(); }}>
                Configure Video
              </Button>
          </div>
        )}

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Video Block</DialogTitle>
              <DialogDescription>
                Configure your video options.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label>Video Source</Label>
                <Select
                  value={tempSource}
                  onValueChange={(v: any) => setTempSource(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="custom">Direct Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoplay-mode">Autoplay</Label>
                <Switch
                  id="autoplay-mode"
                  checked={tempAutoplay}
                  onCheckedChange={setTempAutoplay}
                />
              </div>

               <div className="flex items-center justify-between">
                <Label htmlFor="loop-mode">Loop</Label>
                <Switch
                  id="loop-mode"
                  checked={tempLoop}
                  onCheckedChange={setTempLoop}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BlockWrapper>
  );
};

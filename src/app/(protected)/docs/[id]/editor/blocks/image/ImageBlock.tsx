import React, { useState, memo } from "react";
import type { Block, Theme } from "@/types/presentation";
import { type ImageContent } from "@/types/presentation";
import { IconPhoto, IconExternalLink, IconRectangleVertical, IconRectangle, IconPhotoPlus } from "@tabler/icons-react";
import { CommonCard } from "../CommonCard";
import { cn } from "@/lib/utils";
import {
  ImagePickerModal,
  type SelectedImage,
} from "../../panels/ImagePickerModal";

interface ImageBlockProps {
  block: Block;
  onUpdate: (content: ImageContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const ImageBlock = memo(function ImageBlock({
  block,
  onUpdate,
  theme,
  readOnly = false,
}: ImageBlockProps) {
  const content = block.content as ImageContent;
  const { url, alt, caption, objectFit = "cover", height = 450, attribution } = content;
  const isDark = theme.themeType === "dark";

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageSelect = (image: SelectedImage) => {
    onUpdate({
      ...content,
      url: image.url,
      alt: image.alt || "",
      attribution: image.attribution,
    });
    setIsModalOpen(false);
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    onUpdate({ ...content, caption: e.target.value });
  };

  const toggleHeightMode = () => {
    if (readOnly) return;
    // Modes: Standard (450), Wide (300), Natural (0)
    let nextHeight = 450;
    if (height === 450) nextHeight = 300;
    else if (height === 300) nextHeight = 0; // Natural
    else nextHeight = 450;

    onUpdate({ 
      ...content, 
      type: "image",
      height: nextHeight,
      // Default to cover for fixed heights, contain for natural
      objectFit: nextHeight === 0 ? "contain" : "cover"
    });
  };

  const getHeightIcon = () => {
    if (height === 0) return <IconPhotoPlus size={14} />;
    if (height === 300) return <IconRectangle size={14} />;
    return <IconRectangleVertical size={14} />;
  };

  const getHeightLabel = () => {
    if (height === 0) return "Original (Natural)";
    if (height === 300) return "Wide (Panoramic)";
    return "Classic (Standard)";
  };

  const openModal = () => {
    if (readOnly) return;
    setIsModalOpen(true);
  };

  // Empty state
  if (!url) {
    return (
      <>
        <CommonCard
          theme={theme}
          onClick={openModal}
          className={`w-full h-64 flex flex-col items-center justify-center gap-4 transition-all duration-300 relative overflow-hidden group/empty ${!readOnly ? 'cursor-pointer' : ''}`}
          style={{
            borderRadius: "24px",
            color: theme.bodyColor,
          }}
        >
          {/* Minimal Gradient Background Blob */}
          <div
            className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.05] blur-2xl pointer-events-none transition-transform duration-700 ease-out"
            style={{ backgroundColor: theme.primary }}
          />
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center border shadow-sm transition-all"
            style={{ 
              backgroundColor: `${theme.primary}10`,
              borderColor: `${theme.primary}20`,
              backdropFilter: "blur(8px)"
            }}
          >
            <IconPhoto size={32} stroke={1.5} style={{ color: theme.primary }} />
          </div>
          <div className="text-center">
            <span className="text-base font-bold tracking-tight block">
              {readOnly ? "No image provided" : "Drop an image or click"}
            </span>
            {!readOnly && (
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40">To add to your presentation</span>
            )}
          </div>
        </CommonCard>

        {!readOnly && (
          <ImagePickerModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={handleImageSelect}
          />
        )}
      </>
    );
  }

  return (
    <>
      <CommonCard 
        theme={theme}
        className="w-full h-full min-w-0 min-h-0 flex flex-col gap-0 group/image relative p-0 overflow-hidden border-none transition-all duration-500"
        style={{ borderRadius: "24px" }}
      >
        {/* Image Container */}
        <div 
          className={cn(
            "relative w-full overflow-hidden transition-all duration-500",
            height === 0 ? "h-auto" : "flex-1 min-h-0"
          )}
          style={{
            backgroundColor: `${theme.primary}05`,
            height: height > 0 ? `${height}px` : "auto",
            minHeight: height > 0 ? `${height}px` : "200px",
            maxHeight: height > 0 ? `${height}px` : "100%"
          }}
        >
          <img
            key={`${url}-${height}`}
            src={url}
            alt={alt || caption || "Image"}
            className={cn(
              "w-full h-full transition-transform duration-700 ease-out",
              height === 0 ? "object-contain" : "object-cover"
            )}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: height === 0 ? "contain" : "cover"
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />

          {/* Overlay Controls (only in edit mode) */}
          {!readOnly && (
            <div 
              className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/image:opacity-100 backdrop-blur-0 group-hover/image:backdrop-blur-[2px]"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={openModal}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-xl border"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "#000",
                  }}
                >
                  Change Image
                </button>
                 <button
                   onClick={toggleHeightMode}
                   className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-xl border flex items-center gap-2"
                   style={{
                     backgroundColor: "rgba(255,255,255,0.95)",
                     borderColor: "rgba(255,255,255,0.2)",
                     color: "#000",
                   }}
                   title={`Current: ${getHeightLabel()}`}
                 >
                   {getHeightIcon()}
                   {getHeightLabel()}
                 </button>
              </div>
            </div>
          )}
        </div>
      </CommonCard>

      {!readOnly && (
        <ImagePickerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleImageSelect}
        />
      )}
    </>
  );
});

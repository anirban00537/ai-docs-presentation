import React, { useState, memo } from "react";
import type { Block, Theme } from "@/types/presentation";
import { type ImageContent } from "@/types/presentation";
import { IconPhoto, IconExternalLink } from "@tabler/icons-react";
import { CommonCard } from "../CommonCard";
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
  const { url, alt, caption, objectFit = "cover", attribution } = content;
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

  const toggleObjectFit = () => {
    if (readOnly) return;
    const newFit = objectFit === "cover" ? "contain" : objectFit === "contain" ? "fill" : "cover";
    onUpdate({ ...content, objectFit: newFit });
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
          className={`w-full h-64 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:shadow-lg relative overflow-hidden group/empty ${!readOnly ? 'cursor-pointer' : ''}`}
          style={{
            borderRadius: "24px",
            color: theme.bodyColor,
          }}
        >
          {/* Minimal Gradient Background Blob */}
          <div
            className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.05] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover/empty:scale-150"
            style={{ backgroundColor: theme.primary }}
          />
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center border shadow-sm transition-all group-hover/empty:scale-110 group-hover/empty:rotate-3"
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
            theme={theme}
          />
        )}
      </>
    );
  }

  return (
    <>
      <CommonCard 
        theme={theme}
        className="w-full h-full flex flex-col gap-0 group/image relative p-0 overflow-hidden border-none transition-all duration-500 hover:shadow-2xl"
        style={{ borderRadius: "24px" }}
      >
        {/* Image Container */}
        <div 
          className="relative w-full flex-1 min-h-[300px] overflow-hidden"
          style={{
            backgroundColor: `${theme.primary}05`,
          }}
        >
          <img
            src={url}
            alt={alt || caption || "Image"}
            className="w-full h-full transition-transform duration-700 ease-out group-hover/image:scale-105"
            style={{
              objectFit: objectFit,
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
                  onClick={toggleObjectFit}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-xl border"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "#000",
                  }}
                  title={`Current: ${objectFit}`}
                >
                  {objectFit === "cover" ? "Fit" : objectFit === "contain" ? "Fill" : "Cover"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Caption Section */}
        {(caption || !readOnly) && (
          <div 
            className="p-6 relative z-10"
            style={{ 
              backgroundColor: isDark ? "rgba(30,30,35,0.5)" : "rgba(255,255,255,0.5)",
              backdropFilter: "blur(12px)"
            }}
          >
            {/* Minimal Gradient Background Blob */}
            <div
              className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-[0.03] blur-xl pointer-events-none"
              style={{ backgroundColor: theme.primary }}
            />

            {!readOnly ? (
              <input
                type="text"
                value={caption || ""}
                onChange={handleCaptionChange}
                placeholder="Add a caption..."
                className="w-full text-base font-bold bg-transparent border-0 outline-none transition-all tracking-tight leading-tight"
                style={{
                  color: theme.bodyColor,
                  opacity: caption ? 0.9 : 0.4,
                }}
              />
            ) : (
              <p
                className="text-base font-bold tracking-tight leading-tight opacity-90"
                style={{ color: theme.bodyColor }}
              >
                {caption}
              </p>
            )}
          </div>
        )}

        {/* Unsplash Attribution */}
        {attribution && attribution.name && (
          <a
            href={attribution.link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all opacity-0 group-hover/image:opacity-100 hover:scale-105"
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            Photo by {attribution.name}
            <IconExternalLink size={12} strokeWidth={2.5} />
          </a>
        )}
      </CommonCard>

      {!readOnly && (
        <ImagePickerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleImageSelect}
          theme={theme}
        />
      )}
    </>
  );
});

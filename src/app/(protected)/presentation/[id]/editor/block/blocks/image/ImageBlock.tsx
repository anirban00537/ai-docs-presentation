import React, { useState } from "react";
import type { Block, Theme } from "@/types/presentation";
import { type ImageContent } from "@/types/presentation";
import { IconPhoto, IconExternalLink } from "@tabler/icons-react";
import { ImagePickerModal, type SelectedImage } from "../../../panels/ImagePickerModal";
import { CommonCard } from "../CommonCard";

interface ImageBlockProps {
  block: Block;
  onUpdate: (content: ImageContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  onUpdate,
  theme,
  readOnly = false,
}) => {
  const content = block.content as ImageContent;
  const { url, alt, caption, objectFit = "cover", attribution } = content;

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
          className={`w-full h-48 flex flex-col items-center justify-center gap-3 transition-all ${!readOnly ? 'cursor-pointer' : ''} border-dashed`}
          style={{
            borderColor: `${theme.primary}30`,
            color: theme.bodyColor,
            borderWidth: '2px',
          }}
        >
          <IconPhoto size={40} stroke={1.5} style={{ opacity: 0.4 }} />
          <span className="text-sm font-medium opacity-50">
            {readOnly ? "No image" : "Click to add image"}
          </span>
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
        className="w-full h-full flex flex-col gap-0 group/image relative p-0 overflow-hidden border-none"
      >
        {/* Image Container */}
        <div 
          className="relative w-full flex-1 min-h-[200px]"
          style={{
            backgroundColor: `${theme.primary}05`,
          }}
        >
          <img
            src={url}
            alt={alt || caption || "Image"}
            className="w-full h-full transition-transform duration-500"
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
              className="absolute inset-0 bg-black/0 group-hover/image:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover/image:opacity-100"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={openModal}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    color: "#000",
                  }}
                >
                  Change Image
                </button>
                <button
                  onClick={toggleObjectFit}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
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

        {/* Caption Input */}
        {!readOnly && (
          <input
            type="text"
            value={caption || ""}
            onChange={handleCaptionChange}
            placeholder="Add a caption..."
            className="w-full text-sm bg-transparent border-0 outline-none px-1 py-1 transition-all"
            style={{
              color: theme.bodyColor,
              opacity: caption ? 1 : 0.5,
            }}
          />
        )}

        {/* Caption Display (read only) */}
        {readOnly && caption && (
          <p
            className="text-sm px-1 py-1"
            style={{ color: theme.bodyColor, opacity: 0.8 }}
          >
            {caption}
          </p>
        )}

        {/* Unsplash Attribution */}
        {attribution && attribution.name && (
          <a
            href={attribution.link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 text-[10px] px-2 py-1 rounded-md flex items-center gap-1 transition-all opacity-60 hover:opacity-100"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "#fff",
            }}
          >
            Photo by {attribution.name}
            <IconExternalLink size={10} />
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
};

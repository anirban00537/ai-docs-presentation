import React from "react";
import type { Block, Theme } from "@/types/presentation";
import {
  type ImageGalleryContent,
  type GalleryImage,
} from "@/types/presentation"; // image-gallery";
import { IconPhoto, IconTrash, IconPlus, IconColumns2, IconColumns3, IconLayoutGrid } from "@tabler/icons-react";
import { nanoid } from "nanoid";

interface ImageGalleryBlockProps {
  block: Block;
  onUpdate: (content: ImageGalleryContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
  isEditable?: boolean;
}

import { CommonCard } from "../CommonCard";

export const ImageGalleryBlock: React.FC<ImageGalleryBlockProps> = ({
  block,
  onUpdate,
  theme,
  isEditable = true,
}) => {
  const content = block.content as ImageGalleryContent;
  const images = content.images || [];
  const columns = content.columns || 3;
  const isDark = theme.themeType === "dark";

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (!url) return;
    
    const newImage: GalleryImage = {
      id: nanoid(),
      url,
      caption: "",
    };
    
    onUpdate({
      ...content,
      images: [...images, newImage],
    });
  };

  const removeImage = (id: string) => {
    onUpdate({
      ...content,
      images: images.filter(img => img.id !== id),
    });
  };

  const changeColumns = (cols: 2 | 3 | 4) => {
    onUpdate({ ...content, columns: cols });
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 relative group/gallery">
      {/* Controls Overlay */}
      <div
        className="absolute -top-2 right-0 flex items-center gap-1 opacity-0 group-hover/gallery:opacity-100 transition-all z-20 p-1 rounded-lg"
        style={{
          backgroundColor: isDark ? "rgba(30,30,35,0.95)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Column buttons */}
        <div className="flex items-center gap-0.5 pr-2 mr-1" style={{ borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}` }}>
          {[2, 3, 4].map((col) => (
            <button
              key={col}
              onClick={() => changeColumns(col as 2 | 3 | 4)}
              className="p-1.5 rounded-lg transition-all"
              style={{
                backgroundColor: columns === col ? `${theme.primary}20` : "transparent",
                color: columns === col ? theme.primary : (isDark ? "#aaa" : "#666"),
              }}
              title={`${col} Columns`}
            >
              {col === 2 && <IconColumns2 size={14} />}
              {col === 3 && <IconColumns3 size={14} />}
              {col === 4 && <IconLayoutGrid size={14} />}
            </button>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={addImage}
          className="p-1.5 rounded-lg transition-all flex items-center gap-1"
          style={{
            backgroundColor: `${theme.primary}15`,
            color: theme.primary,
          }}
        >
          <IconPlus size={14} stroke={2} />
        </button>
      </div>

      {/* Grid Layout */}
      <div 
        className="w-full grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {images.filter(img => img.url).map((img) => (
          <CommonCard 
            key={img.id} 
            theme={theme}
            className="group/img relative overflow-hidden transition-all p-0 border-none"
            style={{ 
              aspectRatio: '4/3',
            }}
          >
            <img 
              src={img.url} 
              alt={img.caption || ""} 
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
            />
            
            {/* Delete overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => removeImage(img.id)}
                style={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  color: "#ef4444",
                }}
                title="Remove Image"
              >
                <IconTrash size={16} />
              </button>
            </div>
          </CommonCard>
        ))}

        {/* Empty State */}
        {images.length === 0 && (
          <CommonCard 
            theme={theme}
            onClick={addImage}
            className="col-span-full h-48 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
            style={{
              color: `${theme.bodyColor}80`,
            }}
          >
            <IconPhoto size={32} stroke={1.5} style={{ opacity: 0.5 }} />
            <span className="text-sm font-medium opacity-50">Click to add images</span>
          </CommonCard>
        )}
      </div>
    </div>
  );
};

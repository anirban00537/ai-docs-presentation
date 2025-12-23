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
    <div className="w-full h-full flex flex-col gap-6 relative group/gallery p-4">
      {/* Controls Overlay */}
      <div
        className="absolute -top-4 right-4 flex items-center gap-2 opacity-0 group-hover/gallery:opacity-100 transition-all z-20 p-2 rounded-2xl shadow-xl border"
        style={{
          backgroundColor: isDark ? "rgba(30,30,35,0.8)" : "rgba(255,255,255,0.8)",
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Column buttons */}
        <div className="flex items-center gap-1 pr-2 mr-2" style={{ borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}` }}>
          {[2, 3, 4].map((col) => (
            <button
              key={col}
              onClick={() => changeColumns(col as 2 | 3 | 4)}
              className="p-2 rounded-xl transition-all"
              style={{
                backgroundColor: columns === col ? `${theme.primary}20` : "transparent",
                color: columns === col ? theme.primary : (isDark ? "#aaa" : "#666"),
              }}
              title={`${col} Columns`}
            >
              {col === 2 && <IconColumns2 size={16} />}
              {col === 3 && <IconColumns3 size={16} />}
              {col === 4 && <IconLayoutGrid size={16} />}
            </button>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={addImage}
          className="p-2 rounded-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95 shadow-sm"
          style={{
            backgroundColor: theme.primary,
            color: "#ffffff",
          }}
        >
          <IconPlus size={16} stroke={3} />
          <span className="text-[10px] font-bold uppercase tracking-wider pr-1">Add</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div 
        className="w-full grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {images.filter(img => img.url).map((img) => (
          <CommonCard 
            key={img.id} 
            theme={theme}
            className="group/img relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-none shadow-md"
            style={{ 
              aspectRatio: '4/3',
              borderRadius: "24px"
            }}
          >
            <img 
              src={img.url} 
              alt={img.caption || ""} 
              className="w-full h-full object-cover transform scale-100 group-hover/img:scale-110 transition-transform duration-700 ease-in-out" 
            />
            
            {/* Delete overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <button 
                onClick={() => removeImage(img.id)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110 hover:bg-white active:scale-90"
                style={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  color: "#ef4444",
                }}
                title="Remove Image"
              >
                <IconTrash size={20} />
              </button>
            </div>
          </CommonCard>
        ))}

        {/* Empty State */}
        {images.length === 0 && (
          <CommonCard 
            theme={theme}
            onClick={addImage}
            className="col-span-full h-64 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden group/empty"
            style={{
              color: `${theme.bodyColor}80`,
              borderRadius: "24px"
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
              <span className="text-base font-bold tracking-tight block">No images yet</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40">Click to add to your gallery</span>
            </div>
          </CommonCard>
        )}
      </div>
    </div>
  );
};

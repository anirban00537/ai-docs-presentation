import React, { useCallback } from "react";
import type { Block, Theme } from "@/lib/editor/types";
import {
  type ImageGalleryContent,
  type GalleryImage,
} from "../definitions/image-gallery";
import { withAlpha } from "../utils";
import { ImagePlus, LayoutGrid, Trash2, Columns2, Columns3, Columns4 } from "lucide-react";
import { nanoid } from "nanoid";

interface ImageGalleryBlockProps {
  block: Block;
  onUpdate: (content: ImageGalleryContent) => void;
  theme: Theme;
  placeholder?: string;
  isEditable?: boolean;
}

export const ImageGalleryBlock: React.FC<ImageGalleryBlockProps> = ({
  block,
  onUpdate,
  theme,
  isEditable = true,
}) => {
  const content = block.content as ImageGalleryContent;
  const images = content.images || [];
  const columns = content.columns || 3;
  const layout = content.layout || "masonry";

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
      {/* Controls Overlay (Visible on Hover) */}
      <div className="absolute -top-10 right-0 flex items-center gap-2 opacity-0 group-hover/gallery:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-gray-200 shadow-sm z-20">
         <div className="flex items-center border-r border-gray-200 pr-2 mr-2 gap-1">
            <button
            onClick={() => changeColumns(2)}
            className={`p-1 rounded ${columns === 2 ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            title="2 Columns"
            >
            <Columns2 className="w-4 h-4" />
            </button>
            <button
            onClick={() => changeColumns(3)}
            className={`p-1 rounded ${columns === 3 ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            title="3 Columns"
            >
            <Columns3 className="w-4 h-4" />
            </button>
            <button
            onClick={() => changeColumns(4)}
            className={`p-1 rounded ${columns === 4 ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            title="4 Columns"
            >
             <Columns4 className="w-4 h-4" />
            </button>
         </div>

        <button
          onClick={addImage}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors"
          style={{
              backgroundColor: withAlpha(theme.primary, 0.1),
              color: theme.primary,
          }}
        >
          <ImagePlus className="w-3.5 h-3.5" />
          Add Image
        </button>
      </div>

      {/* Grid Layout */}
      <div 
        className="w-full grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {images.map((img) => (
          <div 
            key={img.id} 
            className="group/img relative rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-lg hover:z-10"
            style={{ 
               aspectRatio: '4/3',
               backgroundColor: withAlpha(theme.primary, 0.05)
            }}
          >
            <img 
              src={img.url} 
              alt={img.caption || ""} 
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
            />
            
            {/* Image Overlay */}
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => removeImage(img.id)}
                  className="p-2 bg-white/90 rounded-full text-red-500 hover:bg-white transition-colors shadow-sm"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
             </div>
          </div>
        ))}

        {/* Empty State / Add Placeholder */}
        {images.length === 0 && (
          <div 
            onClick={addImage}
            className="col-span-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
            style={{
                borderColor: withAlpha(theme.bodyColor, 0.2),
                color: withAlpha(theme.bodyColor, 0.5),
                backgroundColor: withAlpha(theme.cardBackground, 0.5)
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.color = theme.primary;
                e.currentTarget.style.backgroundColor = withAlpha(theme.primary, 0.05);
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = withAlpha(theme.bodyColor, 0.2);
                e.currentTarget.style.color = withAlpha(theme.bodyColor, 0.5);
                e.currentTarget.style.backgroundColor = withAlpha(theme.cardBackground, 0.5);
            }}
          >
            <LayoutGrid className="w-10 h-10 opacity-50" />
            <span className="font-medium">Add images to create a gallery</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { memo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type {
  Block,
  Theme,
  ImageCardContent,
} from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createImageCardItem } from "../definitions/image-card-block";
import { IconPlus, IconX, IconPhoto } from "@tabler/icons-react";
import { getFontFamily } from "@/lib/fonts";
import {
  ImagePickerModal,
  type SelectedImage,
} from "../../panels/ImagePickerModal";

interface ImageCardBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const ImageCardBlock = memo(function ImageCardBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: ImageCardBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;

  const content = block.content as ImageCardContent;
  const items = content.items || [];
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);

  const handleItemUpdate = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onUpdate({
      ...content,
      items: newItems,
    });
  };

  const handleImageSelect = (image: SelectedImage) => {
    if (editingImageIndex === null) return;
    
    const newItems = [...items];
    newItems[editingImageIndex] = {
      ...newItems[editingImageIndex],
      imageUrl: image.url,
      imageAlt: image.alt || "",
      attribution: image.attribution,
    };
    onUpdate({
      ...content,
      items: newItems,
    });
    setIsImagePickerOpen(false);
    setEditingImageIndex(null);
  };

  const handleImageClick = (index: number) => {
    if (readOnly) return;
    setEditingImageIndex(index);
    setIsImagePickerOpen(true);
  };

  const handleAddItem = () => {
    const newItem = createImageCardItem();
    onUpdate({
      ...content,
      items: [...items, newItem],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (readOnly) return;
    const newItems = items.filter((_, i) => i !== index);
    onUpdate({
      ...content,
      items: newItems,
    });
  };

  return (
    <>
      <div
        className="group relative w-full h-full min-h-[200px] p-3"
        style={{
          fontFamily: getFontFamily(theme.fontFamily || "Inter"),
        }}
      >
        <div 
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className="relative group/card p-0 transition-all duration-500 overflow-hidden rounded-3xl"
              style={{
                backgroundColor: theme.cardBackground,
              }}
            >
              {/* Remove Button */}
              {!readOnly && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="absolute top-4 right-4 z-30 opacity-0 group-hover/card:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 bg-white/90 backdrop-blur-sm"
                >
                  <IconX size={16} stroke={2.5} />
                </button>
              )}

              {/* Image Container */}
              <div
                className="relative w-full h-48 overflow-hidden cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
                {item.imageUrl && item.imageUrl.trim() !== "" ? (
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt || ""}
                    className="w-full h-full transition-transform duration-700 ease-out group-hover/card:scale-105"
                    style={{
                      objectFit: item.objectFit || "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                    <div className="text-center">
                      <IconPhoto size={48} className="mx-auto mb-2 opacity-40" />
                      <span className="text-sm font-medium opacity-60">
                        {readOnly ? "No image" : "Click to add image"}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Image Overlay on Hover */}
                {!readOnly && item.imageUrl && (
                  <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/card:opacity-100">
                    <span className="text-white text-sm font-bold px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      Change Image
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Title Section */}
                <div className="mb-2">
                  <ProseMirrorEditor
                    key={`${item.id}-title`}
                    blockId={`${item.id}-title`}
                    value={
                      typeof item.title === "string"
                        ? item.title
                        : JSON.stringify(item.title)
                    }
                    onChange={(value) => handleItemUpdate(index, "title", value)}
                    placeholder="Card Title"
                    readOnly={readOnly}
                    theme={{
                      ...theme,
                      headingColor: theme.primary,
                    }}
                    className="text-xl font-bold tracking-tight"
                  />
                </div>

                {/* Description Section */}
                <div>
                  <ProseMirrorEditor
                    key={`${item.id}-description`}
                    blockId={`${item.id}-description`}
                    value={
                      typeof item.description === "string"
                        ? item.description
                        : JSON.stringify(item.description)
                    }
                    onChange={(value) =>
                      handleItemUpdate(index, "description", value)
                    }
                    placeholder="Add description here..."
                    readOnly={readOnly}
                    theme={theme}
                    className="text-base leading-relaxed opacity-60"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Button */}
        {!readOnly && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleAddItem}
              className="group/add flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 duration-300 shadow-md hover:shadow-xl"
              style={{
                backgroundColor: theme.primary,
                color: theme.cardBackground,
              }}
            >
              <IconPlus size={18} stroke={3} />
              <span className="text-sm font-black uppercase tracking-widest">
                Add Card
              </span>
            </button>
          </div>
        )}
      </div>

      {!readOnly && isImagePickerOpen && (
        <ImagePickerModal
          isOpen={isImagePickerOpen}
          onClose={() => {
            setIsImagePickerOpen(false);
            setEditingImageIndex(null);
          }}
          onSelect={handleImageSelect}
        />
      )}
    </>
  );
});

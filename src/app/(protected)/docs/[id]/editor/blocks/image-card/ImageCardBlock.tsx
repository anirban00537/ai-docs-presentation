import React, { memo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type {
  Block,
  Theme,
  ImageCardContent,
} from "@/types/docs";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { createImageCardItem } from "../definitions/image-card-block";
import { IconPlus, IconX, IconPhoto } from "@tabler/icons-react";
import { getFontFamily } from "@/lib/fonts";
import {
  ImagePickerModal,
  type SelectedImage,
} from "../../panels/ImagePickerModal";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { useCallback } from "react";

interface ImageCardBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
  isStreaming?: boolean;
}

export const ImageCardBlock = memo(function ImageCardBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
  isStreaming = false,
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
      imageUrl: image.imageUrl,
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
            <ImageCardItem
              key={item.id}
              item={item}
              index={index}
              theme={theme}
              readOnly={readOnly}
              onImageClick={handleImageClick}
              onRemove={handleRemoveItem}
              onUpdateContent={handleItemUpdate}
              onImageLoaded={(url) => {
                const newItems = [...items];
                newItems[index] = { ...newItems[index], imageUrl: url, imageQuery: undefined };
                onUpdate({ ...content, items: newItems });
              }}
              isStreaming={isStreaming}
            />
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

interface ImageCardItemProps {
  item: any;
  index: number;
  theme: Theme;
  readOnly: boolean;
  onImageClick: (index: number) => void;
  onRemove: (index: number) => void;
  onUpdateContent: (index: number, field: "title" | "description", value: string) => void;
  onImageLoaded: (url: string) => void;
  isStreaming?: boolean;
}

const ImageCardItem = memo(function ImageCardItem({
  item,
  index,
  theme,
  readOnly,
  onImageClick,
  onRemove,
  onUpdateContent,
  onImageLoaded,
  isStreaming = false,
}: ImageCardItemProps) {
  const { url, isLoading } = useLazyImage({
    imageUrl: item.imageUrl,
    imageQuery: item.imageQuery,
    orientation: 'squarish',
    onImageLoaded,
    disabled: isStreaming,
  });

  return (
    <div
      className="relative group/card p-0 transition-all duration-500 overflow-hidden rounded-3xl"
      style={{
        backgroundColor: theme.cardBackground,
      }}
    >
      {/* Remove Button */}
      {!readOnly && (
        <button
          onClick={() => onRemove(index)}
          className="absolute top-4 right-4 z-30 opacity-0 group-hover/card:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 bg-white/90 backdrop-blur-sm"
        >
          <IconX size={16} stroke={2.5} />
        </button>
      )}

      {/* Image Container */}
      <div
        className="relative w-full h-48 overflow-hidden cursor-pointer"
        onClick={() => onImageClick(index)}
      >
        {url ? (
          <img
            src={url}
            alt={item.imageAlt || ""}
            className="w-full h-full transition-transform duration-700 ease-out group-hover/card:scale-105"
            style={{
              objectFit: item.objectFit || "cover",
            }}
          />
        ) : (
          <ImagePlaceholder 
            isLoading={isLoading} 
            className="h-full border-none rounded-none"
          />
        )}
        
        {/* Image Overlay on Hover */}
        {!readOnly && url && (
          <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/card:opacity-100">
            <span className="text-white text-sm font-bold px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm">
              Change Image
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-2">
          <ProseMirrorEditor
            key={`${item.id}-title`}
            blockId={`${item.id}-title`}
            value={
              typeof item.title === "string"
                ? item.title
                : JSON.stringify(item.title)
            }
            onChange={(value) => onUpdateContent(index, "title", value)}
            placeholder="Card Title"
            readOnly={readOnly}
            theme={{
              ...theme,
              headingColor: theme.primary,
            }}
            className="text-xl font-bold tracking-tight"
          />
        </div>

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
              onUpdateContent(index, "description", value)
            }
            placeholder="Add description here..."
            readOnly={readOnly}
            theme={theme}
            className="text-base leading-relaxed opacity-60"
          />
        </div>
      </div>
    </div>
  );
});

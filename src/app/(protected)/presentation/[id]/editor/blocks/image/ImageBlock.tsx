import React, { useState, useCallback, useRef } from "react";
import type { Block, Theme } from "@/lib/editor/types";
import { type ImageContent } from "../definitions/image";
import { IconPhoto, IconExternalLink } from "@tabler/icons-react";
import { X, Search, Upload, Loader2, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  useSearchUnsplashPhotos,
  useRandomUnsplashPhotos,
  useListMedia,
  useUploadMedia,
  useTrackUnsplashDownload,
} from "@/hooks/use-images";
import type { UnsplashPhoto, MediaItem } from "@/services/images";

interface ImageBlockProps {
  block: Block;
  onUpdate: (content: ImageContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  onUpdate,
  theme,
  readOnly = false,
}) => {
  const content = block.content as ImageContent;
  const { url, alt, caption, objectFit = "cover", attribution } = content;
  const isDark = theme.themeType === "dark";

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"unsplash" | "uploads">("unsplash");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Unsplash queries
  const { data: searchResults, isLoading: isSearching } = useSearchUnsplashPhotos(
    { query: debouncedQuery, perPage: 30 },
    activeTab === "unsplash" && debouncedQuery.length > 0
  );
  
  const { data: randomPhotos, isLoading: isLoadingRandom } = useRandomUnsplashPhotos(
    { count: 30 },
    activeTab === "unsplash" && debouncedQuery.length === 0
  );

  // User uploads query
  const { data: userMedia, isLoading: isLoadingMedia } = useListMedia(
    { perPage: 50 }
  );

  // Mutations
  const uploadMedia = useUploadMedia();
  const trackDownload = useTrackUnsplashDownload();

  const unsplashPhotos = debouncedQuery 
    ? (searchResults?.data?.results || []) 
    : (Array.isArray(randomPhotos?.data) ? randomPhotos.data : []);
  const userPhotos = userMedia?.data?.list || [];

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadMedia.mutateAsync({
        file,
        name: file.name,
      });
      
      if (result.data) {
        onUpdate({
          ...content,
          url: result.data.url,
          alt: file.name,
          attribution: undefined,
        });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [content, onUpdate, uploadMedia]);

  const handleSelectUnsplashPhoto = useCallback(async (photo: UnsplashPhoto) => {
    // Track download for Unsplash attribution compliance
    try {
      await trackDownload.mutateAsync({ downloadLocation: photo.links.downloadLocation });
    } catch (error) {
      console.error("Failed to track download:", error);
    }

    onUpdate({
      ...content,
      url: photo.urls.regular,
      alt: photo.altDescription || "",
      attribution: {
        name: photo.user.name,
        link: `https://unsplash.com/@${photo.user.username}?utm_source=butterfast&utm_medium=referral`,
      },
    });
    setIsModalOpen(false);
  }, [content, onUpdate, trackDownload]);

  const handleSelectUserMedia = useCallback((media: MediaItem) => {
    onUpdate({
      ...content,
      url: media.url,
      alt: media.name,
      attribution: undefined,
    });
    setIsModalOpen(false);
  }, [content, onUpdate]);

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

        {/* Image Picker Modal */}
        <ImagePickerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isDark={isDark}
          theme={theme}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isSearching={isSearching}
          isLoadingRandom={isLoadingRandom}
          isLoadingMedia={isLoadingMedia}
          unsplashPhotos={unsplashPhotos}
          userPhotos={userPhotos}
          debouncedQuery={debouncedQuery}
          onSelectUnsplashPhoto={handleSelectUnsplashPhoto}
          onSelectUserMedia={handleSelectUserMedia}
          onFileUpload={handleFileUpload}
          fileInputRef={fileInputRef}
          isUploading={uploadMedia.isPending}
        />
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

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDark={isDark}
        theme={theme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        isSearching={isSearching}
        isLoadingRandom={isLoadingRandom}
        isLoadingMedia={isLoadingMedia}
        unsplashPhotos={unsplashPhotos}
        userPhotos={userPhotos}
        debouncedQuery={debouncedQuery}
        onSelectUnsplashPhoto={handleSelectUnsplashPhoto}
        onSelectUserMedia={handleSelectUserMedia}
        onFileUpload={handleFileUpload}
        fileInputRef={fileInputRef}
        isUploading={uploadMedia.isPending}
      />
    </>
  );
};

// Separate Modal Component for Image Picking
interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  theme: Theme;
  activeTab: "unsplash" | "uploads";
  setActiveTab: (tab: "unsplash" | "uploads") => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isSearching: boolean;
  isLoadingRandom: boolean;
  isLoadingMedia: boolean;
  unsplashPhotos: UnsplashPhoto[];
  userPhotos: MediaItem[];
  debouncedQuery: string;
  onSelectUnsplashPhoto: (photo: UnsplashPhoto) => void;
  onSelectUserMedia: (media: MediaItem) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  isDark,
  theme,
  activeTab,
  setActiveTab,
  searchQuery,
  onSearchChange,
  isSearching,
  isLoadingRandom,
  isLoadingMedia,
  unsplashPhotos,
  userPhotos,
  debouncedQuery,
  onSelectUnsplashPhoto,
  onSelectUserMedia,
  onFileUpload,
  fileInputRef,
  isUploading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="p-0 overflow-hidden border-0"
        style={{
          backgroundColor: isDark 
            ? "rgba(25, 25, 30, 0.95)" 
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          boxShadow: isDark
            ? "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset"
            : "0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.8) inset",
          maxWidth: "540px",
          maxHeight: "80vh",
        }}
      >
        {/* Glass shine overlay */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.02) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.2) 100%)",
          }}
        />

        <div className="relative flex flex-col h-full max-h-[80vh]">
          {/* Header */}
          <div 
            className="relative flex items-center justify-between px-5 py-4 border-b shrink-0"
            style={{ 
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            }}
          >
            <h3 
              className="text-base font-semibold"
              style={{ color: isDark ? "#fff" : "#000" }}
            >
              Choose Image
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                color: isDark ? "#fff" : "#000",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div 
            className="relative px-5 py-3 border-b shrink-0"
            style={{ 
              borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            }}
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "unsplash" | "uploads")}>
              <TabsList 
                className="w-full p-1 rounded-lg"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                }}
              >
                <TabsTrigger 
                  value="unsplash" 
                  className="flex-1 text-xs font-medium data-[state=active]:shadow-sm"
                  style={{
                    color: activeTab === "unsplash" ? theme.primary : (isDark ? "#999" : "#666"),
                    backgroundColor: activeTab === "unsplash" 
                      ? (isDark ? "rgba(255,255,255,0.1)" : "#fff") 
                      : "transparent",
                  }}
                >
                  Unsplash
                </TabsTrigger>
                <TabsTrigger 
                  value="uploads" 
                  className="flex-1 text-xs font-medium data-[state=active]:shadow-sm"
                  style={{
                    color: activeTab === "uploads" ? theme.primary : (isDark ? "#999" : "#666"),
                    backgroundColor: activeTab === "uploads" 
                      ? (isDark ? "rgba(255,255,255,0.1)" : "#fff") 
                      : "transparent",
                  }}
                >
                  My Uploads
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Upload button for uploads tab */}
            {activeTab === "uploads" && (
              <div className="mt-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: `${theme.primary}15`,
                    color: theme.primary,
                  }}
                >
                  {isUploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  {isUploading ? "Uploading..." : "Upload Image"}
                </button>
              </div>
            )}

            {/* Search for Unsplash */}
            {activeTab === "unsplash" && (
              <div className="mt-3 relative">
                <Search 
                  size={14} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                  style={{ color: isDark ? "#fff" : "#000" }}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search photos..."
                  className="pl-9 h-9 text-xs border-0"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    color: isDark ? "#fff" : "#000",
                  }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div 
            className="relative flex-1 overflow-y-auto px-5 py-4"
            style={{
              maxHeight: "400px",
            }}
          >
            {/* Loading States */}
            {(isSearching || isLoadingRandom || isLoadingMedia) && (
              <div className="flex items-center justify-center py-12">
                <Loader2 
                  size={24} 
                  className="animate-spin opacity-50"
                  style={{ color: theme.primary }}
                />
              </div>
            )}

            {/* Unsplash Images */}
            {activeTab === "unsplash" && !isSearching && !isLoadingRandom && (
              <>
                {unsplashPhotos.length === 0 && debouncedQuery ? (
                  <div className="flex items-center justify-center py-12">
                    <span 
                      className="text-xs opacity-50"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    >
                      No images found for &quot;{debouncedQuery}&quot;
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {unsplashPhotos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => onSelectUnsplashPhoto(photo)}
                        className="relative aspect-square rounded-lg overflow-hidden group transition-all hover:ring-2"
                        style={{
                          // @ts-expect-error CSS custom properties
                          "--tw-ring-color": theme.primary,
                        }}
                      >
                        <img
                          src={photo.urls.small}
                          alt={photo.altDescription || "Unsplash photo"}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Hover overlay */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5"
                          style={{
                            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                          }}
                        >
                          <span className="text-white text-[9px] truncate">
                            {photo.user.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* User Uploads */}
            {activeTab === "uploads" && !isLoadingMedia && (
              <>
                {userPhotos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Upload 
                      size={32} 
                      className="opacity-20"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    />
                    <span 
                      className="text-xs opacity-50"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    >
                      No uploads yet
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {userPhotos.map((media) => (
                      <button
                        key={media.id}
                        onClick={() => onSelectUserMedia(media)}
                        className="relative aspect-square rounded-lg overflow-hidden group transition-all hover:ring-2"
                        style={{
                          // @ts-expect-error CSS custom properties
                          "--tw-ring-color": theme.primary,
                        }}
                      >
                        <img
                          src={media.url}
                          alt={media.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Favorite indicator */}
                        {media.isFavorite && (
                          <div className="absolute top-1.5 right-1.5">
                            <Heart 
                              size={12} 
                              className="text-red-500 fill-red-500"
                            />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Unsplash Attribution */}
          {activeTab === "unsplash" && (
            <div 
              className="relative px-5 py-3 text-center border-t shrink-0"
              style={{ 
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              }}
            >
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] opacity-40 hover:opacity-70 transition-opacity"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                Photos provided by Unsplash
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

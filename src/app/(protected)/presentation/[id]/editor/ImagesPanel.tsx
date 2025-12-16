import React, { useState, useCallback, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { X, Search, Upload, Loader2, Heart, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSearchUnsplashPhotos,
  useRandomUnsplashPhotos,
  useListMedia,
  useUploadMedia,
  useTrackUnsplashDownload,
} from "@/hooks/use-images";
import type { UnsplashPhoto, MediaItem } from "@/services/images";

interface ImagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (imageUrl: string, attribution?: { name: string; link: string }) => void;
}

export const ImagesPanel: React.FC<ImagesPanelProps> = ({
  isOpen,
  onClose,
  onSelectImage,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  
  const [activeTab, setActiveTab] = useState<"unsplash" | "uploads">("unsplash");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UnsplashPhoto | MediaItem | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Unsplash queries
  const { data: searchResults, isLoading: isSearching, error: searchError } = useSearchUnsplashPhotos(
    { query: debouncedQuery, perPage: 30 },
    activeTab === "unsplash" && debouncedQuery.length > 0
  );
  
  const { data: randomPhotos, isLoading: isLoadingRandom, error: randomError } = useRandomUnsplashPhotos(
    { count: 30 },
    activeTab === "unsplash" && debouncedQuery.length === 0
  );

  // User media query
  const { data: userMedia, isLoading: isLoadingMedia } = useListMedia(
    { perPage: 50 },
  );

  // Mutations
  const uploadMutation = useUploadMedia();
  const trackDownload = useTrackUnsplashDownload();

  // Handle search input with debounce
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);
  }, []);

  // Handle image selection
  const handleImageSelect = useCallback((image: UnsplashPhoto | MediaItem) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  }, []);

  // Handle image use
  const handleUseImage = useCallback(() => {
    if (!selectedImage) return;

    if ('urls' in selectedImage) {
      // Unsplash image
      const unsplashImage = selectedImage as UnsplashPhoto;
      
      // Track download for Unsplash attribution
      trackDownload.mutate({ downloadLocation: unsplashImage.links.downloadLocation });
      
      onSelectImage?.(
        unsplashImage.urls.regular,
        { name: unsplashImage.user.name, link: unsplashImage.user.profileImage.medium }
      );
    } else {
      // User uploaded media
      const mediaItem = selectedImage as MediaItem;
      onSelectImage?.(mediaItem.url);
    }

    setIsModalOpen(false);
    setSelectedImage(null);
    onClose();
  }, [selectedImage, onSelectImage, onClose, trackDownload]);

  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadMutation.mutateAsync({ file });
    } catch (error) {
      console.error("Upload failed:", error);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [uploadMutation]);

  // Get photos to display
  const unsplashPhotos = debouncedQuery 
    ? searchResults?.data?.results || []
    : Array.isArray(randomPhotos?.data) ? randomPhotos.data : [];

  const userPhotos = userMedia?.data?.list || [];

  const panelVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.98 },
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="images-panel"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            transition={{ duration: 0.15 }}
            className="relative z-40"
          >
            <div
              className="relative w-[420px] max-h-[75vh] flex flex-col rounded-2xl overflow-hidden"
              style={{
                backgroundColor: isDark 
                  ? "rgba(30, 30, 40, 0.5)" 
                  : "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(32px) saturate(200%)",
                WebkitBackdropFilter: "blur(32px) saturate(200%)",
                boxShadow: isDark
                  ? `
                    0 1px 0 0 rgba(255, 255, 255, 0.1) inset,
                    0 -1px 0 0 rgba(0, 0, 0, 0.2) inset,
                    0 8px 40px rgba(0, 0, 0, 0.4),
                    0 2px 8px rgba(0, 0, 0, 0.2)
                  `
                  : `
                    0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
                    0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
                    0 8px 40px rgba(0, 0, 0, 0.08),
                    0 2px 8px rgba(0, 0, 0, 0.04)
                  `,
              }}
            >
              {/* Glass shine overlay */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.02) 100%)"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.3) 100%)",
                }}
              />

              {/* Header */}
              <div className="relative px-4 py-3 flex items-center justify-between shrink-0">
                <span
                  className="text-sm font-medium"
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  Images
                </span>
                <button
                  className="p-1.5 rounded-lg transition-all opacity-50 hover:opacity-100"
                  onClick={onClose}
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="relative px-4 pb-3">
                <Tabs 
                  value={activeTab} 
                  onValueChange={(v) => setActiveTab(v as "unsplash" | "uploads")}
                  className="w-full"
                >
                  <TabsList 
                    className="w-full grid grid-cols-2 h-9"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    }}
                  >
                    <TabsTrigger 
                      value="unsplash"
                      className="text-xs data-[state=active]:shadow-sm"
                      style={{
                        color: isDark ? "#e5e7eb" : "#374151",
                      }}
                    >
                      Unsplash
                    </TabsTrigger>
                    <TabsTrigger 
                      value="uploads"
                      className="text-xs data-[state=active]:shadow-sm"
                      style={{
                        color: isDark ? "#e5e7eb" : "#374151",
                      }}
                    >
                      My Uploads
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Search Bar (Unsplash only) */}
              {activeTab === "unsplash" && (
                <div className="relative px-4 pb-3">
                  <div className="relative">
                    <Search 
                      size={14} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    />
                    <Input
                      type="text"
                      placeholder="Search free high-resolution photos..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-9 h-9 text-xs border-0"
                      style={{
                        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                        color: isDark ? "#fff" : "#000",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button (Uploads tab only) */}
              {activeTab === "uploads" && (
                <div className="relative px-4 pb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="w-full h-9 flex items-center justify-center gap-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: `${theme.primary}15`,
                      color: theme.primary,
                    }}
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
                  </button>
                </div>
              )}

              {/* Images Grid */}
              <div 
                className={`relative flex-1 overflow-y-auto px-3 pb-3 ${isDark ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}`}
              >
                {/* Loading State */}
                {(activeTab === "unsplash" && (isSearching || isLoadingRandom)) && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 
                      size={24} 
                      className="animate-spin opacity-50"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    />
                  </div>
                )}

                {activeTab === "uploads" && isLoadingMedia && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 
                      size={24} 
                      className="animate-spin opacity-50"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    />
                  </div>
                )}

                {/* Error State */}
                {(searchError || randomError) && activeTab === "unsplash" && (
                  <div className="flex items-center justify-center py-12">
                    <span 
                      className="text-xs opacity-50"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    >
                      Failed to load images. Please try again.
                    </span>
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
                      <div className="grid grid-cols-3 gap-1.5">
                        {unsplashPhotos.map((photo, index) => (
                          <motion.button
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            onClick={() => handleImageSelect(photo)}
                            className="relative aspect-square rounded-lg overflow-hidden group"
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
                          </motion.button>
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
                      <div className="grid grid-cols-3 gap-1.5">
                        {userPhotos.map((media, index) => (
                          <motion.button
                            key={media.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            onClick={() => handleImageSelect(media)}
                            className="relative aspect-square rounded-lg overflow-hidden group"
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
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Unsplash Attribution */}
              {activeTab === "unsplash" && (
                <div 
                  className="relative px-4 py-2 text-center border-t shrink-0"
                  style={{ 
                    borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  }}
                >
                  <a
                    href="https://unsplash.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] opacity-40 hover:opacity-70 transition-opacity inline-flex items-center gap-1"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    Photos by Unsplash
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-2xl p-0 overflow-hidden"
          style={{
            backgroundColor: isDark ? "#1e1e28" : "#fff",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
          }}
        >
          {selectedImage && (
            <>
              {/* Image Preview */}
              <div className="relative aspect-video bg-black/5">
                <img
                  src={'urls' in selectedImage ? selectedImage.urls.regular : selectedImage.url}
                  alt={'altDescription' in selectedImage ? (selectedImage.altDescription || "Selected image") : selectedImage.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Image Info & Actions */}
              <div className="p-4 space-y-4">
                <DialogHeader>
                  <DialogTitle 
                    className="text-sm font-medium"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    {'urls' in selectedImage ? (
                      <>
                        Photo by{" "}
                        <a
                          href={`https://unsplash.com/@${(selectedImage as UnsplashPhoto).user.username}?utm_source=butterfast&utm_medium=referral`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                          style={{ color: theme.primary }}
                        >
                          {(selectedImage as UnsplashPhoto).user.name}
                        </a>
                        {" "}on{" "}
                        <a
                          href="https://unsplash.com?utm_source=butterfast&utm_medium=referral"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                          style={{ color: theme.primary }}
                        >
                          Unsplash
                        </a>
                      </>
                    ) : (
                      (selectedImage as MediaItem).name
                    )}
                  </DialogTitle>
                </DialogHeader>

                {/* Dimensions */}
                {'width' in selectedImage && selectedImage.width && (
                  <p 
                    className="text-xs opacity-50"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    {selectedImage.width} × {selectedImage.height}
                  </p>
                )}

                {/* Use Image Button */}
                <button
                  onClick={handleUseImage}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{
                    backgroundColor: theme.primary,
                    color: "#fff",
                  }}
                >
                  Use This Image
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

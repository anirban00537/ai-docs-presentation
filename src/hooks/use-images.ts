import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchUnsplashPhotos,
  getRandomUnsplashPhotos,
  getUnsplashPhoto,
  trackUnsplashDownload,
  uploadMedia,
  listMedia,
  getMedia,
  updateMedia,
  deleteMedia,
  type SearchPhotosParams,
  type GetRandomPhotosParams,
  type TrackDownloadPayload,
  type UploadMediaParams,
  type ListMediaParams,
  type UpdateMediaParams,
} from "@/services/images";

// Query keys
export const imageKeys = {
  all: ["images"] as const,
  searches: () => [...imageKeys.all, "search"] as const,
  search: (params: SearchPhotosParams) =>
    [...imageKeys.searches(), params] as const,
  random: (params?: GetRandomPhotosParams) =>
    [...imageKeys.all, "random", params] as const,
  photo: (photoId: string) => [...imageKeys.all, "photo", photoId] as const,
  media: {
    all: ["media"] as const,
    lists: () => [...imageKeys.media.all, "list"] as const,
    list: (params?: ListMediaParams) =>
      [...imageKeys.media.lists(), params] as const,
    detail: (id: string) => [...imageKeys.media.all, "detail", id] as const,
  },
};

/**
 * Search Unsplash photos query
 */
export const useSearchUnsplashPhotos = (
  params: SearchPhotosParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: imageKeys.search(params),
    queryFn: async () => {
      try {
        return await searchUnsplashPhotos(params);
      } catch (error: any) {
        // Re-throw with a more user-friendly message
        throw new Error(error.message || "Failed to search photos. Please try again.");
      }
    },
    enabled: enabled && !!params.query && params.query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
  });
};

/**
 * Get random Unsplash photos query
 */
export const useRandomUnsplashPhotos = (
  params?: GetRandomPhotosParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: imageKeys.random(params),
    queryFn: async () => {
      try {
        return await getRandomUnsplashPhotos(params);
      } catch (error: any) {
        // Re-throw with a more user-friendly message
        throw new Error(error.message || "Failed to load photos. Please try again.");
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
  });
};

/**
 * Get a specific Unsplash photo query
 */
export const useUnsplashPhoto = (photoId: string | null) => {
  return useQuery({
    queryKey: photoId ? imageKeys.photo(photoId) : ["image", "null"],
    queryFn: async () => {
      if (!photoId) {
        throw new Error("Photo ID is required");
      }
      try {
        return await getUnsplashPhoto(photoId);
      } catch (error: any) {
        // Re-throw with a more user-friendly message
        throw new Error(error.message || "Failed to load photo. Please try again.");
      }
    },
    enabled: !!photoId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
  });
};

/**
 * Track Unsplash download mutation
 */
export const useTrackUnsplashDownload = () => {
  return useMutation({
    mutationFn: async (payload: TrackDownloadPayload) => {
      try {
        return await trackUnsplashDownload(payload);
      } catch (error: any) {
        // Silently fail for download tracking as it's not critical
        // But log it for debugging
        console.warn("Failed to track download:", error.message);
        // Re-throw to let TanStack Query handle it
        throw error;
      }
    },
    retry: false, // Don't retry download tracking
    onError: (error: any) => {
      // Silently handle download tracking errors
      console.warn("Download tracking failed:", error.message);
    },
  });
};

/**
 * List user's media query
 */
export const useListMedia = (params?: ListMediaParams) => {
  return useQuery({
    queryKey: imageKeys.media.list(params),
    queryFn: async () => {
      try {
        return await listMedia(params);
      } catch (error: any) {
        throw new Error(error.message || "Failed to load media. Please try again.");
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Get single media item query
 */
export const useMedia = (id: string | null) => {
  return useQuery({
    queryKey: id ? imageKeys.media.detail(id) : ["media", "null"],
    queryFn: async () => {
      if (!id) {
        throw new Error("Media ID is required");
      }
      try {
        return await getMedia(id);
      } catch (error: any) {
        throw new Error(error.message || "Failed to load media. Please try again.");
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Upload media mutation
 */
export const useUploadMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadMediaParams) => {
      try {
        return await uploadMedia(params);
      } catch (error: any) {
        throw new Error(error.message || "Failed to upload media");
      }
    },
    onSuccess: () => {
      // Invalidate media list queries to refetch
      queryClient.invalidateQueries({ queryKey: imageKeys.media.lists() });
    },
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Update media mutation
 */
export const useUpdateMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, params }: { id: string; params: UpdateMediaParams }) => {
      try {
        return await updateMedia(id, params);
      } catch (error: any) {
        throw new Error(error.message || "Failed to update media");
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate media list and detail queries
      queryClient.invalidateQueries({ queryKey: imageKeys.media.lists() });
      queryClient.invalidateQueries({ queryKey: imageKeys.media.detail(variables.id) });
    },
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Delete media mutation
 */
export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await deleteMedia(id);
      } catch (error: any) {
        throw new Error(error.message || "Failed to delete media");
      }
    },
    onSuccess: () => {
      // Invalidate media list queries to refetch
      queryClient.invalidateQueries({ queryKey: imageKeys.media.lists() });
    },
    retry: 1,
    retryDelay: 1000,
  });
};


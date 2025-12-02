import { useQuery, useMutation } from "@tanstack/react-query";
import {
  searchUnsplashPhotos,
  getRandomUnsplashPhotos,
  getUnsplashPhoto,
  trackUnsplashDownload,
  type SearchPhotosParams,
  type GetRandomPhotosParams,
  type TrackDownloadPayload,
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


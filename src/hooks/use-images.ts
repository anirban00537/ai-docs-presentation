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
    queryFn: () => searchUnsplashPhotos(params),
    enabled: enabled && !!params.query && params.query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    queryFn: () => getRandomUnsplashPhotos(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get a specific Unsplash photo query
 */
export const useUnsplashPhoto = (photoId: string | null) => {
  return useQuery({
    queryKey: photoId ? imageKeys.photo(photoId) : ["image", "null"],
    queryFn: () => {
      if (!photoId) {
        throw new Error("Photo ID is required");
      }
      return getUnsplashPhoto(photoId);
    },
    enabled: !!photoId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Track Unsplash download mutation
 */
export const useTrackUnsplashDownload = () => {
  return useMutation({
    mutationFn: (payload: TrackDownloadPayload) =>
      trackUnsplashDownload(payload),
  });
};


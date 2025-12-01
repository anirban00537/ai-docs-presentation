import request from "@/lib/request";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface UnsplashPhotoUrls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
  optimized: string;
}

export interface UnsplashPhotoLinks {
  self: string;
  html: string;
  download: string;
  downloadLocation: string;
}

export interface UnsplashPhotoUser {
  id: string;
  username: string;
  name: string;
  profileImage: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string;
  description: string | null;
  altDescription: string | null;
  urls: UnsplashPhotoUrls;
  links: UnsplashPhotoLinks;
  user: UnsplashPhotoUser;
  createdAt: string;
  likes: number;
}

export interface SearchPhotosParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: "landscape" | "portrait" | "squarish";
  color?: string;
  orderBy?: "relevant" | "latest";
}

export interface SearchPhotosResponse {
  total: number;
  results: UnsplashPhoto[];
  page: number;
  perPage: number;
}

export interface GetRandomPhotosParams {
  query?: string;
  username?: string;
  featured?: boolean;
  collectionIds?: string[];
  topicIds?: string[];
  count?: number;
}

export interface TrackDownloadPayload {
  downloadLocation: string;
}

/**
 * Search Unsplash photos
 */
export const searchUnsplashPhotos = async (
  params: SearchPhotosParams
): Promise<ApiResponse<SearchPhotosResponse>> => {
  const response = await request.get("/images/unsplash-search", {
    params,
  });
  return response.data;
};

/**
 * Get random Unsplash photos
 */
export const getRandomUnsplashPhotos = async (
  params?: GetRandomPhotosParams
): Promise<ApiResponse<UnsplashPhoto | UnsplashPhoto[]>> => {
  const response = await request.get("/images/unsplash-random", {
    params,
  });
  return response.data;
};

/**
 * Get a specific Unsplash photo by ID
 */
export const getUnsplashPhoto = async (
  photoId: string
): Promise<ApiResponse<UnsplashPhoto>> => {
  const response = await request.get(`/images/unsplash/${photoId}/get`);
  return response.data;
};

/**
 * Track Unsplash photo download
 */
export const trackUnsplashDownload = async (
  payload: TrackDownloadPayload
): Promise<ApiResponse<void>> => {
  const response = await request.post("/images/unsplash/track-download", payload);
  return response.data;
};


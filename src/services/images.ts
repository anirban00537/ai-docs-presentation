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

// Media Management Types
export interface MediaItem {
  id: string;
  userId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadMediaParams {
  file: File;
  name?: string;
  tags?: string[];
}

export interface ListMediaParams {
  page?: number;
  perPage?: number;
  search?: string;
  category?: "all" | "recent" | "favorites";
  mimeType?: string;
}

export interface ListMediaResponse {
  list: MediaItem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateMediaParams {
  name?: string;
  tags?: string[];
  isFavorite?: boolean;
}

/**
 * Search Unsplash photos
 */
export const searchUnsplashPhotos = async (
  params: SearchPhotosParams
): Promise<ApiResponse<SearchPhotosResponse>> => {
  try {
    const response = await request.get("/images/unsplash-search", {
      params,
    });
    
    // Check if the API response indicates an error
    if (response.data && !response.data.success) {
      throw new Error(response.data.message || "Failed to search photos");
    }
    
    return response.data;
  } catch (error: any) {
    // Handle axios errors
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || "Failed to search photos";
      throw new Error(message);
    }
    // Handle network errors or other errors
    throw new Error(error.message || "Failed to search photos. Please check your connection.");
  }
};

/**
 * Get random Unsplash photos
 */
export const getRandomUnsplashPhotos = async (
  params?: GetRandomPhotosParams
): Promise<ApiResponse<UnsplashPhoto | UnsplashPhoto[]>> => {
  try {
    const response = await request.get("/images/unsplash-random", {
      params,
    });
    
    // Check if the API response indicates an error
    if (response.data && !response.data.success) {
      throw new Error(response.data.message || "Failed to get random photos");
    }
    
    return response.data;
  } catch (error: any) {
    // Handle axios errors
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || "Failed to get random photos";
      throw new Error(message);
    }
    // Handle network errors or other errors
    throw new Error(error.message || "Failed to get random photos. Please check your connection.");
  }
};

/**
 * Get a specific Unsplash photo by ID
 */
export const getUnsplashPhoto = async (
  photoId: string
): Promise<ApiResponse<UnsplashPhoto>> => {
  try {
    const response = await request.get(`/images/unsplash/${photoId}/get`);
    
    // Check if the API response indicates an error
    if (response.data && !response.data.success) {
      throw new Error(response.data.message || "Failed to get photo");
    }
    
    return response.data;
  } catch (error: any) {
    // Handle axios errors
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || "Failed to get photo";
      throw new Error(message);
    }
    // Handle network errors or other errors
    throw new Error(error.message || "Failed to get photo. Please check your connection.");
  }
};

/**
 * Track Unsplash photo download
 */
export const trackUnsplashDownload = async (
  payload: TrackDownloadPayload
): Promise<ApiResponse<void>> => {
  try {
    const response = await request.post("/images/unsplash/track-download", payload);
    
    // Check if the API response indicates an error
    if (response.data && !response.data.success) {
      throw new Error(response.data.message || "Failed to track download");
    }
    
    return response.data;
  } catch (error: any) {
    // Handle axios errors
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || "Failed to track download";
      throw new Error(message);
    }
    // Handle network errors or other errors
    // Silently fail for download tracking as it's not critical
    console.warn("Failed to track download:", error.message);
    throw error;
  }
};

/**
 * Upload media file
 */
export const uploadMedia = async (
  params: UploadMediaParams
): Promise<ApiResponse<MediaItem>> => {
  try {
    const formData = new FormData();
    formData.append("file", params.file);
    if (params.name) {
      formData.append("name", params.name);
    }
    if (params.tags && params.tags.length > 0) {
      // Append each tag individually - NestJS will parse as array
      params.tags.forEach((tag) => {
        formData.append("tags", tag);
      });
    }

    // Delete Content-Type header to let axios set it automatically with boundary for FormData
    const response = await request.post("/images/upload", formData, {
      headers: {
        "Content-Type": undefined, // Delete the default Content-Type so axios can set multipart/form-data with boundary
      },
    });

    if (response.data && !response.data.success) {
      throw new Error(response.data.message || "Failed to upload media");
    }

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to upload media";
      throw new Error(message);
    }
    throw new Error(
      error.message || "Failed to upload media. Please check your connection."
    );
  }
};

/**
 * List user's media
 */
export const listMedia = async (
  params?: ListMediaParams
): Promise<ApiResponse<ListMediaResponse>> => {
  try {
    const response = await request.get("/images", {
      params,
    });

    if (response.data && !response.data.success) {
      throw new Error(response.data.message || "Failed to list media");
    }

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to list media";
      throw new Error(message);
    }
    throw new Error(
      error.message || "Failed to list media. Please check your connection."
    );
  }
};

/**
 * Get single media item
 */
export const getMedia = async (
  id: string
): Promise<ApiResponse<MediaItem>> => {
  try {
    const response = await request.get(`/images/${id}`);

    if (response.data && !response.data.success) {
      throw new Error(response.data.message || "Failed to get media");
    }

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to get media";
      throw new Error(message);
    }
    throw new Error(
      error.message || "Failed to get media. Please check your connection."
    );
  }
};

/**
 * Update media
 */
export const updateMedia = async (
  id: string,
  params: UpdateMediaParams
): Promise<ApiResponse<MediaItem>> => {
  try {
    const response = await request.put(`/images/${id}`, params);

    if (response.data && !response.data.success) {
      throw new Error(response.data.message || "Failed to update media");
    }

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to update media";
      throw new Error(message);
    }
    throw new Error(
      error.message || "Failed to update media. Please check your connection."
    );
  }
};

/**
 * Delete media
 */
export const deleteMedia = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await request.delete(`/images/${id}`);

    if (response.data && !response.data.success) {
      throw new Error(response.data.message || "Failed to delete media");
    }

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to delete media";
      throw new Error(message);
    }
    throw new Error(
      error.message || "Failed to delete media. Please check your connection."
    );
  }
};


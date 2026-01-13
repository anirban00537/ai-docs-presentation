/**
 * Represents information about an image field in a layout
 */
export interface ImageFieldInfo {
  fieldPath: string;
  fieldType: 'image' | 'accent' | 'avatar' | 'gallery';
  searchQuery: string;
  orientation: 'landscape' | 'portrait' | 'squarish';
}

/**
 * Result of analyzing a layout for image fields
 */
export interface ImageAnalysisResult {
  hasImages: boolean;
  imageFields: ImageFieldInfo[];
}

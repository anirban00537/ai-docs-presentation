import { Injectable, Logger } from '@nestjs/common';
import { ImagesService } from '../../../images/images.service';
import { ImageFieldInfo } from '../interfaces/image-analysis.interface';

/**
 * Service for fetching images from Unsplash
 * Handles deduplication and fallback logic
 */
@Injectable()
export class ImageFetcherService {
  private readonly logger = new Logger(ImageFetcherService.name);

  constructor(private readonly imagesService: ImagesService) {}

  /**
   * Fetch images from Unsplash for all detected image fields
   * Ensures unique images by tracking used URLs
   */
  async fetchImagesForFields(
    imageFields: ImageFieldInfo[],
  ): Promise<Map<string, string>> {
    const imageMap = new Map<string, string>();
    const usedUrls: string[] = []; // Track used URLs to prevent duplicates

    this.logger.log(`Fetching images for ${imageFields.length} image fields...`);

    for (const field of imageFields) {
      try {
        // Pass usedUrls to get a unique image
        const imageUrl = await this.imagesService.searchUnsplashSimple(
          field.searchQuery,
          field.orientation,
          usedUrls, // Exclude already-used URLs
        );

        // Always get a URL now (fallback is handled in service)
        imageMap.set(field.fieldPath, imageUrl);
        usedUrls.push(imageUrl); // Track this URL as used
        
        this.logger.debug(
          `✅ Image for "${field.fieldPath}": ${field.searchQuery} -> ${imageUrl.substring(0, 60)}...`,
        );
      } catch (error) {
        this.logger.error(`Error fetching image for ${field.fieldPath}:`, error);
        // Even on error, set a fallback to prevent missing images
        const fallback = 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80';
        imageMap.set(field.fieldPath, fallback);
        usedUrls.push(fallback);
      }
    }

    this.logger.log(`Fetched ${imageMap.size} unique images for ${imageFields.length} fields`);
    return imageMap;
  }
}

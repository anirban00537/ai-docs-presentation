import { Injectable, Logger } from '@nestjs/common';
import { ImagesService } from '../../../images/images.service';
import { ImageFieldInfo } from '../interfaces';

/**
 * Service for fetching images from Unsplash
 */
@Injectable()
export class ImageFetcherService {
  private readonly logger = new Logger(ImageFetcherService.name);

  constructor(private readonly imagesService: ImagesService) {}

  /**
   * Fetch images from Unsplash for all detected image fields
   */
  async fetchImagesForFields(
    imageFields: ImageFieldInfo[],
  ): Promise<Map<string, string>> {
    const imageMap = new Map<string, string>();

    for (const field of imageFields) {
      try {
        const imageUrl = await this.imagesService.searchUnsplashSimple(
          field.searchQuery,
          field.orientation,
        );

        if (imageUrl) {
          imageMap.set(field.fieldPath, imageUrl);
          this.logger.debug(
            `Found image for "${field.fieldPath}": ${field.searchQuery}`,
          );
        } else {
          this.logger.warn(
            `No image found for "${field.fieldPath}" with query: ${field.searchQuery}`,
          );
        }
      } catch (error) {
        this.logger.error(`Error fetching image for ${field.fieldPath}:`, error);
      }
    }

    return imageMap;
  }
}

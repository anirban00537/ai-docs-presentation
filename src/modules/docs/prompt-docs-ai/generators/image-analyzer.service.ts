import { Injectable, Logger } from '@nestjs/common';
import {
  ImageAnalysisResult,
  ImageFieldInfo,
} from '../interfaces/image-analysis.interface';

/**
 * Deterministic service for analyzing layouts and detecting image fields.
 * This replaces the previous AI-based analyzer with a simple recursive scanner.
 * 
 * The scanner looks for all `imageUrl` fields in the layout JSON and generates
 * appropriate Unsplash search queries based on the field type and outline content.
 */
@Injectable()
export class ImageAnalyzerService {
  private readonly logger = new Logger(ImageAnalyzerService.name);

  /**
   * Analyze a layout schema to detect image fields deterministically.
   * No AI calls required - just a recursive scan for `imageUrl` keys.
   */
  async analyzeLayoutForImages(
    _openRouter: any, // Kept for API compatibility, but not used
    layoutData: any,
    outlineContent: string,
    docTitle: string,
  ): Promise<ImageAnalysisResult> {
    try {
      const imageFields: ImageFieldInfo[] = [];

      // 1. Check for top-level accent image
      if (layoutData?.accent?.imageUrl !== undefined) {
        imageFields.push({
          fieldPath: 'accent.imageUrl',
          fieldType: 'accent',
          searchQuery: this.generateSearchQuery('accent', outlineContent, docTitle),
          orientation: 'landscape',
        });
      }

      // 2. Recursively scan rows for image fields
      if (Array.isArray(layoutData?.rows)) {
        layoutData.rows.forEach((row: any, rowIndex: number) => {
          if (Array.isArray(row?.blocks)) {
            row.blocks.forEach((block: any, blockIndex: number) => {
              this.scanBlockForImages(
                block,
                `rows[${rowIndex}].blocks[${blockIndex}]`,
                imageFields,
                outlineContent,
                docTitle,
              );
            });
          }
        });
      }

      const hasImages = imageFields.length > 0;

      this.logger.log(
        `🔍 Deterministic scan complete: Found ${imageFields.length} image field(s)`,
      );

      if (hasImages) {
        imageFields.forEach((field) => {
          this.logger.debug(`   ↳ ${field.fieldPath} (${field.fieldType})`);
        });
      }

      return { hasImages, imageFields };
    } catch (error) {
      this.logger.error('Error during deterministic image scan:', error);
      return { hasImages: false, imageFields: [] };
    }
  }

  /**
   * Recursively scan a block for image-related fields
   */
  private scanBlockForImages(
    block: any,
    basePath: string,
    imageFields: ImageFieldInfo[],
    outlineContent: string,
    docTitle: string,
  ): void {
    if (!block || typeof block !== 'object') return;

    const blockType = block.type;

    // Check for direct imageUrl in content (standard image blocks)
    if (block.content?.imageUrl !== undefined) {
      imageFields.push({
        fieldPath: `${basePath}.content.imageUrl`,
        fieldType: 'image',
        searchQuery: this.generateSearchQuery('image', outlineContent, docTitle),
        orientation: 'landscape',
      });
    }

    // Check for image-card-block with items array
    if (blockType === 'image-card-block' && Array.isArray(block.content?.items)) {
      block.content.items.forEach((item: any, itemIndex: number) => {
        if (item?.imageUrl !== undefined) {
          imageFields.push({
            fieldPath: `${basePath}.content.items[${itemIndex}].imageUrl`,
            fieldType: 'gallery',
            searchQuery: this.generateSearchQuery('gallery', outlineContent, docTitle, itemIndex),
            orientation: 'squarish',
          });
        }
      });
    }

    // Check for avatar/profile fields in testimonial-style blocks
    if (block.content?.avatar !== undefined) {
      imageFields.push({
        fieldPath: `${basePath}.content.avatar`,
        fieldType: 'avatar',
        searchQuery: 'professional headshot portrait person',
        orientation: 'portrait',
      });
    }

    if (block.content?.profileImage !== undefined) {
      imageFields.push({
        fieldPath: `${basePath}.content.profileImage`,
        fieldType: 'avatar',
        searchQuery: 'professional headshot portrait person',
        orientation: 'portrait',
      });
    }
  }

  /**
   * Generate a search query based on field type and content context
   */
  private generateSearchQuery(
    fieldType: 'accent' | 'image' | 'avatar' | 'gallery',
    outlineContent: string,
    docTitle: string,
    itemIndex?: number,
  ): string {
    // Extract key concepts from outline content
    const keywords = this.extractKeywords(outlineContent, docTitle);

    switch (fieldType) {
      case 'accent':
        // For accent/background images, use abstract or atmospheric queries
        return `${keywords} abstract background atmospheric`;

      case 'image':
        // For main content images, use the keywords directly
        return `${keywords} professional`;

      case 'gallery':
        // For gallery items, add variation based on index
        const variations = ['concept', 'illustration', 'scene', 'visual'];
        const variation = variations[(itemIndex || 0) % variations.length];
        return `${keywords} ${variation}`;

      case 'avatar':
        // Avatars always use a standard portrait query
        return 'professional headshot portrait person';

      default:
        return keywords;
    }
  }

  /**
   * Extract meaningful keywords from outline content and title
   */
  private extractKeywords(outlineContent: string, docTitle: string): string {
    // Combine title and content
    const combined = `${docTitle} ${outlineContent}`.toLowerCase();

    // Remove common stopwords and punctuation
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this',
      'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
      'we', 'us', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her',
      'i', 'me', 'my', 'what', 'which', 'who', 'whom', 'when', 'where',
      'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
      'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
      'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there',
    ]);

    const words = combined
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopwords.has(word));

    // Get unique words and take top 3-5 for the query
    const uniqueWords = [...new Set(words)];
    const topKeywords = uniqueWords.slice(0, 4).join(' ');

    return topKeywords || 'professional business';
  }
}

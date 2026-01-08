import { Injectable, Logger } from '@nestjs/common';
import { ImageAnalysisResult } from '../interfaces/image-analysis.interface';
import { coreConstant } from 'src/shared/helpers/coreConstant';

/**
 * Service for analyzing layouts and detecting image fields
 */
@Injectable()
export class ImageAnalyzerService {
  private readonly logger = new Logger(ImageAnalyzerService.name);
  private readonly MODEL_NAME = coreConstant.AI_MODELS.SLIDES.NAME;

  /**
   * Analyze a layout schema to detect image fields and generate Unsplash search queries
   * Uses structured output for guaranteed valid JSON
   */
  async analyzeLayoutForImages(
    openRouter: any,
    layoutData: any,
    outlineContent: string,
    presentationTitle: string,
  ): Promise<ImageAnalysisResult> {
    try {
      const layoutJson = JSON.stringify(layoutData, null, 2);

      const analysisPrompt = `Analyze this presentation slide layout schema and identify ALL image-related fields.

LAYOUT SCHEMA:
${layoutJson}

SLIDE CONTENT (for context):
${outlineContent}

PRESENTATION TITLE: ${presentationTitle}

Look for these types of image fields:
1. **accent** - Top-level accent object with a "url" property (used for background/accent images)
2. **image blocks** - Blocks with type "image" that have a "url" field in their content
3. **avatar fields** - Fields named "avatar" or "profileImage" in testimonial/team blocks
4. **gallery images** - Arrays of images in gallery blocks
5. **logo images** - Logo grid items that have image URLs

For each image field found, provide:
- fieldPath: The JSON path to the URL field (e.g., "accent.url", "rows[0].blocks[0].content.url")
- fieldType: One of "accent", "image", "avatar", "gallery"
- searchQuery: A specific, descriptive Unsplash search query based on the slide content and field purpose
- orientation: "landscape" for accent/banner images, "portrait" for avatars, "squarish" for general images

IMPORTANT SEARCH QUERY GUIDELINES:
- Make queries specific and contextual to the slide content
- For accent images: Use atmospheric/abstract terms related to the topic
- For avatars: Use "professional headshot portrait person"
- For product images: Be specific about the product type
- Avoid generic queries like "business" - be more specific

If no image fields are found, return hasImages as false with an empty imageFields array.`;

      const response = await openRouter.chat.send({
        model: this.MODEL_NAME,
        messages: [
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        // Use structured output with strict schema
        responseFormat: {
          type: 'json_schema',
          jsonSchema: {
            name: 'image_analysis',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                hasImages: { type: 'boolean' },
                imageFields: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      fieldPath: { type: 'string' },
                      fieldType: { type: 'string', enum: ['image', 'accent', 'avatar', 'gallery'] },
                      searchQuery: { type: 'string' },
                      orientation: { type: 'string', enum: ['landscape', 'portrait', 'squarish'] },
                    },
                    required: ['fieldPath', 'fieldType', 'searchQuery', 'orientation'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['hasImages', 'imageFields'],
              additionalProperties: false,
            },
          },
        },
        stream: false,
      });

      const content = response.choices[0]?.message?.content;

      if (!content || typeof content !== 'string') {
        this.logger.warn('Invalid response from image analysis');
        return { hasImages: false, imageFields: [] };
      }

      // Parse directly since structured output guarantees valid JSON
      const result: ImageAnalysisResult = JSON.parse(content);

      this.logger.debug(
        `Image analysis result: ${result.hasImages ? result.imageFields.length : 0} image fields found`,
      );

      return result;
    } catch (error) {
      this.logger.error('Error analyzing layout for images:', error);
      return { hasImages: false, imageFields: [] };
    }
  }
}

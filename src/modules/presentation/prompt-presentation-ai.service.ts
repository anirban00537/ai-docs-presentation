import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AiUsageService } from '../subscription/services/ai-usage.service';
import { ImagesService } from '../images/images.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';

interface ImageFieldInfo {
  fieldPath: string;
  fieldType: 'image' | 'accent' | 'avatar' | 'gallery';
  searchQuery: string;
  orientation: 'landscape' | 'portrait' | 'squarish';
}

interface ImageAnalysisResult {
  hasImages: boolean;
  imageFields: ImageFieldInfo[];
}

@Injectable()
export class PromptPresentationAIService implements OnModuleInit {
  private readonly logger = new Logger(PromptPresentationAIService.name);
  private openRouter: any = null;
  private readonly MODEL_NAME = coreConstant.AI_MODELS.SLIDES.NAME;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly aiUsageService: AiUsageService,
    private readonly imagesService: ImagesService,
  ) {}

  async onModuleInit() {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      this.logger.error('OPENROUTER_API_KEY is not set in environment variables.');
      return;
    }
    
    try {
      // Dynamic import for ESM-only package
      const { OpenRouter } = await import('@openrouter/sdk');
      this.openRouter = new OpenRouter({ apiKey });
      this.logger.log('OpenRouter SDK initialized');
    } catch (error) {
      this.logger.error('Failed to initialize OpenRouter SDK:', error);
    }
  }


  /**
   * Analyze a layout schema to detect image fields and generate Unsplash search queries
   * Uses structured JSON schema output for reliable parsing
   */
  private async analyzeLayoutForImages(
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

      const response = await this.openRouter.chat.send({
        model: this.MODEL_NAME,
        messages: [
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        responseFormat: {
          type: 'json_schema',
          jsonSchema: {
            name: 'image_analysis',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                hasImages: {
                  type: 'boolean',
                  description: 'Whether the layout has any image fields that need to be populated',
                },
                imageFields: {
                  type: 'array',
                  description: 'Array of image fields found in the layout',
                  items: {
                    type: 'object',
                    properties: {
                      fieldPath: {
                        type: 'string',
                        description: 'The JSON path to the URL field (e.g., "accent.url", "rows[0].blocks[0].content.avatar")',
                      },
                      fieldType: {
                        type: 'string',
                        enum: ['accent', 'image', 'avatar', 'gallery'],
                        description: 'The type of image field',
                      },
                      searchQuery: {
                        type: 'string',
                        description: 'A specific, descriptive Unsplash search query based on the slide content and field purpose',
                      },
                      orientation: {
                        type: 'string',
                        enum: ['landscape', 'portrait', 'squarish'],
                        description: 'The preferred image orientation',
                      },
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

  /**
   * Fetch images from Unsplash for all detected image fields
   */
  private async fetchImagesForFields(
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

  /**
   * Build the image injection section for the slide generation prompt
   */
  private buildImageInjectionPrompt(
    imageMap: Map<string, string>,
    imageFields: ImageFieldInfo[],
  ): string {
    if (imageMap.size === 0) {
      return '';
    }

    const imageInstructions = Array.from(imageMap.entries())
      .map(([fieldPath, url]) => {
        const field = imageFields.find((f) => f.fieldPath === fieldPath);
        return `- Set "${fieldPath}" to: "${url}" (${field?.fieldType || 'image'})`;
      })
      .join('\n');

    return `
⚠️ IMAGE INJECTION INSTRUCTIONS (CRITICAL) ⚠️

The following image URLs have been pre-fetched from Unsplash. You MUST include these exact URLs in the corresponding fields:

${imageInstructions}

HOW TO APPLY:
1. For "accent.url" - Set the accent object's url property to the provided URL
2. For "rows[X].blocks[Y].content.url" - Set the block's content url to the provided URL
3. For avatar/profile fields - Set the avatar or profileImage field to the provided URL

DO NOT change these URLs. Copy them exactly as provided above into the appropriate fields in your JSON output.
`;
  }

  async *generateAndSaveSlidesFromPresentation(
    presentationId: string,
    user: User,
  ): AsyncGenerator<string, void, unknown> {
    if (!this.openRouter) {
      throw new Error('OpenRouter service is not initialized');
    }

    // Find presentation and get linked outline
    const presentation = await this.prisma.presentation.findFirst({
      where: {
        id: presentationId,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!presentation) {
      throw new Error('Presentation not found');
    }

    // Find outline linked to this presentation
    const outline = await this.prisma.outline.findFirst({
      where: {
        presentationId: presentationId,
        userId: user.id,
      },
    });

    if (!outline) {
      throw new Error('No outline found for this presentation');
    }

    if (!outline.outlines || !Array.isArray(outline.outlines)) {
      throw new Error('Outline data is invalid');
    }

    const outlineItems = outline.outlines as Array<{
      content: string;
      schemaId?: string;
      layoutId?: string;
    }>;
    const title = outline.title || 'Untitled Presentation';

    this.logger.log(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    );
    this.logger.log(
      `🚀 STARTING SLIDE GENERATION: Presentation "${title}" (${presentationId})`,
    );
    this.logger.log(`📊 Number of slides to generate: ${outlineItems.length}`);
    this.logger.log(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    );

    yield JSON.stringify({
      type: 'start',
      totalSlides: outlineItems.length,
    });

    // Generate and save slides one by one
    for (let i = 0; i < outlineItems.length; i++) {
      const outlineItem = outlineItems[i];
      const slideNumber = i + 1;
      const totalSlides = outlineItems.length;
      const schemaId = outlineItem.schemaId || outlineItem.layoutId;
      const slideStartTime = Date.now();

      this.logger.log(
        `▶ [Slide ${slideNumber}/${totalSlides}] Starting generation...`,
      );

      let templateRows: any[] = [];
      let layoutData: any = null;

      // Get layout from database
      if (schemaId) {
        const layout = await this.prisma.layout.findUnique({
          where: { id: schemaId },
        });

        if (layout && layout.data && (layout.data as any).rows) {
          layoutData = layout.data;
          templateRows = (layout.data as any).rows;
          this.logger.log(
            `📄 [Slide ${slideNumber}] Layout found: "${layout.name}" (${schemaId})`,
          );
        } else {
          this.logger.warn(
            `⚠️ [Slide ${slideNumber}] Layout ${schemaId} not found or has no row data.`,
          );
        }
      }

      yield JSON.stringify({
        type: 'slide-start',
        slideNumber,
        totalSlides,
      });

      try {
        // ============================================
        // STEP 1: Analyze layout for image fields
        // ============================================
        let imageInjectionPrompt = '';
        
        if (layoutData) {
          this.logger.log(
            `🔍 [Slide ${slideNumber}] Analyzing layout for image fields...`,
          );

          const imageAnalysis = await this.analyzeLayoutForImages(
            layoutData,
            outlineItem.content,
            title,
          );

          if (imageAnalysis.hasImages && imageAnalysis.imageFields.length > 0) {
            this.logger.log(
              `✨ [Slide ${slideNumber}] AI detected ${imageAnalysis.imageFields.length} image fields.`,
            );

            // ============================================
            // STEP 2: Fetch images from Unsplash
            // ============================================
            this.logger.log(
              `🌐 [Slide ${slideNumber}] Fetching images from Unsplash...`,
            );
            const imageMap = await this.fetchImagesForFields(
              imageAnalysis.imageFields,
            );

            if (imageMap.size > 0) {
              // ============================================
              // STEP 3: Build image injection prompt
              // ============================================
              imageInjectionPrompt = this.buildImageInjectionPrompt(
                imageMap,
                imageAnalysis.imageFields,
              );

              this.logger.log(
                `📸 [Slide ${slideNumber}] Successfully mapped ${imageMap.size} images to layout.`,
              );
              imageMap.forEach((url, path) => {
                this.logger.debug(`   ↳ ${path}: ${url}`);
              });
            } else {
              this.logger.log(
                `❓ [Slide ${slideNumber}] No matching images found on Unsplash.`,
              );
            }
          } else {
            this.logger.log(
              `ℹ️ [Slide ${slideNumber}] No image fields found in this layout.`,
            );
          }
        }

        // Build layout structure prompt
        const layoutStructureSection = `

LAYOUT STRUCTURE TEMPLATE (YOU MUST FOLLOW THIS EXACT STRUCTURE):
${JSON.stringify({ rows: templateRows }, null, 2)}

CRITICAL INSTRUCTIONS FOR USING THE LAYOUT TEMPLATE:
- You MUST generate ONLY a JSON object with a "rows" array that follows the EXACT structure of the template rows above
- Use the SAME number of rows as the template
- Use the SAME number of blocks per row as the template  
- Match the row and block structure exactly (same arrangement, same IDs pattern)
- The content inside each block should be adapted from the outline content provided below
- DO NOT add extra rows or blocks beyond what's in the template
- DO NOT remove rows or blocks from the template structure
- Only the ProseMirror content inside each block should change based on the outline content
- Keep the same row and block organization as shown in the template
- Generate ONLY: { "rows": [...] } - nothing else, no nested "data" objects

FORMATTING PRESERVATION (MOST CRITICAL):
- You MUST preserve the EXACT formatting structure from the template's "content" field
- If the template uses HTML tags (like <h1 style="text-align: center">), you MUST use the SAME HTML tags with the SAME attributes
- If the template uses plain Markdown (like ## Title), you MUST use the SAME Markdown format
- DO NOT add any HTML tags that are not in the template
- DO NOT add any Markdown formatting that is not in the template
- DO NOT change the formatting style - only replace the text content
- For example: If template has "<h2 style="text-align: center">Title</h2>", you should have "<h2 style="text-align: center">Your New Title</h2>" - keep the exact same HTML structure
- For example: If template has "## Title", you should have "## New Title" - keep the exact same Markdown format
- DO NOT add extra formatting like bold, italic, lists, etc. unless they exist in the template`;

        const slidePrompt = `You are generating slide ${slideNumber} of ${totalSlides} for a presentation titled "${title}".

OUTLINE CONTENT FOR THIS SLIDE (in markdown format):
${outlineItem.content}
${layoutStructureSection}
${imageInjectionPrompt}

⚠️⚠️⚠️ CRITICAL: EXACT FORMATTING PRESERVATION - THIS IS THE MOST IMPORTANT RULE ⚠️⚠️⚠️

YOU MUST FOLLOW THE EXACT FORMATTING FROM THE TEMPLATE - DO NOT ADD ANY EXTRA FORMATTING:

1. Look at each block's "content" field in the template above
2. You MUST use the EXACT SAME formatting structure that exists in the template
3. DO NOT add any formatting (HTML or Markdown) that is not already in the template
4. DO NOT remove any formatting that exists in the template
5. ONLY replace the text content, keeping the exact same formatting wrapper
6. If template has HTML tags, keep the SAME HTML tags with SAME attributes
7. If template has Markdown, keep the SAME Markdown format
8. DO NOT add bold, italic, lists, or any other formatting unless it exists in the template

CRITICAL INSTRUCTIONS:
You MUST generate ONLY a JSON object with a "rows" array that matches the layout template structure above. The structure (rows, blocks, IDs) must be identical. Only adapt the ProseMirror content inside each block's "content" field based on the outline content.

⚠️ FORMATTING RULES (FOLLOW EXACTLY) ⚠️:

1. IF TEMPLATE HAS HTML TAGS:
   - ⚠️ IMPORTANT: Preserve the EXACT HTML tag structure (e.g., <h1 style="text-align: center">, <p style="text-align: center">)
   - Keep the same tag name, same attributes, same style values
   - Only change the text content inside the tags
   - Example: Template has "<h2 style="text-align: center">Title</h2>" → You output "<h2 style="text-align: center">New Title</h2>"
   - ⚠️ DO NOT add any HTML tags that are not in the template

2. IF TEMPLATE HAS MARKDOWN:
   - ⚠️ IMPORTANT: Preserve the EXACT Markdown format (e.g., ## Title, **bold**, - list item)
   - Keep the same Markdown syntax
   - Only change the text content
   - Example: Template has "## Title" → You output "## New Title"
   - ⚠️ DO NOT add any Markdown formatting that is not in the template

3. ⚠️ DO NOT ADD EXTRA FORMATTING (CRITICAL):
   - DO NOT add HTML tags if the template doesn't have them
   - DO NOT add Markdown formatting (bold, italic, lists) if the template doesn't have them
   - DO NOT wrap content in additional tags
   - DO NOT convert between HTML and Markdown - use what's in the template
   - DO NOT add any formatting that is not already present in the template

4. TEXT CONTENT ONLY:
   - Extract the text from the outline content
   - Replace only the text portion in the template's formatting
   - Keep everything else exactly as it appears in the template

REQUIRED JSON FORMAT:
Generate ONLY this structure: { "rows": [...] }
- The "rows" array must match the template exactly
- Preserve all row IDs, block IDs, and structure from the template
- ⚠️ IMPORTANT: Preserve the EXACT formatting from each block's "content" field in the template
- ⚠️ IMPORTANT: Only replace text content, keep all formatting (HTML tags, Markdown syntax) exactly as in template
- Do NOT wrap it in a "data" object
- Do NOT add any other properties

⚠️ REMINDER - FORMATTING PRESERVATION IS CRITICAL:
- Use the EXACT same formatting structure from the template
- DO NOT add any extra formatting
- Only replace text content

IMPORTANT: 
- Generate ONLY the raw JSON object: { "rows": [...] }
- Do NOT include \`\`\`json or \`\`\` markers
- Output starts with { and ends with }
- Ensure valid JSON format
- Structure MUST exactly match the template - same rows, same blocks per row, same IDs`;

        this.logger.log(
          `🤖 [Slide ${slideNumber}] Calling LLM for content generation...`,
        );

        const response = await this.openRouter.chat.send({
          model: this.MODEL_NAME,
          messages: [
            {
              role: 'user',
              content: slidePrompt,
            },
          ],
          stream: false,
        });

        const content = response.choices[0]?.message?.content;

        // Log tech usage
        if (response.usage) {
          const inputTokens =
            (response.usage as any).promptTokens ||
            (response.usage as any).prompt_tokens;
          const outputTokens =
            (response.usage as any).completionTokens ||
            (response.usage as any).completion_tokens;

          this.logger.log(
            `📈 [Slide ${slideNumber}] AI Usage: ${inputTokens} in / ${outputTokens} out`,
          );

          await this.aiUsageService.logUsage({
            userId: user.id,
            modelName: this.MODEL_NAME,
            inputTokens,
            outputTokens,
            type: 'slide',
            presentationId: presentationId,
          });
        }

        // Clean the response
        let cleanedContent = (content as string)?.trim() || '';
        if (cleanedContent.startsWith('```json')) {
          cleanedContent = cleanedContent
            .replace(/^```json\s*/, '')
            .replace(/\s*```$/, '');
        } else if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent
            .replace(/^```\s*/, '')
            .replace(/\s*```$/, '');
        }

        // Parse JSON
        let slideData;
        try {
          slideData = JSON.parse(cleanedContent);
        } catch (parseError) {
          const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            slideData = JSON.parse(jsonMatch[0]);
          }
        }

        // Extract rows if nested in data object
        if (slideData?.data?.rows) {
          slideData = { rows: slideData.data.rows };
        } else if (slideData?.data) {
          slideData = { rows: slideData.data };
        } else if (!slideData?.rows && slideData) {
          slideData = { rows: Array.isArray(slideData) ? slideData : [] };
        }

        // Save slide to database
        const existingSlides = await this.prisma.slide.findMany({
          where: {
            presentationId,
            deletedAt: null,
          },
          orderBy: { order: 'asc' },
        });

        const slideOrder = existingSlides.length;

        const savedSlide = await this.prisma.slide.create({
          data: {
            presentationId,
            data: slideData,
            order: slideOrder,
          },
        });

        const slideDuration = ((Date.now() - slideStartTime) / 1000).toFixed(2);
        this.logger.log(
          `✅ [Slide ${slideNumber}] Saved successfully! (ID: ${savedSlide.id}, Time: ${slideDuration}s)`,
        );

        // Stream the slide data with the saved slide ID
        yield JSON.stringify({
          type: 'slide',
          slideNumber,
          slideId: savedSlide.id,
          data: slideData,
        });
      } catch (error: any) {
        this.logger.error(
          `❌ [Slide ${slideNumber}] FAILED during generation:`,
          error,
        );
        yield JSON.stringify({
          type: 'slide-error',
          slideNumber,
          message: error.message || 'Failed to generate slide',
        });
      }
    }

    this.logger.log(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    );
    this.logger.log(
      `🎉 COMPLETED SLIDE GENERATION for "${title}" (${presentationId})`,
    );
    this.logger.log(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    );

    yield JSON.stringify({
      type: 'complete',
      totalSlides: outlineItems.length,
    });
  }
}

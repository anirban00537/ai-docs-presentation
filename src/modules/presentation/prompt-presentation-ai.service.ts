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
  ) { }

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
   * Sanitize malformed URLs in JSON strings (e.g., double query string separators)
   */
  private sanitizeJsonUrls(jsonString: string): string {
    // Fix Unsplash URLs with duplicate query strings: ?...?... -> ?...&...
    let sanitized = jsonString.replace(
      /(https:\/\/[^\s"]*\?)([^\s"]*?)\?([^\s"]*)/g,
      '$1$2&$3'
    );

    // Fix multiple consecutive ? in any URL
    sanitized = sanitized.replace(
      /(https?:\/\/[^\s"]*)\?+/g,
      (match, prefix) => {
        const questionMarks = match.match(/\?/g)?.length || 0;
        return questionMarks > 1 ? prefix + '?' : match;
      }
    );

    return sanitized;
  }

  /**
   * Clean markdown code block wrappers and other malformed patterns from JSON content
   */
  private cleanJsonContent(content: string): string {
    let cleaned = content?.trim() || '';

    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    cleaned = cleaned.trim();

    // Remove leading dots, periods, or other garbage characters before the JSON
    // Pattern: anything before the first { that isn't part of valid JSON
    cleaned = cleaned.replace(/^[.\s\n\r]*(?=\{)/, '');

    // Fix double opening braces: {{ -> {
    // This handles cases like "{\n{" or "{{"
    cleaned = cleaned.replace(/^\{\s*\{/, '{');

    // Fix double closing braces at the end: }} -> }
    // But only if there's an imbalance (more } than {)
    const openCount = (cleaned.match(/\{/g) || []).length;
    const closeCount = (cleaned.match(/\}/g) || []).length;
    if (closeCount > openCount) {
      // Remove extra closing braces from the end
      const excess = closeCount - openCount;
      for (let i = 0; i < excess; i++) {
        cleaned = cleaned.replace(/\}(\s*)$/, '$1');
      }
    }

    return cleaned.trim();
  }

  /**
   * Attempt to repair common JSON issues like missing closing braces
   */
  private attemptJsonRepair(jsonStr: string): string | null {
    try {
      // Count opening and closing braces/brackets
      const openBraces = (jsonStr.match(/\{/g) || []).length;
      const closeBraces = (jsonStr.match(/\}/g) || []).length;
      const openBrackets = (jsonStr.match(/\[/g) || []).length;
      const closeBrackets = (jsonStr.match(/\]/g) || []).length;

      let repaired = jsonStr;

      // Add missing closing brackets first (inner), then braces (outer)
      if (openBrackets > closeBrackets) {
        repaired += ']'.repeat(openBrackets - closeBrackets);
      }
      if (openBraces > closeBraces) {
        repaired += '}'.repeat(openBraces - closeBraces);
      }

      // Validate the repair worked
      JSON.parse(repaired);
      this.logger.debug('Successfully repaired truncated JSON');
      return repaired;
    } catch {
      return null;
    }
  }

  /**
   * Robust JSON extraction with multiple fallback strategies
   */
  private extractValidJson(content: string): any {
    const originalContent = content?.substring(0, 200) || '';

    // Step 1: Clean markdown wrappers and malformed patterns
    let cleanedContent = this.cleanJsonContent(content);

    // Step 1.5: Sanitize URLs before parsing
    cleanedContent = this.sanitizeJsonUrls(cleanedContent);

    this.logger.debug(`JSON extraction - Original starts with: "${originalContent.substring(0, 50)}..."`);
    this.logger.debug(`JSON extraction - Cleaned starts with: "${cleanedContent.substring(0, 50)}..."`);

    // Step 2: Try direct parse
    try {
      return JSON.parse(cleanedContent);
    } catch (directError) {
      this.logger.debug(`Direct JSON parse failed: ${(directError as Error).message}`);
    }

    // Step 3: Try to extract JSON object from text
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      // Apply cleaning again to the extracted match (handles nested double braces)
      let extractedJson = jsonMatch[0];
      extractedJson = extractedJson.replace(/^\{\s*\{/, '{'); // Fix leading double braces

      try {
        return JSON.parse(extractedJson);
      } catch (extractError) {
        this.logger.debug(`Extracted JSON parse failed: ${(extractError as Error).message}`);

        // Step 4: Attempt repair
        const repairedJson = this.attemptJsonRepair(extractedJson);
        if (repairedJson) {
          return JSON.parse(repairedJson);
        }
      }
    }

    // All strategies failed - log more details for debugging
    this.logger.error(`JSON extraction failed. Cleaned content (first 300 chars): ${cleanedContent.substring(0, 300)}`);
    throw new Error(`Failed to extract valid JSON from AI response. Content starts with: ${cleanedContent.substring(0, 100)}...`);
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

      // Use robust JSON extraction to handle markdown wrappers and malformed JSON
      const result: ImageAnalysisResult = this.extractValidJson(content);

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
1. For "accent.url" - Add a top-level "accent" object to your JSON response with these properties:
   {
     "accent": {
       "url": "the-provided-url",
       "position": "right",
       "size": 40
     },
     "rows": [...]
   }
2. For "rows[X].blocks[Y].content.url" - Set the block's content url to the provided URL within the rows array
3. For avatar/profile fields - Set the avatar or profileImage field to the provided URL within the appropriate block

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

TEXT ALIGNMENT SYNTAX (IMPORTANT):
- To align text, use <align="..."> tags wrapping the content
- Available alignments: center, right, left, justify
- Examples:
  * <align="center">## Centered Heading</align>
  * <align="center">Centered paragraph text</align>
  * <align="right">Right-aligned text</align>
  * <align="justify">Justified paragraph</align>
- DO NOT use inline styles unless absolutely necessary
- The <align> tags will be automatically converted to proper text alignment

⚠️ CRITICAL: URL FORMATTING RULES (MUST FOLLOW):
- Accent image URLs must be valid, well-formed URLs
- Use this EXACT Unsplash format: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=1200&q=80
- DO NOT duplicate query parameters (e.g., ?auto=format?auto=format is INVALID)
- DO NOT add multiple ? characters to URLs
- Only ONE ? is allowed per URL, followed by & for additional parameters
- Example CORRECT: "https://images.unsplash.com/photo-123?auto=format&fit=crop&w=1200&q=80"
- Example WRONG: "https://images.unsplash.com/photo-123?auto=format?fit=crop" (TWO ? marks)
- If unsure, use a simple Unsplash photo ID URL without extra parameters`;

        const slidePrompt = `You are generating slide ${slideNumber} of ${totalSlides} for a presentation titled "${title}".

OUTLINE CONTENT FOR THIS SLIDE (in markdown format):
${outlineItem.content}
${layoutStructureSection}
${imageInjectionPrompt}

⚠️⚠️⚠️ CRITICAL: CONTENT GENERATION RULES ⚠️⚠️⚠️

FORMATTING GUIDELINES:

1. TEXT ALIGNMENT:
   - Use <align="center">, <align="right">, <align="left">, or <align="justify"> tags
   - Wrap entire content blocks that need alignment
   - Example: <align="center">## Title Text</align>
   - Example: <align="center">Paragraph content here</align>
   - DO NOT use inline styles for alignment

2. MARKDOWN BASICS:
   - Use ## for headings (level 2), ### for subheadings (level 3)
   - Use **bold** for emphasis
   - Use *italic* for subtle emphasis
   - Use - for bullet lists
   - Keep markdown clean and simple

3. CONTENT STRUCTURE:
   - Match the template's block structure exactly
   - Only change the text content, not the structure
   - Preserve row and block organization
   - Use the same block types as the template

⚠️ HTML TAG RESTRICTION (CRITICAL):
- You may ONLY use the <align> tag for text alignment
- DO NOT use any other HTML tags: NO <div>, <span>, <p>, <h1>, <center>, <b>, <i>, <strong>, <em>, etc.
- DO NOT use inline styles: NO style="..." attributes
- DO NOT use class attributes: NO class="..." 
- Use pure Markdown formatting instead (##, **, *, -, etc.)
- The ONLY exception is <align="..."></align> for text alignment
- Any other HTML will break the slide rendering

CRITICAL INSTRUCTIONS:
You MUST generate ONLY a JSON object with a "rows" array that matches the layout template structure above. The structure (rows, blocks, IDs) must be identical. Only adapt the ProseMirror content inside each block's "content" field based on the outline content.

REQUIRED JSON FORMAT:
${imageInjectionPrompt ? 'If accent.url was provided above, generate: { "accent": { "url": "...", "position": "right", "size": 40 }, "rows": [...] }' : 'Generate: { "rows": [...] }'}
- The "rows" array must match the template exactly
- Preserve all row IDs, block IDs, and structure from the template
- ⚠️ IMPORTANT: Preserve the EXACT formatting from each block's "content" field in the template
- ⚠️ IMPORTANT: Only replace text content, keep all formatting (HTML tags, Markdown syntax) exactly as in template
${imageInjectionPrompt ? '- ⚠️ IMPORTANT: If accent.url was provided in the IMAGE INJECTION section above, you MUST include the accent object at the top level of your response' : ''}
- Do NOT wrap it in a "data" object
- Do NOT add any other properties

⚠️ REMINDER - FORMATTING PRESERVATION IS CRITICAL:
- Use the EXACT same formatting structure from the template
- DO NOT add any extra formatting
- Only replace text content

IMPORTANT: 
${imageInjectionPrompt ? '- If accent.url was provided, include: { "accent": { "url": "...", "position": "right", "size": 40 }, "rows": [...] }' : ''}
- Generate ONLY the raw JSON object: { "rows": [...] } ${imageInjectionPrompt ? '(plus "accent" if provided)' : ''}
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
          // Use structured JSON output to prevent malformed responses
          responseFormat: {
            type: 'json_schema',
            jsonSchema: {
              name: 'slide_content',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  rows: {
                    type: 'array',
                    description: 'Array of slide rows matching the template structure',
                    items: {
                      type: 'object',
                      additionalProperties: true,
                    },
                  },
                  accent: {
                    type: 'object',
                    description: 'Optional accent image configuration for the slide',
                    properties: {
                      url: {
                        type: 'string',
                        description: 'URL of the accent image',
                      },
                      position: {
                        type: 'string',
                        enum: ['left', 'right', 'top', 'bottom', 'background'],
                        description: 'Position of the accent image',
                      },
                      size: {
                        type: 'number',
                        description: 'Size of the accent image as a percentage (1-100)',
                      },
                    },
                    required: ['url'],
                    additionalProperties: false,
                  },
                },
                required: ['rows'],
                additionalProperties: false,
              },
            },
          },
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

        // Use robust JSON extraction with cleanup, fallback, and repair strategies
        let slideData;
        let parseSuccessful = false;

        try {
          slideData = this.extractValidJson(content as string);
          parseSuccessful = true;
        } catch (parseError) {
          this.logger.warn(
            `[Slide ${slideNumber}] JSON parsing failed, using template fallback structure...`
          );
          
          // Fallback: Use template structure with minimal content
          slideData = {
            rows: templateRows.map((row: any) => ({
              ...row,
              blocks: row.blocks.map((block: any) => ({
                ...block,
                content: block.type === 'prosemirror' 
                  ? '## Generated Content\n\nContent generation incomplete. Please edit this slide.'
                  : block.content
              }))
            }))
          };
          
          this.logger.log(`[Slide ${slideNumber}] Using template fallback structure (parse error: ${(parseError as Error).message})`);
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

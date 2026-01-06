import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AiUsageService } from '../../subscription/services/ai-usage.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';

// Internal imports
import { OutlineItem } from './interfaces';
import { JsonCleanerUtil } from './utils';
import { ImageAnalyzerService, ImageFetcherService } from './generators';
import { PromptBuilderService } from './prompts';
import { SLIDE_CONTENT_JSON_SCHEMA } from './constants';

/**
 * Main service for AI-powered presentation slide generation
 */
@Injectable()
export class PromptPresentationAIService implements OnModuleInit {
  private readonly logger = new Logger(PromptPresentationAIService.name);
  private openRouter: any = null;
  private readonly MODEL_NAME = coreConstant.AI_MODELS.SLIDES.NAME;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly aiUsageService: AiUsageService,
    private readonly imageAnalyzerService: ImageAnalyzerService,
    private readonly imageFetcherService: ImageFetcherService,
    private readonly promptBuilderService: PromptBuilderService,
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
   * Generate and save slides from a presentation outline
   * This is the main orchestration method for slide generation
   */
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

    const outlineItems = outline.outlines as unknown as OutlineItem[];
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

      yield* this.generateSingleSlide(
        outlineItem,
        slideNumber,
        totalSlides,
        title,
        presentationId,
        user,
      );
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

  /**
   * Generate a single slide from an outline item
   */
  private async *generateSingleSlide(
    outlineItem: OutlineItem,
    slideNumber: number,
    totalSlides: number,
    title: string,
    presentationId: string,
    user: User,
  ): AsyncGenerator<string, void, unknown> {
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
      // Step 1: Analyze layout and fetch images
      const imageInjectionPrompt = await this.processImages(
        layoutData,
        outlineItem.content,
        title,
        slideNumber,
      );

      // Step 2: Build prompts and generate slide content
      const slideData = await this.generateSlideContent(
        slideNumber,
        totalSlides,
        title,
        outlineItem.content,
        templateRows,
        imageInjectionPrompt,
        user,
        presentationId,
      );

      // Step 3: Save slide to database
      const savedSlide = await this.saveSlide(presentationId, slideData);

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

  /**
   * Process images for a slide (analyze and fetch)
   */
  private async processImages(
    layoutData: any,
    outlineContent: string,
    title: string,
    slideNumber: number,
  ): Promise<string> {
    let imageInjectionPrompt = '';

    if (layoutData) {
      this.logger.log(
        `🔍 [Slide ${slideNumber}] Analyzing layout for image fields...`,
      );

      const imageAnalysis =
        await this.imageAnalyzerService.analyzeLayoutForImages(
          this.openRouter,
          layoutData,
          outlineContent,
          title,
        );

      if (imageAnalysis.hasImages && imageAnalysis.imageFields.length > 0) {
        this.logger.log(
          `✨ [Slide ${slideNumber}] AI detected ${imageAnalysis.imageFields.length} image fields.`,
        );

        this.logger.log(
          `🌐 [Slide ${slideNumber}] Fetching images from Unsplash...`,
        );
        const imageMap = await this.imageFetcherService.fetchImagesForFields(
          imageAnalysis.imageFields,
        );

        if (imageMap.size > 0) {
          imageInjectionPrompt =
            this.promptBuilderService.buildImageInjectionPrompt(
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

    return imageInjectionPrompt;
  }

  /**
   * Generate slide content using AI
   */
  private async generateSlideContent(
    slideNumber: number,
    totalSlides: number,
    title: string,
    outlineContent: string,
    templateRows: any[],
    imageInjectionPrompt: string,
    user: User,
    presentationId: string,
  ): Promise<any> {
    // Build layout structure prompt
    const layoutStructureSection =
      this.promptBuilderService.buildLayoutStructurePrompt(templateRows);

    const slidePrompt = this.promptBuilderService.buildSlidePrompt(
      slideNumber,
      totalSlides,
      title,
      outlineContent,
      layoutStructureSection,
      imageInjectionPrompt,
    );

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
        jsonSchema: SLIDE_CONTENT_JSON_SCHEMA,
      },
      stream: false,
    });

    const content = response.choices[0]?.message?.content;

    // Log AI usage
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

    // Parse and normalize slide data
    let slideData;
    let parseSuccessful = false;

    try {
      slideData = JsonCleanerUtil.extractValidJson(content as string);
      parseSuccessful = true;
    } catch (parseError) {
      this.logger.warn(
        `[Slide ${slideNumber}] JSON parsing failed, using template fallback structure...`,
      );

      // Fallback: Use template structure with minimal content
      slideData = {
        rows: templateRows.map((row: any) => ({
          ...row,
          blocks: row.blocks.map((block: any) => ({
            ...block,
            content:
              block.type === 'prosemirror'
                ? '## Generated Content\n\nContent generation incomplete. Please edit this slide.'
                : block.content,
          })),
        })),
      };

      this.logger.log(
        `[Slide ${slideNumber}] Using template fallback structure (parse error: ${(parseError as Error).message})`,
      );
    }

    // Extract rows if nested in data object
    if (slideData?.data?.rows) {
      slideData = { rows: slideData.data.rows };
    } else if (slideData?.data) {
      slideData = { rows: slideData.data };
    } else if (!slideData?.rows && slideData) {
      slideData = { rows: Array.isArray(slideData) ? slideData : [] };
    }

    return slideData;
  }

  /**
   * Save a slide to the database
   */
  private async saveSlide(presentationId: string, slideData: any) {
    const existingSlides = await this.prisma.slide.findMany({
      where: {
        presentationId,
        deletedAt: null,
      },
      orderBy: { order: 'asc' },
    });

    const slideOrder = existingSlides.length;

    return await this.prisma.slide.create({
      data: {
        presentationId,
        data: slideData,
        order: slideOrder,
      },
    });
  }
}

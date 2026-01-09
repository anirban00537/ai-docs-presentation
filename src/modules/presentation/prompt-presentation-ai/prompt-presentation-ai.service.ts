import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AiUsageService } from '../../subscription/services/ai-usage.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';

// Internal imports
import { OutlineItem } from './interfaces/outline.interface';
import { ImageAnalyzerService } from './generators/image-analyzer.service';
import { ImageFetcherService } from './generators/image-fetcher.service';
import { PromptBuilderService } from './prompts/prompt-builder.service';

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
    const estimatedSeconds = 10; // Average time per slide

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

    // Initial slide-start event with estimated time
    yield JSON.stringify({
      type: 'slide-start',
      slideNumber,
      totalSlides,
      estimatedSeconds,
      stage: 'initializing',
    });

    try {
      // Step 1: Analyze layout and fetch images
      yield JSON.stringify({
        type: 'slide-progress',
        slideNumber,
        stage: 'analyzing-layout',
        message: 'Analyzing layout structure...',
      });

      const imageInjectionPrompt = await this.processImages(
        layoutData,
        outlineItem.content,
        title,
        slideNumber,
      );

      // Step 2: Generate slide content (with streaming)
      yield JSON.stringify({
        type: 'slide-progress',
        slideNumber,
        stage: 'generating-content',
        message: 'AI is creating slide content...',
      });

      let slideData: any;
      for await (const chunk of this.generateSlideContent(
        slideNumber,
        totalSlides,
        title,
        outlineItem.content,
        templateRows,
        imageInjectionPrompt,
        user,
        presentationId,
      )) {
        // Check if this is the final slide data (an object, not a JSON string)
        if (typeof chunk === 'object' && chunk !== null) {
          // This is the final slide data
          slideData = chunk;
        } else if (typeof chunk === 'string') {
          // This is a streaming progress chunk (JSON string)
          yield chunk;
        }
      }

      // Verify we got slide data
      if (!slideData) {
        throw new Error('No slide data generated from stream');
      }

      // Step 3: Save slide to database
      yield JSON.stringify({
        type: 'slide-progress',
        slideNumber,
        stage: 'saving-slide',
        message: 'Saving slide to database...',
      });

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
        duration: slideDuration,
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
   * Generate slide content using AI (with streaming support)
   */
  private async *generateSlideContent(
    slideNumber: number,
    totalSlides: number,
    title: string,
    outlineContent: string,
    templateRows: any[],
    imageInjectionPrompt: string,
    user: User,
    presentationId: string,
  ): AsyncGenerator<string, any, unknown> {
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

    // Check if accent image is being injected
    const hasAccent = imageInjectionPrompt.includes('accent.url');

    // Generate dynamic JSON schema from template at runtime (no hardcoded types!)
    const { DynamicSchemaUtil } = await import('./utils/dynamic-schema.util');
    const slideSchema = DynamicSchemaUtil.generateSlideSchemaFromTemplate(templateRows, hasAccent);
    
    this.logger.debug(`[Slide ${slideNumber}] Generated dynamic schema for ${templateRows.length} rows`);

    const stream = await this.openRouter.chat.send({
      model: this.MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: slidePrompt,
        },
      ],
      temperature: 0.2, // Low creativity for strict adherence to structure
      // Use structured output with dynamic schema
      responseFormat: {
        type: 'json_schema',
        jsonSchema: {
          name: 'slide_structure',
          strict: true,
          schema: slideSchema,
        },
      },
      stream: true, // Enable streaming
    });

    let accumulatedContent = '';
    let slideData: any = null;
    let finishReason: string | null = null;

    // Process stream chunks - send every token to frontend
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      
      if (chunk.choices[0]?.finish_reason) {
        finishReason = chunk.choices[0].finish_reason;
      }
      
      if (delta) {
        accumulatedContent += delta;
        
        // Send raw text chunk to frontend for real-time display
        yield JSON.stringify({
          type: 'slide-streaming',
          slideNumber,
          rawChunk: delta,
          accumulatedText: accumulatedContent,
          isComplete: false,
        });
      }
      
      // Check if stream is done
      if (chunk.choices[0]?.finish_reason === 'stop') {
        break;
      }
    }

    // Final parse
    if (!slideData) {
      if (!accumulatedContent) {
        throw new Error(
          `AI returned empty response. Finish Reason: ${finishReason || 'unknown'}`
        );
      }

      try {
        slideData = JSON.parse(accumulatedContent);
      } catch (e: any) {
        this.logger.error(
          `❌ [Slide ${slideNumber}] JSON Parse Error: ${e.message}. Finish Reason: ${finishReason}`,
        );
        this.logger.debug(`Failed Content (last 100 chars): ${accumulatedContent.slice(-100)}`);
        
        // Naive repair for simple truncation if length was the reason
        if (finishReason === 'length' || e.message.includes('Unterminated string')) {
           // Attempt to close string and object
           try {
             // Very naive repair: close string if open, then close object
             const repaired = accumulatedContent + '"}\n]}'; 
             // Note: accurate repair requires a stack parser, but this might save a simple case
           } catch (repairError) {}
        }

        throw new Error(
          `Slide generation incomplete (${finishReason || 'interrupted'}). Please try again.`
        );
      }
    }

    // Log AI usage (usage info comes at the end of stream)
    // Note: Stream mode might not provide usage info immediately
    this.logger.log(
      `📈 [Slide ${slideNumber}] Stream completed`,
    );

    // Yield final slide data (not as JSON string, but as the actual object)
    // This is the return value that the caller will use
    if (slideData) {
      yield slideData;
    }
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

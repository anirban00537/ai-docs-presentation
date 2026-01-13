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
 * Main service for AI-powered doc card generation
 */
@Injectable()
export class PromptDocsAIService implements OnModuleInit {
  private readonly logger = new Logger(PromptDocsAIService.name);
  private openRouter: any = null;
  private readonly MODEL_NAME = coreConstant.AI_MODELS.CARDS.NAME;

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
   * Generate and save cards from a doc outline
   * This is the main orchestration method for card generation
   */
  async *generateAndSaveCardsFromDoc(
    docId: string,
    user: User,
  ): AsyncGenerator<string, void, unknown> {
    if (!this.openRouter) {
      throw new Error('OpenRouter service is not initialized');
    }

    // Find doc with cards that have outline data
    const doc = await this.prisma.doc.findFirst({
      where: {
        id: docId,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        cards: {
          where: {
            deletedAt: null,
            outline: { not: null },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!doc) {
      throw new Error('Doc not found');
    }

    if (!doc.cards || doc.cards.length === 0) {
      throw new Error('No cards with outline data found for this doc');
    }

    // Extract outline items from cards
    const outlineItems: OutlineItem[] = doc.cards
      .map((card): OutlineItem | null => {
        const outline = card.outline as any;
        if (!outline) return null;
        return {
          content: outline.content || '',
          layoutId: outline.layoutId || outline.schemaId,
          schemaId: outline.schemaId || outline.layoutId,
        };
      })
      .filter((item): item is OutlineItem => item !== null);

    if (outlineItems.length === 0) {
      throw new Error('No valid outline data found in cards');
    }

    const title = doc.title || 'Untitled Doc';

    this.logger.log(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    );
    this.logger.log(
      `🚀 STARTING CARD GENERATION: Doc "${title}" (${docId})`,
    );
    this.logger.log(`📊 Number of cards to generate: ${outlineItems.length}`);
    this.logger.log(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    );

    yield JSON.stringify({
      type: 'start',
      totalCards: outlineItems.length,
    });

    // Generate and save cards one by one
    for (let i = 0; i < outlineItems.length; i++) {
      const outlineItem = outlineItems[i];
      const cardNumber = i + 1;
      const totalCards = outlineItems.length;
      const cardId = doc.cards[i]?.id; // Get the card ID to update it

      yield* this.generateSingleCard(
        outlineItem,
        cardNumber,
        totalCards,
        title,
        docId,
        cardId,
        user,
      );
    }

    this.logger.log(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    );
    this.logger.log(
      `🎉 COMPLETED CARD GENERATION for "${title}" (${docId})`,
    );
    this.logger.log(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    );

    yield JSON.stringify({
      type: 'complete',
      totalCards: outlineItems.length,
    });
  }

  /**
   * Generate a single card from an outline item
   */
  private async *generateSingleCard(
    outlineItem: OutlineItem,
    cardNumber: number,
    totalCards: number,
    title: string,
    docId: string,
    cardId: string | undefined,
    user: User,
  ): AsyncGenerator<string, void, unknown> {
    const schemaId = outlineItem.schemaId || outlineItem.layoutId;
    const cardStartTime = Date.now();
    const estimatedSeconds = 10; // Average time per card

    this.logger.log(
      `▶ [Card ${cardNumber}/${totalCards}] Starting generation...`,
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
          `📄 [Card ${cardNumber}] Layout found: "${layout.name}" (${schemaId})`,
        );
      } else {
        this.logger.warn(
          `⚠️ [Card ${cardNumber}] Layout ${schemaId} not found or has no row data.`,
        );
      }
    }

    // Initial card-start event with estimated time
    yield JSON.stringify({
      type: 'card-start',
      cardNumber,
      totalCards,
      estimatedSeconds,
      stage: 'initializing',
    });

    try {
      // Step 1: Build image query instructions
      const imageQueryInstructions = this.promptBuilderService.buildImageQueryInstructions();

      const hasAccent = !!layoutData?.accent;

      // Step 2: Generate card content (with streaming)
      yield JSON.stringify({
        type: 'card-progress',
        cardNumber,
        stage: 'generating-content',
        message: 'AI is creating card content...',
      });

      let cardData: any;
      for await (const chunk of this.generateCardContent(
        cardNumber,
        totalCards,
        title,
        outlineItem.content,
        templateRows,
        imageQueryInstructions,
        user,
        docId,
        hasAccent,
      )) {
        // Check if this is the final card data (an object, not a JSON string)
        if (typeof chunk === 'object' && chunk !== null) {
          // This is the final card data
          cardData = chunk;
        } else if (typeof chunk === 'string') {
          // This is a streaming progress chunk (JSON string)
          yield chunk;
        }
      }

      // Verify we got card data
      if (!cardData) {
        throw new Error('No card data generated from stream');
      }

      // Step 3: Save card to database
      yield JSON.stringify({
        type: 'card-progress',
        cardNumber,
        stage: 'saving-card',
        message: 'Saving card to database...',
      });

      const savedCard = await this.saveCard(docId, cardId, cardData);

      const cardDuration = ((Date.now() - cardStartTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ [Card ${cardNumber}] Saved successfully! (ID: ${savedCard.id}, Time: ${cardDuration}s)`,
      );

      // Stream the card data with the saved card ID
      yield JSON.stringify({
        type: 'card',
        cardNumber,
        cardId: savedCard.id,
        data: cardData,
        duration: cardDuration,
      });
    } catch (error: any) {
      this.logger.error(
        `❌ [Card ${cardNumber}] FAILED during generation:`,
        error,
      );
      yield JSON.stringify({
        type: 'card-error',
        cardNumber,
        message: error.message || 'Failed to generate card',
      });
    }
  }


  /**
   * Generate card content using AI (with streaming support)
   */
  private async *generateCardContent(
    cardNumber: number,
    totalCards: number,
    title: string,
    outlineContent: string,
    templateRows: any[],
    imageQueryInstructions: string,
    user: User,
    docId: string,
    hasAccent: boolean = false,
  ): AsyncGenerator<string, any, unknown> {
    // Build layout structure prompt
    const layoutStructureSection =
      this.promptBuilderService.buildLayoutStructurePrompt(templateRows);

    const cardPrompt = this.promptBuilderService.buildCardPrompt(
      cardNumber,
      totalCards,
      title,
      outlineContent,
      layoutStructureSection,
      imageQueryInstructions,
    );

    this.logger.log(
      `🤖 [Card ${cardNumber}] Calling LLM for content generation...`,
    );

    // Generate dynamic JSON schema from template at runtime (handles imageQuery!)
    const { DynamicSchemaUtil } = await import('./utils/dynamic-schema.util');
    const cardSchema = DynamicSchemaUtil.generateCardSchemaFromTemplate(templateRows, hasAccent);
    
    this.logger.debug(`[Card ${cardNumber}] Generated dynamic schema for ${templateRows.length} rows`);

    const stream = await this.openRouter.chat.send({
      model: this.MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: cardPrompt,
        },
      ],
      temperature: 0, // Zero creativity for deterministic structured output
      seed: 42, // Consistent results across runs
      top_p: 1, // Focus on top probability tokens
      // Use structured output with dynamic schema
      responseFormat: {
        type: 'json_schema',
        jsonSchema: {
          name: 'card_structure',
          strict: true,
          schema: cardSchema,
        },
      },
      strict: true,
      stream: true, // Enable streaming
      streamOptions: {
        includeUsage: true, // Include token usage in the final chunk
      },
    });

    let accumulatedContent = '';
    let cardData: any = null;
    let finishReason: string | null = null;
    let usageData: any = null;

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
          type: 'card-streaming',
          cardNumber,
          rawChunk: delta,
          accumulatedText: accumulatedContent,
          isComplete: false,
        });
      }
      
      // Capture usage data from the final chunk
      if (chunk.usage) {
        usageData = chunk.usage;
        this.logger.log(`📊 [Card ${cardNumber}] Token usage - Prompt: ${usageData.promptTokens}, Completion: ${usageData.completionTokens}, Total: ${usageData.totalTokens}`);
      }
      
      // Check if stream is done
      if (chunk.choices[0]?.finish_reason === 'stop') {
        break;
      }
    }

    // Final parse
    if (!cardData) {
      if (!accumulatedContent) {
        throw new Error(
          `AI returned empty response. Finish Reason: ${finishReason || 'unknown'}`
        );
      }

      try {
        cardData = JSON.parse(accumulatedContent);
      } catch (e: any) {
        this.logger.error(
          `❌ [Card ${cardNumber}] JSON Parse Error: ${e.message}. Finish Reason: ${finishReason}`,
        );
        this.logger.debug(`Failed Content (first 200 chars): ${accumulatedContent.slice(0, 200)}`);
        this.logger.debug(`Failed Content (last 200 chars): ${accumulatedContent.slice(-200)}`);
        
        // Attempt JSON repair for truncated responses
        if (finishReason === 'length') {
          this.logger.warn(`⚠️ [Card ${cardNumber}] Response truncated due to token limit. Attempting repair...`);
          
          try {
            let repaired = accumulatedContent.trim();
            
            // Count open/close braces and brackets
            const openBraces = (repaired.match(/{/g) || []).length;
            const closeBraces = (repaired.match(/}/g) || []).length;
            const openBrackets = (repaired.match(/\[/g) || []).length;
            const closeBrackets = (repaired.match(/\]/g) || []).length;
            
            // Close any unterminated strings
            const quoteCount = (repaired.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0) {
              repaired += '"';
            }
            
            // Close arrays first (inner to outer)
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
              repaired += ']';
            }
            
            // Close objects (inner to outer)
            for (let i = 0; i < openBraces - closeBraces; i++) {
              repaired += '}';
            }
            
            cardData = JSON.parse(repaired);
            this.logger.log(`✅ [Card ${cardNumber}] Successfully repaired truncated JSON`);
          } catch (repairError: any) {
            this.logger.error(`❌ [Card ${cardNumber}] JSON repair failed: ${repairError.message}`);
            throw new Error(
              `Card generation exceeded token limit and auto-repair failed. Try using a simpler layout or shorter content.`
            );
          }
        } else {
          // For other errors, provide helpful error message
          throw new Error(
            `Card generation incomplete (${finishReason || 'interrupted'}). ${e.message}. Please try again.`
          );
        }
      }
    }

    // Log AI usage to database (non-critical - don't fail card generation if this fails)
    if (usageData) {
      try {
        await this.aiUsageService.logUsage({
          userId: user.id,
          modelName: this.MODEL_NAME,
          inputTokens: usageData.promptTokens || 0,
          outputTokens: usageData.completionTokens || 0,
          type: 'cards',
          docId: docId,
        });
        
        this.logger.log(`💾 [Card ${cardNumber}] AI usage logged successfully`);
      } catch (usageError: any) {
        // Don't throw - this is non-critical logging
        this.logger.error(
          `❌ [Card ${cardNumber}] Failed to log AI usage (non-critical): ${usageError.message}`,
        );
        // Continue with card generation even if usage logging fails
      }
    } else {
      this.logger.warn(`⚠️ [Card ${cardNumber}] No usage data available to log`);
    }

    // Yield final card data (not as JSON string, but as the actual object)
    // This is the return value that the caller will use
    if (cardData) {
      yield cardData;
    }
  }


  /**
   * Save a card to the database (update existing card if cardId provided, otherwise create new)
   */
  private async saveCard(docId: string, cardId: string | undefined, cardData: any) {
    if (cardId) {
      // Update existing card
      return await this.prisma.card.update({
        where: { id: cardId },
        data: {
          data: cardData,
        },
      });
    } else {
      // Create new card
      const existingCards = await this.prisma.card.findMany({
        where: {
          docId,
          deletedAt: null,
        },
        orderBy: { order: 'asc' },
      });

      const cardOrder = existingCards.length;

      return await this.prisma.card.create({
        data: {
          docId,
          data: cardData,
          order: cardOrder,
        },
      });
    }
  }
}

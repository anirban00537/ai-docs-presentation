import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AiUsageService } from '../../subscription/services/ai-usage.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { sanitizeErrorForFrontend } from 'src/shared/helpers/functions';
import { parse as parsePartialJson } from 'partial-json';

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
  private openai: any = null;
  private OpenAI: any = null;
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
      // Dynamic import for ESM-only or regular package
      const { OpenAI } = await import('openai');
      this.OpenAI = OpenAI;
      
      this.openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey,
        defaultHeaders: {
          "HTTP-Referer": "https://butterfast.app", // Optional, for including your app on openrouter.ai rankings.
          "X-Title": "Butterfast", // Optional. Shows in rankings on openrouter.ai.
        }
      });
      
      this.logger.log('OpenAI SDK initialized with OpenRouter base URL');
    } catch (error) {
      this.logger.error('Failed to initialize OpenAI SDK:', error);
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
    if (!this.openai) {
      throw new Error('OpenAI service is not initialized');
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
   * Generate a single card from an outline item (with retry support)
   */
  private async *generateSingleCard(
    outlineItem: OutlineItem,
    cardNumber: number,
    totalCards: number,
    title: string,
    docId: string,
    cardId: string | undefined,
    user: User,
    retryAttempt: number = 0,
  ): AsyncGenerator<string, void, unknown> {
    const schemaId = outlineItem.schemaId || outlineItem.layoutId;
    const cardStartTime = Date.now();
    const estimatedSeconds = 10;
    const MAX_RETRIES = 1; // Retry once on parse failure

    this.logger.log(
      `▶ [Card ${cardNumber}/${totalCards}] Starting generation...${retryAttempt > 0 ? ` (Retry ${retryAttempt})` : ''}`,
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
          cardData = chunk;
        } else if (typeof chunk === 'string') {
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

      yield JSON.stringify({
        type: 'card',
        cardNumber,
        cardId: savedCard.id,
        data: cardData,
        duration: cardDuration,
      });
    } catch (error: any) {
      // Check if this is a JSON parse error and we haven't exhausted retries
      const isParseError = error.message?.includes('JSON') || 
                           error.message?.includes('parse') ||
                           error.message?.includes('Unterminated');
      
      if (isParseError && retryAttempt < MAX_RETRIES) {
        this.logger.warn(
          `⚠️ [Card ${cardNumber}] JSON parse failed, retrying... (attempt ${retryAttempt + 1}/${MAX_RETRIES + 1})`,
        );
        
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retry generation
        yield* this.generateSingleCard(
          outlineItem,
          cardNumber,
          totalCards,
          title,
          docId,
          cardId,
          user,
          retryAttempt + 1,
        );
        return;
      }
      
      this.logger.error(
        `❌ [Card ${cardNumber}] FAILED during generation:`,
        error,
      );
      yield JSON.stringify({
        type: 'card-error',
        cardNumber,
        message: sanitizeErrorForFrontend(error),
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

    let stream;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        stream = await this.openai.chat.completions.create({
          model: this.MODEL_NAME,
          messages: [
            {
              role: 'user',
              content: cardPrompt,
            },
          ],
          temperature: 0,
          seed: 42,
          top_p: 1,
          presence_penalty: 0,
          frequency_penalty: 0,
          max_completion_tokens: 4096, // Prevents truncation variance
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'card_structure',
              strict: true,
              schema: cardSchema,
            },
          },
          stream: true,
          stream_options: {
            include_usage: true, 
          },
          // OpenRouter specific: Disable prompt transformations for 100% consistency
          extra_body: {
            transforms: [],
          } as any,
        });
        break;
      } catch (error: any) {
        attempts++;
        this.logger.warn(`⚠️ [Card ${cardNumber}] Generation attempt ${attempts} failed: ${error.message}`);
        
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

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
      
      // Capture usage data from the final chunk (OpenAI standard)
      if (chunk.usage) {
        usageData = chunk.usage;
        this.logger.log(`📊 [Card ${cardNumber}] Token usage - Prompt: ${usageData.prompt_tokens}, Completion: ${usageData.completion_tokens}, Total: ${usageData.total_tokens}`);
      }
      
      if (chunk.choices[0]?.finish_reason === 'stop') {
        break;
      }
    }

    // Final parse with multi-layered fallbacks
    if (!cardData) {
      if (!accumulatedContent) {
        throw new Error(
          `AI returned empty response. Finish Reason: ${finishReason || 'unknown'}`
        );
      }

      cardData = this.parseJsonWithFallbacks(accumulatedContent, cardNumber, finishReason);
    }

    // Log AI usage to database (non-critical - don't fail card generation if this fails)
    if (usageData) {
      try {
        await this.aiUsageService.logUsage({
          userId: user.id,
          modelName: this.MODEL_NAME,
          inputTokens: usageData.prompt_tokens || 0,
          outputTokens: usageData.completion_tokens || 0,
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
   * Multi-layered JSON parsing with fallbacks
   * 1. Try JSON.parse()
   * 2. If fails, try JSON repair (close unterminated strings/brackets/braces)
   * 3. If fails, try parsePartialJson() library
   * 4. If all fail, throw error
   */
  private parseJsonWithFallbacks(
    content: string,
    cardNumber: number,
    finishReason: string | null,
  ): any {
    const trimmed = content.trim();
    
    // Step 1: Try standard JSON.parse
    try {
      return JSON.parse(trimmed);
    } catch (e1: any) {
      this.logger.warn(
        `⚠️ [Card ${cardNumber}] JSON.parse failed: ${e1.message}. Attempting repair...`,
      );
      
      // Step 2: Try JSON repair
      try {
        let repaired = trimmed;
        
        // Count open/close braces and brackets
        const openBraces = (repaired.match(/{/g) || []).length;
        const closeBraces = (repaired.match(/}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/\]/g) || []).length;
        
        // Close any unterminated strings
        const quoteCount = (repaired.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) {
          repaired += '"';
          this.logger.debug(`[Card ${cardNumber}] Added closing quote`);
        }
        
        // Close arrays first (inner to outer)
        const missingBrackets = openBrackets - closeBrackets;
        if (missingBrackets > 0) {
          repaired += ']'.repeat(missingBrackets);
          this.logger.debug(`[Card ${cardNumber}] Added ${missingBrackets} closing brackets`);
        }
        
        // Close objects (inner to outer)
        const missingBraces = openBraces - closeBraces;
        if (missingBraces > 0) {
          repaired += '}'.repeat(missingBraces);
          this.logger.debug(`[Card ${cardNumber}] Added ${missingBraces} closing braces`);
        }
        
        const result = JSON.parse(repaired);
        this.logger.log(`✅ [Card ${cardNumber}] JSON repair successful`);
        return result;
      } catch (e2: any) {
        this.logger.warn(
          `⚠️ [Card ${cardNumber}] JSON repair failed: ${e2.message}. Trying partial-json...`,
        );
        
        // Step 3: Try parsePartialJson library
        try {
          const result = parsePartialJson(trimmed);
          if (result && typeof result === 'object') {
            this.logger.log(`✅ [Card ${cardNumber}] parsePartialJson successful`);
            return result;
          }
          throw new Error('parsePartialJson returned invalid result');
        } catch (e3: any) {
          this.logger.error(
            `❌ [Card ${cardNumber}] All JSON parse methods failed. Finish Reason: ${finishReason}`,
          );
          this.logger.debug(`Failed Content (first 200 chars): ${trimmed.slice(0, 200)}`);
          this.logger.debug(`Failed Content (last 200 chars): ${trimmed.slice(-200)}`);
          
          // All attempts failed - throw error (will be sanitized at card-error level)
          throw new Error(
            'Card content generation failed'
          );
        }
      }
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

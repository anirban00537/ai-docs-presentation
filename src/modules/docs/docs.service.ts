import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {
  successResponse,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  sanitizeErrorForFrontend,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { CreateDocDto } from './dto/create-doc.dto';
import { UpdateDocDto } from './dto/update-doc.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CreateFromPromptDto } from './dto/create-from-prompt.dto';
import { Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PptxExportService } from './export/pptx-export.service';
import { PdfExportService } from './export/pdf-export.service';
import { PngExportService } from './export/png-export.service';
import { ConfigService } from '@nestjs/config';
import { CreditService } from '../subscription/services/credit.service';
import { AiUsageService } from '../subscription/services/ai-usage.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { PromptBuilderService } from './prompt-docs-ai/prompts/prompt-builder.service';

interface OutlineItem {
  content: string;
  layoutId?: string;
  schemaId?: string;
}

interface OutlineResponse {
  title: string;
  outlines: OutlineItem[];
}

@Injectable()
export class DocsService implements OnModuleInit {
  private readonly logger = new Logger(DocsService.name);
  private readonly generatingOutlines = new Set<string>();
  private openai: any = null;
  private OpenAI: any = null;
  private readonly MODEL_NAME = coreConstant.AI_MODELS.OUTLINE.NAME;
  constructor(
    private readonly prisma: PrismaService,
    private readonly pptxExportService: PptxExportService,
    private readonly pdfExportService: PdfExportService,
    private readonly pngExportService: PngExportService,
    private readonly configService: ConfigService,
    private readonly creditService: CreditService,
    private readonly aiUsageService: AiUsageService,
    private readonly subscriptionService: SubscriptionService,
    private readonly promptBuilderService: PromptBuilderService,
  ) {}

  async onModuleInit() {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      this.logger.error(
        'OPENROUTER_API_KEY is not set in environment variables.',
      );
      return;
    }

    try {
      // Dynamic import for ESM-only or regular package
      const { OpenAI } = await import('openai');
      this.OpenAI = OpenAI;

      this.openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
        defaultHeaders: {
          'HTTP-Referer': 'https://butterfast.app',
          'X-Title': 'Butterfast',
        },
      });

      this.logger.log(
        'OpenAI SDK initialized (DocsService) with OpenRouter base URL',
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize OpenAI SDK in DocsService:',
        error,
      );
    }
  }

  async create(user: User, payload: CreateDocDto): Promise<ResponseModel> {
    try {
      const doc = await this.prisma.doc.create({
        data: {
          ...payload,
          userId: user.id,
          ownerId: user.id,
        },
        include: {
          cards: {
            orderBy: { order: 'asc' },
          },
        },
      });

      this.logger.log(
        `CREATE: Doc "${doc.title}" (${doc.id}) for user ${user.id}`,
      );
      return successResponse('Doc created successfully', doc);
    } catch (error) {
      processException(error);
    }
  }

  async findAll(user: User, query: any): Promise<ResponseModel> {
    try {
      const paginate = await paginatioOptions(query);

      const docs = await this.prisma.doc.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
        },
        ...paginate,
        include: {
          cards: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            take: 1,
          },
          _count: {
            select: {
              cards: {
                where: { deletedAt: null },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      const total = await this.prisma.doc.count({
        where: {
          userId: user.id,
          deletedAt: null,
        },
      });

      const paginationMeta = await paginationMetaData('doc', query, total);

      const data = {
        list: docs,
        meta: paginationMeta,
      };

      return successResponse('Docs retrieved successfully', data);
    } catch (error) {
      processException(error);
    }
  }

  async findOne(id: string, user: User | null): Promise<ResponseModel> {
    try {
      let doc = null;
      let isOwner = false;

      // If user is authenticated, try to find as owner first
      if (user?.id) {
        doc = await this.prisma.doc.findFirst({
          where: {
            id,
            userId: user.id,
            deletedAt: null,
          },
          include: {
            cards: {
              where: { deletedAt: null },
              orderBy: { order: 'asc' },
            },
          },
        });
        
        if (doc) {
          isOwner = true;
        }
      }

      // If not found (either user is not authenticated, or not the owner),
      // check if it's publicly shared
      if (!doc) {
        doc = await this.prisma.doc.findFirst({
          where: {
            id,
            shareEnabled: true,
            deletedAt: null,
          },
          include: {
            cards: {
              where: { deletedAt: null },
              orderBy: { order: 'asc' },
            },
          },
        });
      }

      if (!doc) {
        return errorResponse('Doc not found');
      }

      // Return doc with isOwner flag so frontend can determine edit permissions
      return successResponse('Doc retrieved successfully', {
        ...doc,
        isOwner,
      });
    } catch (error) {
      processException(error);
    }
  }

  async update(
    id: string,
    user: User,
    payload: UpdateDocDto,
  ): Promise<ResponseModel> {
    try {
      const { outlines, ...docPayload } = payload;

      const doc = await this.prisma.doc.findFirst({
        where: {
          id,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!doc) {
        return errorResponse('Doc not found');
      }

      // 1. Update the document fields
      const updatedDoc = await this.prisma.doc.update({
        where: { id },
        data: {
          ...docPayload,
          version: doc.version + 1,
        },
        include: {
          cards: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
          },
        },
      });

      // 2. If outlines are provided, update the corresponding cards
      if (outlines && Array.isArray(outlines) && outlines.length > 0) {
        // We use the cards returned from updatedDoc to ensure we have the latest state
        const cards = updatedDoc.cards || [];
        
        const updatePromises = outlines
          .map((outlineItem, index) => {
            // Only update if we have a corresponding card
            if (index < cards.length) {
              const card = cards[index];
              const currentOutline = (card.outline as any) || {};
              
              // Merge content updates
              const newOutline = {
                ...currentOutline,
                content: outlineItem.content || currentOutline.content,
              };

              return this.prisma.card.update({
                where: { id: card.id },
                data: { outline: newOutline },
              });
            }
            return null;
          })
          .filter(Boolean); // Remove nulls

        if (updatePromises.length > 0) {
          await this.prisma.$transaction(updatePromises as any[]);
          this.logger.log(`UPDATED OUTLINES: for doc ${id}, count: ${updatePromises.length}`);
        }
      }

      // Return the updated doc (fetching fresh if we updated cards)
      if (outlines && Array.isArray(outlines) && outlines.length > 0) {
         return this.findOne(id, user); 
      }

      return successResponse('Doc updated successfully', updatedDoc);
    } catch (error) {
      processException(error);
    }
  }

  async updateTitle(
    id: string,
    user: User,
    payload: { title: string },
  ): Promise<ResponseModel> {
    try {
      const doc = await this.prisma.doc.findFirst({
        where: {
          id,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!doc) {
        return errorResponse('Doc not found');
      }

      const updatedDoc = await this.prisma.doc.update({
        where: { id },
        data: {
          title: payload.title,
          version: doc.version + 1,
        },
      });

      this.logger.log(`UPDATE TITLE: Doc ${id} -> "${payload.title}"`);
      return successResponse('Doc title updated successfully', updatedDoc);
    } catch (error) {
      processException(error);
    }
  }

  async remove(id: string, user: User): Promise<ResponseModel> {
    try {
      const doc = await this.prisma.doc.findFirst({
        where: {
          id,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!doc) {
        return errorResponse('Doc not found');
      }

      await this.prisma.doc.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return successResponse('Doc deleted successfully');
    } catch (error) {
      processException(error);
    }
  }

  async addCard(
    docId: string,
    user: User,
    payload: CreateCardDto,
  ): Promise<ResponseModel> {
    try {
      const doc = await this.prisma.doc.findFirst({
        where: {
          id: docId,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!doc) {
        return errorResponse('Doc not found');
      }

      // Use a transaction to ensure atomicity and prevent race conditions
      const result = await this.prisma.$transaction(async (tx) => {
        // Get all existing cards to determine the correct order
        // This query is within a transaction, so it will see a consistent state
        const existingCardsInTx = await tx.card.findMany({
          where: {
            docId,
            deletedAt: null,
          },
          orderBy: { order: 'asc' },
        });

        const cardCount = existingCardsInTx.length;
        // Find the maximum order value to ensure new cards are added at the end
        const maxOrder =
          existingCardsInTx.length > 0
            ? Math.max(...existingCardsInTx.map((c) => c.order))
            : -1;

        // If no order is provided, add at the end (maxOrder + 1)
        // Otherwise, use the provided order (for inserting at specific positions)
        let targetOrder =
          payload.order === undefined || payload.order === null
            ? maxOrder + 1
            : payload.order;

        // Ensure targetOrder is within valid range
        if (targetOrder < 0) {
          targetOrder = 0;
        }
        // If order is > maxOrder, it means add at the end (no shifting needed)
        if (targetOrder > maxOrder) {
          targetOrder = maxOrder + 1;
        }

        // Validate and adjust order if there's a conflict
        // If the target order already exists, shift all cards with order >= targetOrder
        const conflictingCards = existingCardsInTx.filter(
          (c) => c.order === targetOrder,
        );

        if (conflictingCards.length > 0) {
          // Shift all cards with order >= targetOrder by 1
          // Process in reverse order (highest first) to avoid temporary conflicts
          const cardsToShift = existingCardsInTx
            .filter((c) => c.order >= targetOrder)
            .sort((a, b) => b.order - a.order); // Sort descending

          for (const cardToShift of cardsToShift) {
            await tx.card.update({
              where: { id: cardToShift.id },
              data: { order: cardToShift.order + 1 },
            });
          }
        }

        // Create the new card with the target order
        const card = await tx.card.create({
          data: {
            docId,
            data: payload.data || {},
            order: targetOrder,
            outline: payload.outline || null,
          },
        });

        this.logger.log(
          `ADD CARD: Added card to doc ${docId} at order ${targetOrder}`,
        );
        return card;
      });

      return successResponse('Card added successfully', result);
    } catch (error) {
      processException(error);
    }
  }

  async updateCard(
    cardId: string,
    user: User,
    payload: UpdateCardDto,
  ): Promise<ResponseModel> {
    try {
      const card = await this.prisma.card.findFirst({
        where: {
          id: cardId,
          deletedAt: null,
        },
        include: {
          doc: true,
        },
      });

      if (!card) {
        return errorResponse('Card not found');
      }

      if (card.doc.userId !== user.id) {
        return errorResponse('Unauthorized to update this card');
      }

      const updatedCard = await this.prisma.card.update({
        where: { id: cardId },
        data: {
          ...(payload.data !== undefined && { data: payload.data }),
          ...(payload.order !== undefined && { order: payload.order }),
          ...(payload.outline !== undefined && { outline: payload.outline }),
        },
      });

      return successResponse('Card updated successfully', updatedCard);
    } catch (error) {
      processException(error);
    }
  }

  async removeCard(cardId: string, user: User): Promise<ResponseModel> {
    try {
      const card = await this.prisma.card.findFirst({
        where: {
          id: cardId,
          deletedAt: null,
        },
        include: {
          doc: true,
        },
      });

      if (!card) {
        return errorResponse('Card not found');
      }

      if (card.doc.userId !== user.id) {
        return errorResponse('Unauthorized to delete this card');
      }

      await this.prisma.card.update({
        where: { id: cardId },
        data: {
          deletedAt: new Date(),
        },
      });

      return successResponse('Card deleted successfully');
    } catch (error) {
      processException(error);
    }
  }

  async reorderCards(
    docId: string,
    user: User,
    cardOrders: { cardId: string; order: number }[],
  ): Promise<ResponseModel> {
    try {
      const doc = await this.prisma.doc.findFirst({
        where: {
          id: docId,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!doc) {
        return errorResponse('Doc not found');
      }

      await this.prisma.$transaction(
        cardOrders.map(({ cardId, order }) =>
          this.prisma.card.update({
            where: { id: cardId },
            data: { order },
          }),
        ),
      );

      return successResponse('Cards reordered successfully');
    } catch (error) {
      processException(error);
    }
  }

  async generateShareToken(docId: string, user: User): Promise<ResponseModel> {
    try {
      const doc = await this.prisma.doc.findFirst({
        where: {
          id: docId,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!doc) {
        return errorResponse('Doc not found');
      }

      const updatedDoc = await this.prisma.doc.update({
        where: { id: docId },
        data: {
          shareEnabled: true,
        },
      });

      this.logger.log(`SHARE ENABLED: Doc ${docId}`);
      return successResponse('Sharing enabled successfully', {
        shareEnabled: updatedDoc.shareEnabled,
      });
    } catch (error) {
      processException(error);
    }
  }

  async toggleShare(
    docId: string,
    user: User,
    enabled: boolean,
  ): Promise<ResponseModel> {
    try {
      const doc = await this.prisma.doc.findFirst({
        where: {
          id: docId,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!doc) {
        return errorResponse('Doc not found');
      }

      const updatedDoc = await this.prisma.doc.update({
        where: { id: docId },
        data: {
          shareEnabled: enabled,
        },
      });

      this.logger.log(
        `SHARE ${enabled ? 'ENABLED' : 'DISABLED'}: Doc ${docId}`,
      );
      return successResponse(
        `Sharing ${enabled ? 'enabled' : 'disabled'} successfully`,
        {
          shareEnabled: updatedDoc.shareEnabled,
        },
      );
    } catch (error) {
      processException(error);
    }
  }

  async getShareInfo(docId: string, user: User): Promise<ResponseModel> {
    try {
      const doc = await this.prisma.doc.findFirst({
        where: {
          id: docId,
          userId: user.id,
          deletedAt: null,
        },
        select: {
          shareEnabled: true,
        },
      });

      if (!doc) {
        return errorResponse('Doc not found');
      }

      return successResponse('Share info retrieved successfully', {
        shareEnabled: doc.shareEnabled,
      });
    } catch (error) {
      processException(error);
    }
  }

  async exportToPptx(id: string, user: User): Promise<Buffer> {
    try {
      // Verify user owns the doc
      const doc = await this.prisma.doc.findFirst({
        where: {
          id,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!doc) {
        throw new Error('Doc not found');
      }

      // Export to PPTX
      return await this.pptxExportService.exportDoc(id, user.id);
    } catch (error) {
      this.logger.error(`Failed to export doc ${id} to PPTX`, error);
      throw error;
    }
  }

  async exportToPdf(id: string, user: User): Promise<Buffer> {
    try {
      // Verify user owns the doc
      const doc = await this.prisma.doc.findFirst({
        where: {
          id,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!doc) {
        throw new Error('Doc not found');
      }

      // Export to PDF
      return await this.pdfExportService.exportDoc(id, user.id);
    } catch (error) {
      this.logger.error(`Failed to export doc ${id} to PDF`, error);
      throw error;
    }
  }

  async exportToPng(id: string, user: User): Promise<Buffer> {
    try {
      // Verify user owns the doc
      const doc = await this.prisma.doc.findFirst({
        where: {
          id,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!doc) {
        throw new Error('Doc not found');
      }

      // Export to PNG (ZIP of images)
      return await this.pngExportService.exportDoc(id, user.id);
    } catch (error) {
      this.logger.error(`Failed to export doc ${id} to PNG`, error);
      throw error;
    }
  }
  /**
   * Get card data for export (used by Puppeteer screenshot service)
   * Validates export key and returns card with theme data
   */
  async getCardForExport(
    docId: string,
    cardId: string,
    exportKey: string,
  ): Promise<ResponseModel> {
    try {
      // Validate export key - it should match a hash of the doc ID
      // This provides basic security without requiring full authentication
      const expectedKey = this.generateExportKey(docId);

      if (exportKey !== expectedKey) {
        return errorResponse('Invalid export key');
      }

      // Fetch doc with the specific card
      const doc = await this.prisma.doc.findFirst({
        where: {
          id: docId,
          deletedAt: null,
        },
        include: {
          cards: {
            where: {
              id: cardId,
              deletedAt: null,
            },
          },
        },
      });

      if (!doc) {
        return errorResponse('Doc not found');
      }

      if (!doc.cards || doc.cards.length === 0) {
        return errorResponse('Card not found');
      }

      const card = doc.cards[0];
      const theme = doc.globalTheme || {};

      return successResponse('Card data retrieved successfully', {
        card,
        theme,
      });
    } catch (error) {
      processException(error);
    }
  }

  /**
   * Generate a secure export key for a doc
   * Used to validate export requests without requiring full authentication
   */
  generateExportKey(docId: string): string {
    // Use a hash of docId + a secret to create the export key
    const secret = process.env.EXPORT_SECRET || 'butterfast-export-secret-key';
    return crypto
      .createHash('sha256')
      .update(`${docId}:${secret}`)
      .digest('hex')
      .substring(0, 32);
  }

  /**
   * Save prompt and create doc with outline data (merged from OutlineService.savePrompt)
   */
  async savePrompt(
    user: User,
    payload: CreateFromPromptDto,
  ): Promise<ResponseModel> {
    try {
      // Check slide generation limit for AI outline generation
      const slideLimit = await this.subscriptionService.getSlideLimit(user.id);
      if (payload.numberOfCards > slideLimit) {
        this.logger.warn(
          `User ${user.id} attempted to generate ${payload.numberOfCards} cards, but limit is ${slideLimit}`,
        );
        return {
          success: false,
          message: `Your plan allows up to ${slideLimit} slides per document for AI generation. Please upgrade your subscription to generate more slides.`,
          data: null,
        };
      }

      // Check if user has enough credits before creating doc
      // Outline generation requires 5 credits + cards require 2 credits each
      const estimatedTotalCredits = 5 + payload.numberOfCards * 2;

      const hasCredits = await this.creditService.hasEnoughCredits(
        user.id,
        estimatedTotalCredits,
      );
      if (!hasCredits) {
        this.logger.warn(
          `User ${user.id} attempted to create doc without sufficient credits (required: ${estimatedTotalCredits})`,
        );
        return {
          success: false,
          message: `Insufficient credits. You need at least ${estimatedTotalCredits} credits to generate a ${payload.numberOfCards}-card doc. Please upgrade your subscription or purchase more credits.`,
          data: null,
        };
      }

      // Create doc with outline data
      const doc = await this.prisma.doc.create({
        data: {
          userId: user.id,
          ownerId: user.id,
          title: 'Untitled Doc',
          prompt: payload.prompt,
          numberOfCards: payload.numberOfCards,
          outlineStatus: 'generating',
        },
      });

      return successResponse('Doc created successfully', {
        id: doc.id,
      });
    } catch (error: any) {
      this.logger.error('Error in savePrompt:', error);
      return processException(error);
    }
  }

  /**
   * Generate outline stream for a doc (merged from OutlineService.generateOutlineStream)
   */
  async *generateOutlineStream(
    docId: string,
    user: User,
  ): AsyncGenerator<string, void, unknown> {
    if (this.generatingOutlines.has(docId)) {
      throw new Error('Outline generation already in progress for this doc');
    }

    // 1. Fetch doc and prompt
    const doc = await this.prisma.doc.findUnique({
      where: { id: docId, userId: user.id },
      select: {
        id: true,
        title: true,
        prompt: true,
        numberOfCards: true,
        cards: { select: { id: true } },
      },
    });

    if (!doc) throw new Error('Doc not found');

    // For better DX, we might need to store the initial prompt in the Doc if not already
    // Assuming the doc title is the prompt for now if prompt field isn't there,
    // OR we pass prompt in. But this method signature is fixed.
    // Let's assume the frontend passes the prompt in the doc.title or a specific field.
    // For now, using title as prompt if no specific prompt field exists.
    const userPrompt = (doc as any).prompt || doc.title;
    const numberOfCards = (doc as any).numberOfCards || 8;

    let creditDeducted = false;

    try {
      // Deduct 5 credits for outline generation
      await this.creditService.useCredits(
        user.id,
        5,
        `Outline generation for doc`,
        docId,
      );
      creditDeducted = true;
      this.logger.log(`💳 [Doc ${docId}] 5 credits deducted for outline generation`);

      await this.prisma.doc.update({
        where: { id: docId },
        data: { outlineStatus: 'generating' },
      });

      yield JSON.stringify({ type: 'start', message: 'Generating outline...' });

      // Fetch all layouts from the database
      const allLayouts = await this.prisma.layout.findMany({
        where: {
          isAdmin: true,
          published: true,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
      });

      if (allLayouts.length === 0) {
        throw new Error('No layouts available.');
      }

      const layoutsInfo = allLayouts.map((layout) => ({
        id: layout.id,
        name: layout.name,
        description: layout.description,
      }));

      // Build Prompt
      const systemPrompt = this.promptBuilderService.buildOutlinePrompt(
        userPrompt,
        numberOfCards,
        layoutsInfo,
      );

      // Get Schema
      const { DynamicSchemaUtil } = await import(
        './prompt-docs-ai/utils/dynamic-schema.util'
      );
      const outlineSchema = DynamicSchemaUtil.generateOutlineSchema();

      this.logger.log(`🤖 [Doc ${docId}] Calling LLM for streaming content...`);

      // Call OpenAI
      const stream = await this.openai.chat.completions.create({
        model: this.MODEL_NAME,
        messages: [{ role: 'user', content: systemPrompt }],
        temperature: 0,
        seed: 42,
        top_p: 1,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'outline_structure',
            strict: true,
            schema: outlineSchema,
          },
        },
        stream: true,
        stream_options: {
          include_usage: true,
        },
      });
      let accumulatedContent = '';
      let finishReason = null;
      let usageData: any = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        finishReason = chunk.choices[0]?.finish_reason || finishReason;

        if (delta) {
          accumulatedContent += delta;
          yield JSON.stringify({
            type: 'chunk',
            delta,
            accumulated: accumulatedContent,
          });
        }

        if (chunk.usage) {
          usageData = chunk.usage;
          this.logger.log(
            `📊 [Doc ${docId}] Token usage - Prompt: ${usageData.prompt_tokens}, Completion: ${usageData.completion_tokens}, Total: ${usageData.total_tokens}`,
          );
        }
      }

      this.logger.log(
        `🏁 [Doc ${docId}] Stream finished. Reason: ${finishReason}`,
      );

      if (!accumulatedContent) {
        throw new Error(
          `AI returned empty response. Finish reason: ${finishReason}`,
        );
      }

      if (finishReason === 'length') {
        this.logger.warn(
          `⚠️ [Doc ${docId}] Output truncated due to length limit. Formatting may be incomplete.`,
        );
      }

      this.logger.log(`🧪 [Doc ${docId}] Parsing final AI response...`);
      let outlineData: OutlineResponse;
      try {
        outlineData = JSON.parse(accumulatedContent);
      } catch (e: any) {
        this.logger.error(`❌ [Doc ${docId}] JSON Parse Error: ${e.message}`);
        try {
          const repaired = accumulatedContent + ']}';
          outlineData = JSON.parse(repaired);
        } catch (repairError) {
          throw new Error(`Failed to parse AI response: ${e.message}`);
        }
      }

      // Transaction to safely clear old cards and create new ones
      await this.prisma.$transaction(async (tx) => {
        // 1. Delete all existing cards for this doc (Clearing old outline/data)
        await tx.card.deleteMany({
          where: { docId },
        });

        // 2. Update doc metadata
        await tx.doc.update({
          where: { id: docId },
          data: {
            title: outlineData.title,
            outlineStatus: 'completed',
          },
        });

        // 3. Create fresh cards from the new outline
        const cardsWithOutlines = outlineData.outlines.map((item, index) => ({
          docId,
          data: {},
          order: index,
          outline: {
            content: item.content,
            layoutId: item.layoutId,
            schemaId: item.layoutId,
          },
        }));

        await tx.card.createMany({
          data: cardsWithOutlines,
        });
      });

      // Log AI usage
      if (usageData) {
        try {
          await this.aiUsageService.logUsage({
            userId: user.id,
            modelName: this.MODEL_NAME,
            inputTokens: usageData.prompt_tokens || 0,
            outputTokens: usageData.completion_tokens || 0,
            type: 'doc',
            docId: docId,
          });
          this.logger.log(`💾 [Doc ${docId}] AI usage logged successfully`);
        } catch (usageError) {
          this.logger.error(
            `❌ [Doc ${docId}] Failed to log AI usage:`,
            usageError,
          );
        }
      }

      yield JSON.stringify({
        type: 'complete',
        data: {
          title: outlineData.title,
          outlines: outlineData.outlines,
        },
      });
    } catch (error: any) {
      this.logger.error(`❌ [Doc ${docId}] GENERATION ERROR:`, error);
      await this.prisma.doc.update({
        where: { id: docId },
        data: { outlineStatus: 'failed' },
      });

      if (creditDeducted) {
        try {
          await this.creditService.refundCredits(
            user.id,
            5,
            `Refund: Outline generation failed for doc ${docId}`,
            docId,
          );
          this.logger.log(
            `💳 [Doc ${docId}] 5 credits refunded due to generation failure`,
          );
        } catch (refundError) {
          this.logger.error(
            `❌ [Doc ${docId}] Failed to refund credit:`,
            refundError,
          );
        }
      }

      yield JSON.stringify({
        type: 'error',
        message: sanitizeErrorForFrontend(error),
      });
    } finally {
      this.generatingOutlines.delete(docId);
    }
  }
}

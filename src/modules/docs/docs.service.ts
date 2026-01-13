import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {
  successResponse,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
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
import { coreConstant } from 'src/shared/helpers/coreConstant';

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
  private openRouter: any = null;
  private readonly MODEL_NAME = coreConstant.AI_MODELS.OUTLINE.NAME;
  constructor(
    private readonly prisma: PrismaService,
    private readonly pptxExportService: PptxExportService,
    private readonly pdfExportService: PdfExportService,
    private readonly pngExportService: PngExportService,
    private readonly configService: ConfigService,
    private readonly creditService: CreditService,
    private readonly aiUsageService: AiUsageService,
  ) {}

  async onModuleInit() {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      this.logger.error('OPENROUTER_API_KEY is not set in environment variables.');
      return;
    }

    try {
      const { OpenRouter } = await import('@openrouter/sdk');
      this.openRouter = new OpenRouter({ apiKey });
      this.logger.log('OpenRouter SDK initialized');
    } catch (error) {
      this.logger.error('Failed to initialize OpenRouter SDK:', error);
    }
  }

  async create(
    user: User,
    payload: CreateDocDto,
  ): Promise<ResponseModel> {
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

      const paginationMeta = await paginationMetaData(
        'doc',
        query,
        total,
      );

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

      return successResponse(
        'Doc retrieved successfully',
        doc,
      );
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
          ...payload,
          version: doc.version + 1,
        },
        include: {
          cards: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
          },
        },
      });

      return successResponse(
        'Doc updated successfully',
        updatedDoc,
      );
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
      return successResponse(
        'Doc title updated successfully',
        updatedDoc,
      );
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
        const existingCards = await tx.card.findMany({
          where: {
            docId,
            deletedAt: null,
          },
          orderBy: { order: 'asc' },
        });

        const cardCount = existingCards.length;
        // Find the maximum order value to ensure new cards are added at the end
        const maxOrder =
          existingCards.length > 0
            ? Math.max(...existingCards.map((c) => c.order))
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
        const conflictingCards = existingCards.filter(
          (c) => c.order === targetOrder,
        );

        if (conflictingCards.length > 0) {
          // Shift all cards with order >= targetOrder by 1
          // Process in reverse order (highest first) to avoid temporary conflicts
          const cardsToShift = existingCards
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

  async generateShareToken(
    docId: string,
    user: User,
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

  async getShareInfo(
    docId: string,
    user: User,
  ): Promise<ResponseModel> {
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
      // Check if user has enough credits before creating doc
      // Outline generation requires 1 credit + cards require 2 credits each
      const estimatedTotalCredits = 1 + payload.numberOfCards * 2;

      const hasCredits = await this.creditService.hasEnoughCredits(user.id, estimatedTotalCredits);
      if (!hasCredits) {
        this.logger.warn(`User ${user.id} attempted to create doc without sufficient credits (required: ${estimatedTotalCredits})`);
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
    const doc = await this.prisma.doc.findFirst({
      where: {
        id: docId,
        userId: user.id,
      },
    });

    if (!doc) {
      throw new Error('Doc not found');
    }

    if (this.generatingOutlines.has(docId)) {
      throw new Error('Outline is already being generated');
    }

    this.generatingOutlines.add(docId);
    this.logger.log(`🚀 STARTING OUTLINE STREAM GENERATION: Doc ID ${docId}`);

    let creditDeducted = false;

    try {
      if (!this.openRouter) {
        throw new Error('OpenRouter service is not initialized');
      }

      // UPFRONT DEDUCTION: Deduct credit before generation starts
      this.logger.log(`💳 [Doc ${docId}] Deducting 1 credit upfront...`);
      try {
        await this.creditService.useCredits(
          user.id,
          1,
          `Generating AI outline for doc ${doc.title || docId}`,
          docId,
        );
        creditDeducted = true;
        this.logger.log(`💳 [Doc ${docId}] Credit deducted successfully`);
      } catch (creditError: any) {
        throw new BadRequestException(creditError.message || 'Insufficient credits to generate doc outline.');
      }

      const userPrompt = doc.prompt || '';
      const numberOfCards = doc.numberOfCards || 1;

      // Update status to generating
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

      this.logger.log(`🤖 [Doc ${docId}] Calling LLM for streaming content...`);

      const stream = await this.openRouter.chat.send({
        model: this.MODEL_NAME,
        messages: [
          {
            role: 'user',
            content: `Analyze the following prompt and generate a comprehensive and highly descriptive doc outline with exactly ${numberOfCards} cards.
            
CRITICAL INSTRUCTION: You MUST generate EXACTLY ${numberOfCards} card items. Each item should be detailed, descriptive, and provide substantial information for the card builder to use.
If the content is long, split it across multiple cards.
If the content is short, expand on details to reach exactly ${numberOfCards} cards.

User Prompt:
${userPrompt}

Available Layouts (each layout has id, name, and description):
${JSON.stringify(layoutsInfo, null, 2)}

LAYOUT SELECTION PROCESS:
For each card, follow these steps:
1. Review all available layouts above, paying close attention to each layout's "name" and "description"
2. For the FIRST card only: Select an introduction/title/hero layout from the available layouts
3. For subsequent cards: Identify which layout's purpose best matches the content you're planning for that specific card
4. Attempt to vary layouts if multiple are available
5. Ensure the layoutId you choose exactly matches one of the "id" values from the available layouts list (case-sensitive)

IMPORTANT RULES:
- The title field MUST be a clear, professional title for the doc. Do not use "..." or "Generating...".
- The FIRST card MUST use an introduction/title/hero layout - this is mandatory
- Match the layout's description to the card's content purpose
- If you have multiple cards with similar content, use the most appropriate layout available even if you have to reuse one
- Focus on high-quality content that matches the card purpose

For each outline item, the "content" field MUST strictly follow this Markdown format:
1. One main title using a single hash (# Title)
2. Followed ONLY by bullet points (- Point 1)
3. No short descriptions, no intro text, no other paragraphs.
4. JUST Title and Points. Both are COMPULSORY.

Example of valid content:
"# Card Title
- First key point
- Second key point
- Third key point"

Generate exactly ${numberOfCards} outline items. Each item must have:
- A "content" field containing the STRICT markdown-formatted content as defined above
- A "layoutId" field with a UNIQUE id (case-sensitive) from the available layouts list that best matches this card's content type and purpose

REMINDER: Every single card must have a DIFFERENT layoutId. No exceptions.`,
          },
        ],
        responseFormat: {
          type: 'json_schema',
          jsonSchema: {
            name: 'doc_outline',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'The main title of the doc. Must be a complete, professional string, not empty or "..."',
                },
                outlines: {
                  type: 'array',
                  description: `Array of exactly ${numberOfCards} outline items, each representing one card`,
                  minItems: numberOfCards,
                  maxItems: numberOfCards,
                  items: {
                    type: 'object',
                    properties: {
                      content: {
                        type: 'string',
                        description:
                          'Strict Markdown: "# Title" followed ONLY by detailed and descriptive bullet points "- Point". Provide rich information for each card.',
                      },
                      layoutId: {
                        type: 'string',
                        description:
                          'The ID of the most appropriate layout from the available layouts list for this specific card. CRITICAL: Each card must have a UNIQUE layoutId - do not reuse the same layoutId for multiple cards. All layoutIds in the outlines array must be different from each other.',
                      },
                    },
                    required: ['content', 'layoutId'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['title', 'outlines'],
              additionalProperties: false,
            },
          },
        },
        stream: true,
        streamOptions: {
          includeUsage: true,
        },
        max_tokens: 16000,
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
          this.logger.log(`📊 [Doc ${docId}] Token usage - Prompt: ${usageData.promptTokens}, Completion: ${usageData.completionTokens}, Total: ${usageData.totalTokens}`);
        }
      }

      this.logger.log(`🏁 [Doc ${docId}] Stream finished. Reason: ${finishReason}`);

      if (!accumulatedContent) {
        throw new Error(`AI returned empty response. Finish reason: ${finishReason}`);
      }

      if (finishReason === 'length') {
        this.logger.warn(`⚠️ [Doc ${docId}] Output truncated due to length limit. Formatting may be incomplete.`);
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

      // Update doc with outline data
      await this.prisma.doc.update({
        where: { id: docId },
        data: {
          title: outlineData.title,
          outlineStatus: 'completed',
        },
      });

      // Create cards with outline data
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

      await this.prisma.card.createMany({
        data: cardsWithOutlines,
      });

      // Log AI usage
      if (usageData) {
        try {
          await this.aiUsageService.logUsage({
            userId: user.id,
            modelName: this.MODEL_NAME,
            inputTokens: usageData.promptTokens || 0,
            outputTokens: usageData.completionTokens || 0,
            type: 'doc',
            docId: docId,
          });
          this.logger.log(`💾 [Doc ${docId}] AI usage logged successfully`);
        } catch (usageError) {
          this.logger.error(`❌ [Doc ${docId}] Failed to log AI usage:`, usageError);
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
            1,
            `Refund: Outline generation failed for doc ${docId}`,
            docId,
          );
          this.logger.log(`💳 [Doc ${docId}] Credit refunded due to generation failure`);
        } catch (refundError) {
          this.logger.error(`❌ [Doc ${docId}] Failed to refund credit:`, refundError);
        }
      }
      
      yield JSON.stringify({ type: 'error', message: error.message });
    } finally {
      this.generatingOutlines.delete(docId);
    }
  }
}

import { Injectable, Logger, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {
  successResponse,
  processException,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { CreateOutlineDto, UpdateOutlineDto } from './dto/create-outline.dto';
import { CreateFromPromptDto } from './dto/create-from-prompt.dto';
import { ConfigService } from '@nestjs/config';
import { PresentationService } from './presentation.service';
import { CreditService } from '../subscription/services/credit.service';
import { AiUsageService } from '../subscription/services/ai-usage.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';

interface OutlineItem {
  content: string;
  layoutId?: string;
  schemaId?: string; // Keep for backward compatibility
}

interface OutlineResponse {
  title: string;
  outlines: OutlineItem[];
}

@Injectable()
export class OutlineService implements OnModuleInit {
  private readonly logger = new Logger(OutlineService.name);
  private readonly generatingOutlines = new Set<string>(); // Track outlines currently being generated
  private openRouter: any = null;
  private readonly MODEL_NAME = coreConstant.AI_MODELS.OUTLINE.NAME;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly presentationService: PresentationService,
    private readonly creditService: CreditService,
    private readonly aiUsageService: AiUsageService,
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

  async createOutline(
    user: User,
    payload: CreateOutlineDto,
  ): Promise<ResponseModel> {
    try {
      const outline = await this.prisma.outline.create({
        data: {
          userId: user.id,
          prompt: payload.prompt,
          numberOfSlides: payload.numberOfSlides,
          status: 'generating',
        },
      });

      return successResponse('Outline created successfully', {
        id: outline.id,
      });
    } catch (error: any) {
      this.logger.error('Error creating outline:', error);
      return processException(error);
    }
  }

  async getOutline(id: string, user: User): Promise<ResponseModel> {
    try {
      const outline = await this.prisma.outline.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!outline) {
        return processException(new Error('Outline not found'));
      }

      return successResponse('Outline fetched successfully', outline);
    } catch (error: any) {
      this.logger.error(`❌ Error in getOutline:`, error);
      return processException(error);
    }
  }

  async getOutlineByPresentationId(
    presentationId: string,
    user: User,
  ): Promise<any> {
    try {
      const outline = await this.prisma.outline.findFirst({
        where: {
          presentationId,
          userId: user.id,
        },
      });

      return outline;
    } catch (error: any) {
      this.logger.error('Error getting outline by presentation ID:', error);
      return null;
    }
  }

  async updateOutline(
    id: string,
    user: User,
    payload: UpdateOutlineDto,
  ): Promise<ResponseModel> {
    try {
      const outline = await this.prisma.outline.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!outline) {
        return processException(new Error('Outline not found'));
      }

      const updatedOutline = await this.prisma.outline.update({
        where: { id },
        data: {
          ...(payload.title && { title: payload.title }),
          ...(payload.prompt && { prompt: payload.prompt }),
          ...(payload.numberOfSlides && { numberOfSlides: payload.numberOfSlides }),
          ...(payload.outlines && { outlines: payload.outlines as any }),
          status: 'completed',
        },
      });

      return successResponse('Outline updated successfully', updatedOutline);
    } catch (error: any) {
      this.logger.error('Error updating outline:', error);
      return processException(error);
    }
  }

  async updateOutlineStatus(
    id: string,
    status: 'generating' | 'completed' | 'failed',
    data?: {
      title?: string;
      outlines?: Array<{
        content: string;
        schemaId?: string;
        layoutId?: string;
      }>;
    },
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
      };

      // Always update these fields if provided (even if they're empty strings or null)
      if (data?.title !== undefined) {
        updateData.title = data.title;
      }
      if (data?.outlines !== undefined) {
        updateData.outlines = data.outlines as any;
      }

      await this.prisma.outline.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(
        `Outline ${id} updated with status: ${status}${data?.outlines ? `, ${data.outlines.length} outline items` : ''}`,
      );
    } catch (error: any) {
      this.logger.error('Error updating outline status:', error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  async savePrompt(
    user: User,
    payload: CreateOutlineDto,
  ): Promise<ResponseModel> {
    try {
      // Check if user has enough credits before creating outline
      // Outline generation requires 1 credit + slides require 1 credit each
      const estimatedTotalCredits = 1 + payload.numberOfSlides; // 1 for outline + 1 per slide

      const hasCredits = await this.creditService.hasEnoughCredits(user.id, estimatedTotalCredits);
      if (!hasCredits) {
        this.logger.warn(`User ${user.id} attempted to create outline without sufficient credits (required: ${estimatedTotalCredits})`);
        return {
          success: false,
          message: `Insufficient credits. You need at least ${estimatedTotalCredits} credits to generate a ${payload.numberOfSlides}-slide presentation. Please upgrade your subscription or purchase more credits.`,
          data: null,
        };
      }

      // Use a transaction to ensure both outline and presentation are created and linked atomically
      const result = await this.prisma.$transaction(async (tx) => {
        // Create outline first
        const outline = await tx.outline.create({
          data: {
            userId: user.id,
            prompt: payload.prompt,
            numberOfSlides: payload.numberOfSlides,
            status: 'generating',
          },
        });

        // Create presentation
        const presentation = await tx.presentation.create({
          data: {
            userId: user.id,
            ownerId: user.id,
            title: 'Untitled Presentation',
          },
        });

        // Link outline to presentation
        const updatedOutline = await tx.outline.update({
          where: { id: outline.id },
          data: { presentationId: presentation.id },
        });

        return {
          id: updatedOutline.id,
          presentationId: updatedOutline.presentationId,
        };
      });

      // Return outline with presentationId included
      return successResponse('Outline and presentation created successfully', {
        id: result.id,
        presentationId: result.presentationId,
      });
    } catch (error: any) {
      this.logger.error('Error in savePrompt:', error);
      return processException(error);
    }
  }
  async *generateOutlineStream(
    id: string,
    user: User,
  ): AsyncGenerator<string, void, unknown> {
    const outline = await this.prisma.outline.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!outline) {
      throw new Error('Outline not found');
    }

    if (this.generatingOutlines.has(id)) {
      throw new Error('Outline is already being generated');
    }

    this.generatingOutlines.add(id);
    this.logger.log(`🚀 STARTING OUTLINE STREAM GENERATION: ID ${id}`);

    try {
      if (!this.openRouter) {
        throw new Error('OpenRouter service is not initialized');
      }

      this.logger.log(`💳 [Outline ${id}] Checking credits...`);
      const hasCredits = await this.creditService.hasEnoughCredits(user.id, 1);
      if (!hasCredits) {
        throw new BadRequestException('Insufficient credits to generate presentation outline.');
      }

      const userPrompt = outline.prompt;
      const numberOfSlides = outline.numberOfSlides;

      // Update status to generating
      await this.updateOutlineStatus(id, 'generating');

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

      this.logger.log(`🤖 [Outline ${id}] Calling LLM for streaming content...`);

      const stream = await this.openRouter.chat.send({
        model: this.MODEL_NAME,
        messages: [
          {
            role: 'user',
            content: `Analyze the following prompt and generate a comprehensive presentation outline with exactly ${numberOfSlides} slides.
            
CRITICAL INSTRUCTION: You MUST generate EXACTLY ${numberOfSlides} slide items. Do not generate fewer. Do not generate more.
If the content is long, split it across multiple slides.
If the content is short, expand on details to reach exactly ${numberOfSlides} slides.

User Prompt:
${userPrompt}

Available Layouts (each layout has id, name, and description):
${JSON.stringify(layoutsInfo, null, 2)}

LAYOUT SELECTION PROCESS:
For each slide, follow these steps:
1. Review all available layouts above, paying close attention to each layout's "name" and "description"
2. For the FIRST slide only: Select an introduction/title/hero layout from the available layouts
3. For subsequent slides: Identify which layout's purpose best matches the content you're planning for that specific slide
4. Attempt to vary layouts if multiple are available
5. Ensure the layoutId you choose exactly matches one of the "id" values from the available layouts list (case-sensitive)

IMPORTANT RULES:
- The title field MUST be a clear, professional title for the presentation. Do not use "..." or "Generating...".
- The FIRST slide MUST use an introduction/title/hero layout - this is mandatory
- Match the layout's description to the slide's content purpose
- If you have multiple slides with similar content, use the most appropriate layout available even if you have to reuse one
- Focus on high-quality content that matches the slide purpose

For each outline item, the "content" field MUST strictly follow this Markdown format:
1. One main title using a single hash (# Title)
2. Followed ONLY by bullet points (- Point 1)
3. No short descriptions, no intro text, no other paragraphs.
4. JUST Title and Points. Both are COMPULSORY.

Example of valid content:
"# Slide Title
- First key point
- Second key point
- Third key point"

Generate exactly ${numberOfSlides} outline items. Each item must have:
- A "content" field containing the STRICT markdown-formatted content as defined above
- A "layoutId" field with a UNIQUE id (case-sensitive) from the available layouts list that best matches this slide's content type and purpose

REMINDER: Every single slide must have a DIFFERENT layoutId. No exceptions.`,
          },
        ],
        responseFormat: {
          type: 'json_schema',
          jsonSchema: {
            name: 'presentation_outline',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'The main title of the presentation. Must be a complete, professional string, not empty or "..."',
                },
                outlines: {
                  type: 'array',
                  description: `Array of exactly ${numberOfSlides} outline items, each representing one slide`,
                  minItems: numberOfSlides,
                  maxItems: numberOfSlides,
                  items: {
                    type: 'object',
                    properties: {
                      content: {
                        type: 'string',
                        description:
                          'Strict Markdown: "# Title" followed ONLY by bullet points "- Point". No other text allowed.',
                      },
                      layoutId: {
                        type: 'string',
                        description:
                          'The ID of the most appropriate layout from the available layouts list for this specific slide. CRITICAL: Each slide must have a UNIQUE layoutId - do not reuse the same layoutId for multiple slides. All layoutIds in the outlines array must be different from each other.',
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
        max_tokens: 16000, // Ensure enough tokens for 50+ slides
      });

      let accumulatedContent = '';
      let finishReason = null;

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
      }

      this.logger.log(`🏁 [Outline ${id}] Stream finished. Reason: ${finishReason}`);

      if (!accumulatedContent) {
        throw new Error(`AI returned empty response. Finish reason: ${finishReason}`);
      }

      // Check if truncated
      if (finishReason === 'length') {
         this.logger.warn(`⚠️ [Outline ${id}] Output truncated due to length limit. Formatting may be incomplete.`);
      }

      // Final processing
      this.logger.log(`🧪 [Outline ${id}] Parsing final AI response...`);
      let outlineData: OutlineResponse;
      try {
        outlineData = JSON.parse(accumulatedContent);
      } catch (e: any) {
        this.logger.error(`❌ [Outline ${id}] JSON Parse Error: ${e.message}`);
        // Attempt naive repair
        try {
           const repaired = accumulatedContent + ']}'; 
           outlineData = JSON.parse(repaired);
        } catch (repairError) {
           throw new Error(`Failed to parse AI response: ${e.message}`);
        }
      }

      // Save to database
      const outlinesWithLayoutId = outlineData.outlines.map((item) => ({
        content: item.content,
        layoutId: item.layoutId,
        schemaId: item.layoutId, 
      }));

      await this.updateOutlineStatus(id, 'completed', {
        title: outlineData.title,
        outlines: outlinesWithLayoutId,
      });

      // Credit deduction
       try {
        await this.creditService.useCredits(
          user.id,
          1,
          `Generated AI outline for presentation ${outline.title || id}`,
          outline.presentationId || undefined,
        );
      } catch (creditError) {
        this.logger.error(`❌ [Outline ${id}] Failed to deduct credit:`, creditError);
      }

      // Update presentation title
      if (outline.presentationId) {
        try {
          await this.presentationService.updateTitle(
            outline.presentationId,
            user,
            { title: outlineData.title },
          );
        } catch (error: any) {
             // Ignore
        }
      }

      yield JSON.stringify({
        type: 'complete',
        data: {
             title: outlineData.title,
             outlines: outlinesWithLayoutId
        }
      });

    } catch (error: any) {
      this.logger.error(`❌ [Outline ${id}] GENERATION ERROR:`, error);
      await this.updateOutlineStatus(id, 'failed');
      yield JSON.stringify({ type: 'error', message: error.message });
    } finally {
      this.generatingOutlines.delete(id);
    }
  }
}

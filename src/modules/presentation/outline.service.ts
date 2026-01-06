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

      // Check if outlines array exists and has items
      const hasOutlines =
        outline.outlines &&
        Array.isArray(outline.outlines) &&
        outline.outlines.length > 0;

      // If no outlines exist and status is generating, auto-generate
      // But only if not already generating (prevent infinite loops)
      if (
        !hasOutlines &&
        outline.status === 'generating' &&
        !this.generatingOutlines.has(id)
      ) {
        this.generatingOutlines.add(id);
        this.logger.log(`🚀 STARTING OUTLINE AUTO-GENERATION: ID ${id}`);
        this.logger.log(`📝 User Prompt: "${outline.prompt.substring(0, 100)}${outline.prompt.length > 100 ? '...' : ''}"`);

        try {
          if (!this.openRouter) {
            throw new Error('OpenRouter service is not initialized');
          }

          this.logger.log(`💳 [Outline ${id}] Checking credits...`);
          // Check if user has enough credits to generate outline
          // 1 credit for outline generation
          const hasCredits = await this.creditService.hasEnoughCredits(user.id, 1);
          if (!hasCredits) {
            this.logger.warn(`🚫 [Outline ${id}] Insufficient credits for user ${user.id}`);
            throw new BadRequestException('Insufficient credits to generate presentation outline.');
          }

          const userPrompt = outline.prompt;
          const numberOfSlides = outline.numberOfSlides;

          this.logger.log(`⏳ [Outline ${id}] Setting status to "generating"...`);
          // Update status to generating (redundant but safe)
          await this.updateOutlineStatus(id, 'generating');

          this.logger.log(`🗄️ [Outline ${id}] Fetching admin layouts from DB...`);
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
            throw new Error(
              'No layouts available in the database. Please run simple-layout-seed.ts.',
            );
          }

          // Format layouts info for the prompt
          const layoutsInfo = allLayouts.map((layout) => ({
            id: layout.id,
            name: layout.name,
            description: layout.description,
          }));

          this.logger.log(`📊 [Outline ${id}] Found ${layoutsInfo.length} layouts for selection.`);

          this.logger.log(`🤖 [Outline ${id}] Calling LLM for outline generation (Model: ${this.MODEL_NAME})...`);
          const response = await this.openRouter.chat.send({
            model: this.MODEL_NAME,
            messages: [
              {
                role: 'user',
                content: `Analyze the following prompt and generate a comprehensive presentation outline with exactly ${numberOfSlides} slides. If the prompt contains numbered items or an outline structure, use that as a starting point. Otherwise, create a logical outline based on the topic.

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
- The FIRST slide MUST use an introduction/title/hero layout - this is mandatory
- Match the layout's description to the slide's content purpose
- If you have multiple slides with similar content, use the most appropriate layout available even if you have to reuse one
- Focus on high-quality content that matches the slide purpose

For each outline item, generate markdown content that includes:
- A heading with "# Section Title"
- Bullet points (-) for details/sub-items

Generate exactly ${numberOfSlides} outline items. Each item must have:
- A "content" field containing the markdown-formatted content for that slide section
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
                      description: 'The main title of the presentation',
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
                              'Markdown-formatted content for this slide section. Should include a heading (# Title) and bullet points (-) for details.',
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
            stream: false,
          });

          const content = response.choices[0]?.message?.content;

          // Log tech usage
          if (response.usage) {
            const inputTokens = (response.usage as any).promptTokens || (response.usage as any).prompt_tokens;
            const outputTokens = (response.usage as any).completionTokens || (response.usage as any).completion_tokens;
            this.logger.log(`📈 [Outline ${id}] AI Usage: ${inputTokens} in / ${outputTokens} out`);

            await this.aiUsageService.logUsage({
              userId: user.id,
              modelName: this.MODEL_NAME,
              inputTokens,
              outputTokens,
              type: 'outline',
              outlineId: id
            });
          }

          if (!content || typeof content !== 'string') {
            this.logger.error(`❌ [Outline ${id}] No response from AI service.`);
            throw new Error('Invalid response format from OpenRouter');
          }

          // Parse the response
          this.logger.log(`🧪 [Outline ${id}] Parsing AI response...`);
          const outlineData: OutlineResponse = JSON.parse(content);

          // Save to database
          const outlinesWithLayoutId = outlineData.outlines.map((item) => ({
            content: item.content,
            layoutId: item.layoutId,
            schemaId: item.layoutId, // Map for backward compatibility if needed
          }));

          this.logger.log(`💾 [Outline ${id}] Saving ${outlinesWithLayoutId.length} outline items to DB...`);
          await this.updateOutlineStatus(id, 'completed', {
            title: outlineData.title,
            outlines: outlinesWithLayoutId,
          });

          // Deduct 1 credit for successful AI outline generation
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

          this.logger.log(`✅ [Outline ${id}] Generation completed: "${outlineData.title}"`);

          // Update presentation title if presentationId exists
          if (outline.presentationId) {
            try {
              await this.presentationService.updateTitle(
                outline.presentationId,
                user,
                { title: outlineData.title },
              );
              this.logger.log(`📝 [Outline ${id}] Updated presentation title: ${outlineData.title}`);
            } catch (error: any) {
              this.logger.error(`⚠️ [Outline ${id}] Failed to update presentation title: ${error.message}`);
            }
          }

          this.generatingOutlines.delete(id);

          // Refetch outline after generation
          const updatedOutline = await this.prisma.outline.findFirst({
            where: {
              id,
              userId: user.id,
            },
          });
          return successResponse(
            'Outline fetched and generated successfully',
            updatedOutline,
          );
        } catch (genError: any) {
          this.generatingOutlines.delete(id);
          this.logger.error(`❌ [Outline ${id}] CRITICAL ERROR during auto-generation:`, genError);
          await this.updateOutlineStatus(id, 'failed');
          // Return original outline even if generation failed
          return successResponse('Outline fetched successfully', outline);
        }
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
}

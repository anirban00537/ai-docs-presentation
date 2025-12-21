import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { OpenRouter } from '@openrouter/sdk';
import { ConfigService } from '@nestjs/config';
import { AiUsageService } from '../subscription/services/ai-usage.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';

@Injectable()
export class PromptPresentationAIService {
  private readonly logger = new Logger(PromptPresentationAIService.name);
  private openRouter: OpenRouter;
  private readonly MODEL_NAME = coreConstant.AI_MODELS.SLIDES.NAME;
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly aiUsageService: AiUsageService,
  ) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      this.logger.error(
        'OPENROUTER_API_KEY is not set in environment variables.',
      );
    } else {
      try {
        this.openRouter = new OpenRouter({
          apiKey: apiKey,
        });
        this.logger.log('OpenRouter SDK initialized');
      } catch (error) {
        this.logger.error('Failed to initialize OpenRouter SDK:', error);
      }
    }
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
      layoutId?: string; // Keep for backward compatibility
    }>;
    const title = outline.title || 'Untitled Presentation';


    yield JSON.stringify({
      type: 'start',
      totalSlides: outlineItems.length,
    });

    // Generate and save slides one by one
    for (let i = 0; i < outlineItems.length; i++) {
      const outlineItem = outlineItems[i];
      const slideNumber = i + 1;
      const totalSlides = outlineItems.length;
      const schemaId = outlineItem.schemaId || outlineItem.layoutId; // Use schemaId, fallback to layoutId for backward compatibility

      let templateRows: any[] = [];

      // Get layout from database
      if (schemaId) {
        const layout = await this.prisma.layout.findUnique({
          where: { id: schemaId },
        });

        if (layout && layout.data && (layout.data as any).rows) {
          templateRows = (layout.data as any).rows;
          this.logger.debug(
            `Using layout ${schemaId} with ${templateRows.length} rows`,
          );
        } else {
          this.logger.error(
            `Layout ${schemaId} not found or has no row data.`,
          );
          // Continue with empty templateRows - the LLM will generate a basic structure
        }
      }

      yield JSON.stringify({
        type: 'slide-start',
        slideNumber,
        totalSlides,
      });

      try {
        // Build layout structure prompt - send only the rows structure
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
- For example: If template has "## Title", you should have "## Your New Title" - keep the exact same Markdown format
- DO NOT add extra formatting like bold, italic, lists, etc. unless they exist in the template`;

        const slidePrompt = `You are generating slide ${slideNumber} of ${totalSlides} for a presentation titled "${title}".

OUTLINE CONTENT FOR THIS SLIDE (in markdown format):
${outlineItem.content}
${layoutStructureSection}

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
          await this.aiUsageService.logUsage({
            userId: user.id,
            modelName: this.MODEL_NAME,
            inputTokens: (response.usage as any).promptTokens || (response.usage as any).prompt_tokens,
            outputTokens: (response.usage as any).completionTokens || (response.usage as any).completion_tokens,
            type: 'slide',
            presentationId: presentationId
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
          // If response doesn't have rows, try to use the data directly
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

        // Stream the slide data with the saved slide ID
        yield JSON.stringify({
          type: 'slide',
          slideNumber,
          slideId: savedSlide.id,
          data: slideData,
        });
      } catch (error: any) {
        this.logger.error(`Error generating slide ${slideNumber}:`, error);
        yield JSON.stringify({
          type: 'slide-error',
          slideNumber,
          message: error.message || 'Failed to generate slide',
        });
      }
    }

    yield JSON.stringify({
      type: 'complete',
      totalSlides: outlineItems.length,
    });
  }
}

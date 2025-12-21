import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';

@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);

  // Use pricing from coreConstant
  private readonly pricing = {
    [coreConstant.AI_MODELS.OUTLINE.NAME]: coreConstant.AI_MODELS.OUTLINE.PRICING,
    [coreConstant.AI_MODELS.SLIDES.NAME]: coreConstant.AI_MODELS.SLIDES.PRICING,
    'default': coreConstant.AI_MODELS.DEFAULT.PRICING
  };

  constructor(private readonly prisma: PrismaService) {}

  async logUsage(params: {
    userId: string;
    modelName: string;
    inputTokens: number;
    outputTokens: number;
    type: string;
    presentationId?: string;
    outlineId?: string;
    provider?: string;
  }) {
    try {
      const { userId, modelName, inputTokens, outputTokens, type, presentationId, outlineId, provider = 'openrouter' } = params;

      // Calculate cost
      const rates = this.pricing[modelName] || this.pricing['default'];
      const cost = ((inputTokens / 1000000) * rates.prompt) + ((outputTokens / 1000000) * rates.completion);

      const usage = await this.prisma.aiUsage.create({
        data: {
          userId,
          modelName,
          inputTokens,
          outputTokens,
          cost,
          type,
          presentationId,
          outlineId,
          provider
        }
      });

      this.logger.log(`[AI_USAGE] Logged ${type} usage for user ${userId}: ${inputTokens} input, ${outputTokens} output. Cost: $${cost.toFixed(6)}`);
      return usage;
    } catch (error) {
      this.logger.error('Failed to log AI usage:', error);
    }
  }
}

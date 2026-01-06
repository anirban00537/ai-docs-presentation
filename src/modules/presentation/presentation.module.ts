import { Module } from '@nestjs/common';
import { PresentationService } from './presentation.service';
import { PresentationController } from './presentation.controller';
import { PromptPresentationAIService } from './prompt-presentation-ai/prompt-presentation-ai.service';
import { OutlineService } from './outline.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ImagesModule } from '../images/images.module';

// Import refactored services
import { ImageAnalyzerService } from './prompt-presentation-ai/generators/image-analyzer.service';
import { ImageFetcherService } from './prompt-presentation-ai/generators/image-fetcher.service';
import { PromptBuilderService } from './prompt-presentation-ai/prompts/prompt-builder.service';

@Module({
  imports: [PrismaModule, SubscriptionModule, ImagesModule],
  controllers: [PresentationController],
  providers: [
    PresentationService,
    PromptPresentationAIService,
    OutlineService,
    // Refactored AI services
    ImageAnalyzerService,
    ImageFetcherService,
    PromptBuilderService,
  ],
  exports: [
    PresentationService,
    PromptPresentationAIService,
    OutlineService,
  ],
})
export class PresentationModule {}

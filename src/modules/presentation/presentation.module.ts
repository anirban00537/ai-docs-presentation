import { Module } from '@nestjs/common';
import { PresentationService } from './presentation.service';
import { PresentationController } from './presentation.controller';
import { PromptPresentationAIService } from './prompt-presentation-ai';
import { OutlineService } from './outline.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ImagesModule } from '../images/images.module';

// Import refactored services
import {
  ImageAnalyzerService,
  ImageFetcherService,
  PromptBuilderService,
} from './prompt-presentation-ai';

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

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
// Import export services
import { ScreenshotService } from './export/screenshot.service';
import { PptxExportService } from './export/pptx-export.service';
import { PdfExportService } from './export/pdf-export.service';
import { PngExportService } from './export/png-export.service';

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
    // Export services
    ScreenshotService,
    PptxExportService,
    PdfExportService,
    PngExportService,
  ],
  exports: [
    PresentationService,
    PromptPresentationAIService,
    OutlineService,
  ],
})
export class PresentationModule {}

import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { PromptDocsAIService } from './prompt-docs-ai/prompt-docs-ai.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ImagesModule } from '../images/images.module';

// Import refactored services
import { ImageAnalyzerService } from './prompt-docs-ai/generators/image-analyzer.service';
import { ImageFetcherService } from './prompt-docs-ai/generators/image-fetcher.service';
import { PromptBuilderService } from './prompt-docs-ai/prompts/prompt-builder.service';
// Import export services
import { ScreenshotService } from './export/screenshot.service';
import { PptxExportService } from './export/pptx-export.service';
import { PdfExportService } from './export/pdf-export.service';
import { PngExportService } from './export/png-export.service';

@Module({
  imports: [PrismaModule, SubscriptionModule, ImagesModule],
  controllers: [DocsController],
  providers: [
    DocsService,
    PromptDocsAIService,
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
    DocsService,
    PromptDocsAIService,
  ],
})
export class DocsModule {}

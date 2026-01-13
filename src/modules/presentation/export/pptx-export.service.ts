import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScreenshotService } from './screenshot.service';
const PptxGenJS = require('pptxgenjs');

@Injectable()
export class PptxExportService {
  private readonly logger = new Logger(PptxExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly screenshotService: ScreenshotService,
  ) {}

  /**
   * Export presentation to PPTX format using screenshots
   */
  async exportPresentation(
    presentationId: string,
    userId: string,
  ): Promise<Buffer> {
    try {
      // Fetch presentation with slides
      const presentation = await this.prisma.presentation.findFirst({
        where: {
          id: presentationId,
          userId,
          deletedAt: null,
        },
        include: {
          slides: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!presentation) {
        throw new Error('Presentation not found');
      }

      if (!presentation.slides || presentation.slides.length === 0) {
        throw new Error('Presentation has no slides');
      }

      this.logger.log(
        `Exporting presentation ${presentationId} with ${presentation.slides.length} slides`,
      );

      // Generate screenshots for all slides
      const slideIds = presentation.slides.map((slide) => slide.id);
      const screenshots =
        await this.screenshotService.takeMultipleSlideScreenshots(
          presentationId,
          slideIds,
          {
            width: 1920,
            height: 1080,
            timeout: 30000,
          },
        );

      if (screenshots.size === 0) {
        throw new Error('Failed to capture any slide screenshots');
      }

      // Create PPTX presentation
      const pptx = new PptxGenJS();

      // Set presentation properties
      pptx.author = 'Butterfast';
      pptx.company = 'Butterfast';
      pptx.title = presentation.title || 'Presentation';
      pptx.subject = presentation.description || '';
      pptx.revision = presentation.version?.toString() || '1';

      // Define custom layout (16:9 aspect ratio)
      pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 });
      pptx.layout = 'CUSTOM';

      // Add slides with screenshots (process in order)
      const sortedSlides = [...presentation.slides].sort(
        (a, b) => a.order - b.order,
      );

      for (const slide of sortedSlides) {
        const screenshot = screenshots.get(slide.id);

        if (!screenshot) {
          this.logger.warn(
            `Screenshot not found for slide ${slide.id}, skipping`,
          );
          continue;
        }

        try {
          // Convert buffer to base64
          const base64Image = screenshot.toString('base64');

          // Add slide with image - fill entire slide area
          pptx.addSlide().addImage({
            data: `image/png;base64,${base64Image}`,
            x: 0,
            y: 0,
            w: 10,
            h: 5.625,
          });

          this.logger.log(`Added slide ${slide.order || 'unknown'} to PPTX`);
        } catch (error) {
          this.logger.error(`Failed to add slide ${slide.id} to PPTX`, error);
          // Continue with other slides
        }
      }

      // Generate PPTX buffer
      const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });

      this.logger.log(
        `PPTX export completed: ${presentation.slides.length} slides, ${(pptxBuffer.length / 1024 / 1024).toFixed(2)} MB`,
      );

      // Clean up browser
      await this.screenshotService.closeBrowser();

      return pptxBuffer as Buffer;
    } catch (error) {
      this.logger.error(
        `Failed to export presentation ${presentationId}`,
        error,
      );

      // Ensure browser is closed on error
      try {
        await this.screenshotService.closeBrowser();
      } catch (closeError) {
        this.logger.error('Failed to close browser', closeError);
      }

      throw error;
    }
  }
}

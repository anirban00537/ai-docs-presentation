import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScreenshotService } from './screenshot.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfExportService {
  private readonly logger = new Logger(PdfExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly screenshotService: ScreenshotService,
  ) {}

  /**
   * Export presentation to PDF format using screenshots
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
        `Exporting presentation ${presentationId} to PDF with ${presentation.slides.length} slides`,
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
            timeout: 15000, // Reduced from 30000
          },
        );

      if (screenshots.size === 0) {
        throw new Error('Failed to capture any slide screenshots');
      }

      // Create PDF document
      const pdfBuffer = await this.createPdfFromScreenshots(
        screenshots,
        presentation,
      );

      this.logger.log(
        `PDF export completed: ${presentation.slides.length} slides, ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`,
      );

      // Clean up browser
      await this.screenshotService.closeBrowser();

      return pdfBuffer;
    } catch (error) {
      this.logger.error(
        `Failed to export presentation ${presentationId} to PDF`,
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

  /**
   * Create PDF from screenshots
   */
  private async createPdfFromScreenshots(
    screenshots: Map<string, Buffer>,
    presentation: any,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create PDF document with landscape orientation (16:9 aspect ratio)
        // Using custom page size: 11.11 x 6.25 inches (maintains 16:9 ratio)
        const doc = new PDFDocument({
          size: [800, 450], // Points (16:9 ratio)
          margin: 0,
          autoFirstPage: false,
          info: {
            Title: presentation.title || 'Presentation',
            Author: 'Butterfast',
            Subject: presentation.description || '',
            Creator: 'Butterfast',
          },
        });

        const chunks: Buffer[] = [];

        // Collect PDF chunks
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

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
            // Add new page for each slide
            doc.addPage();

            // Add image to fill the entire page
            doc.image(screenshot, 0, 0, {
              width: 800,
              height: 450,
              align: 'center',
              valign: 'center',
            });

            this.logger.log(`Added slide ${slide.order || 'unknown'} to PDF`);
          } catch (error) {
            this.logger.error(`Failed to add slide ${slide.id} to PDF`, error);
            // Continue with other slides
          }
        }

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

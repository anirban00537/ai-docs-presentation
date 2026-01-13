import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScreenshotService } from './screenshot.service';
import archiver from 'archiver';
import { Readable } from 'stream';

@Injectable()
export class PngExportService {
  private readonly logger = new Logger(PngExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly screenshotService: ScreenshotService,
  ) {}

  /**
   * Export presentation slides as PNG images in a ZIP file
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
        `Exporting presentation ${presentationId} to PNG with ${presentation.slides.length} slides`,
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

      // Create ZIP file with PNG images
      const zipBuffer = await this.createZipFromScreenshots(
        screenshots,
        presentation,
      );

      this.logger.log(
        `PNG export completed: ${presentation.slides.length} slides, ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`,
      );

      // Clean up browser
      await this.screenshotService.closeBrowser();

      return zipBuffer;
    } catch (error) {
      this.logger.error(
        `Failed to export presentation ${presentationId} to PNG`,
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
   * Create ZIP file from screenshots
   */
  private async createZipFromScreenshots(
    screenshots: Map<string, Buffer>,
    presentation: any,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const archive = archiver('zip', {
          zlib: { level: 9 }, // Maximum compression
        });

        const chunks: Buffer[] = [];

        // Collect ZIP chunks
        archive.on('data', (chunk) => chunks.push(chunk));
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);

        // Add slides with screenshots (process in order)
        const sortedSlides = [...presentation.slides].sort(
          (a, b) => a.order - b.order,
        );

        for (let i = 0; i < sortedSlides.length; i++) {
          const slide = sortedSlides[i];
          const screenshot = screenshots.get(slide.id);

          if (!screenshot) {
            this.logger.warn(
              `Screenshot not found for slide ${slide.id}, skipping`,
            );
            continue;
          }

          try {
            // Add PNG image to ZIP with slide number
            const slideNumber = String(i + 1).padStart(2, '0');
            const filename = `slide_${slideNumber}.png`;

            archive.append(screenshot, { name: filename });

            this.logger.log(`Added ${filename} to ZIP`);
          } catch (error) {
            this.logger.error(
              `Failed to add slide ${slide.id} to ZIP`,
              error,
            );
            // Continue with other slides
          }
        }

        // Finalize ZIP
        archive.finalize();
      } catch (error) {
        reject(error);
      }
    });
  }
}

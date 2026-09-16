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
   * Export doc cards as PNG images in a ZIP file
   */
  async exportDoc(
    docId: string,
    userId: string,
  ): Promise<Buffer> {
    try {
      // Fetch doc with cards
      const doc = await this.prisma.doc.findFirst({
        where: {
          id: docId,
          userId,
          deletedAt: null,
        },
        include: {
          cards: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!doc) {
        throw new Error('Doc not found');
      }

      if (!doc.cards || doc.cards.length === 0) {
        throw new Error('Doc has no cards');
      }

      this.logger.log(
        `Exporting doc ${docId} to PNG with ${doc.cards.length} cards`,
      );

      // Generate screenshots for all cards
      const cardIds = doc.cards.map((card) => card.id);
      const screenshots =
        await this.screenshotService.takeMultipleCardScreenshots(
          docId,
          cardIds,
          {
            width: 1920,
            height: 1080,
            timeout: 25000, // Increased for lazy image loading
          },
        );

      if (screenshots.size === 0) {
        throw new Error('Failed to capture any card screenshots');
      }

      // Create ZIP file with PNG images
      const zipBuffer = await this.createZipFromScreenshots(
        screenshots,
        doc,
      );

      this.logger.log(
        `PNG export completed: ${doc.cards.length} cards, ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`,
      );

      // Clean up browser
      await this.screenshotService.closeBrowser();

      return zipBuffer;
    } catch (error) {
      this.logger.error(
        `Failed to export doc ${docId} to PNG`,
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
    doc: any,
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

        // Add cards with screenshots (process in order)
        const sortedCards = [...doc.cards].sort(
          (a, b) => a.order - b.order,
        );

        for (let i = 0; i < sortedCards.length; i++) {
          const card = sortedCards[i];
          const screenshot = screenshots.get(card.id);

          if (!screenshot) {
            this.logger.warn(
              `Screenshot not found for card ${card.id}, skipping`,
            );
            continue;
          }

          try {
            // Add PNG image to ZIP with card number
            const cardNumber = String(i + 1).padStart(2, '0');
            const filename = `card_${cardNumber}.png`;

            archive.append(screenshot, { name: filename });

            this.logger.log(`Added ${filename} to ZIP`);
          } catch (error) {
            this.logger.error(
              `Failed to add card ${card.id} to ZIP`,
              error,
            );
            // Continue with other cards
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

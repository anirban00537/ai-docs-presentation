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
   * Export doc to PPTX format using screenshots
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
        `Exporting doc ${docId} with ${doc.cards.length} cards`,
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
            timeout: 15000, // Reduced from 30000
          },
        );

      if (screenshots.size === 0) {
        throw new Error('Failed to capture any card screenshots');
      }

      // Create PPTX doc
      const pptx = new PptxGenJS();

      // Set doc properties
      pptx.author = 'Butterfast';
      pptx.company = 'Butterfast';
      pptx.title = doc.title || 'Doc';
      pptx.subject = doc.description || '';
      pptx.revision = doc.version?.toString() || '1';

      // Define custom layout (16:9 aspect ratio)
      pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 });
      pptx.layout = 'CUSTOM';

      // Add cards with screenshots (process in order)
      const sortedCards = [...doc.cards].sort(
        (a, b) => a.order - b.order,
      );

      for (const card of sortedCards) {
        const screenshot = screenshots.get(card.id);

        if (!screenshot) {
          this.logger.warn(
            `Screenshot not found for card ${card.id}, skipping`,
          );
          continue;
        }

        try {
          // Convert buffer to base64
          const base64Image = screenshot.toString('base64');

          // Add card with image - fill entire card area
          pptx.addSlide().addImage({
            data: `image/png;base64,${base64Image}`,
            x: 0,
            y: 0,
            w: 10,
            h: 5.625,
          });

          this.logger.log(`Added card ${card.order || 'unknown'} to PPTX`);
        } catch (error) {
          this.logger.error(`Failed to add card ${card.id} to PPTX`, error);
          // Continue with other cards
        }
      }

      // Generate PPTX buffer
      const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });

      this.logger.log(
        `PPTX export completed: ${doc.cards.length} cards, ${(pptxBuffer.length / 1024 / 1024).toFixed(2)} MB`,
      );

      // Clean up browser
      await this.screenshotService.closeBrowser();

      return pptxBuffer as Buffer;
    } catch (error) {
      this.logger.error(
        `Failed to export doc ${docId}`,
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

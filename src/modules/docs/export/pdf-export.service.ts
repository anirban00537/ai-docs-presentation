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
   * Export doc to PDF format using screenshots
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
        `Exporting doc ${docId} to PDF with ${doc.cards.length} cards`,
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

      // Create PDF document
      const pdfBuffer = await this.createPdfFromScreenshots(
        screenshots,
        doc,
      );

      this.logger.log(
        `PDF export completed: ${doc.cards.length} cards, ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`,
      );

      // Clean up browser
      await this.screenshotService.closeBrowser();

      return pdfBuffer;
    } catch (error) {
      this.logger.error(
        `Failed to export doc ${docId} to PDF`,
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
    doc: any,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create PDF document with landscape orientation (16:9 aspect ratio)
        // Using custom page size: 11.11 x 6.25 inches (maintains 16:9 ratio)
        const pdfDoc = new PDFDocument({
          size: [800, 450], // Points (16:9 ratio)
          margin: 0,
          autoFirstPage: false,
          info: {
            Title: doc.title || 'Doc',
            Author: 'Butterfast',
            Subject: doc.description || '',
            Creator: 'Butterfast',
          },
        });

        const chunks: Buffer[] = [];

        // Collect PDF chunks
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);

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
            // Add new page for each card
            pdfDoc.addPage();

            // Add image to fill the entire page
            pdfDoc.image(screenshot, 0, 0, {
              width: 800,
              height: 450,
              align: 'center',
              valign: 'center',
            });

            this.logger.log(`Added card ${card.order || 'unknown'} to PDF`);
          } catch (error) {
            this.logger.error(`Failed to add card ${card.id} to PDF`, error);
            // Continue with other cards
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

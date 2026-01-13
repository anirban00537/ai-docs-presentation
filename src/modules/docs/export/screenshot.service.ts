import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { Browser, Page } from 'puppeteer';
import { base_url } from 'src/shared/helpers/functions';
import * as crypto from 'crypto';

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  timeout?: number;
  waitForSelector?: string;
  fullPage?: boolean;
}

@Injectable()
export class ScreenshotService {
  private readonly logger = new Logger(ScreenshotService.name);
  private browser: Browser | null = null;
  private readonly appUrl: string;
  private readonly exportSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.appUrl =
      base_url() ||
      this.configService.get('APP_URL') ||
      'http://localhost:3000';
    this.exportSecret =
      this.configService.get('EXPORT_SECRET') ||
      'butterfast-export-secret-key';
  }

  /**
   * Generate export key for secure card access
   */
  private generateExportKey(docId: string): string {
    return crypto
      .createHash('sha256')
      .update(`${docId}:${this.exportSecret}`)
      .digest('hex')
      .substring(0, 32);
  }

  /**
   * Initialize browser instance (reused for multiple screenshots)
   */
  async initializeBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--disable-web-security',
          '--allow-file-access-from-files',
        ],
      });

      this.logger.log('Browser initialized for screenshot capture');
      return this.browser;
    } catch (error) {
      this.logger.error('Failed to initialize browser', error);
      throw error;
    }
  }

  /**
   * Close browser instance
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.log('Browser closed');
    }
  }

  /**
   * Take screenshot of a single card using the export embed route
   */
  async takeCardScreenshot(
    docId: string,
    cardId: string,
    options: ScreenshotOptions = {},
  ): Promise<Buffer> {
    const { width = 1920, height = 1080, timeout = 15000 } = options;

    const browser = await this.initializeBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport to exact card dimensions (16:9 aspect ratio)
      await page.setViewport({
        width,
        height,
        deviceScaleFactor: 2, // High DPI for better quality
      });

      // Disable unnecessary features for faster loading
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        // Block analytics, ads, and other non-essential resources
        const resourceType = request.resourceType();
        if (['font', 'stylesheet', 'image'].includes(resourceType)) {
          request.continue();
        } else if (['media', 'websocket', 'manifest'].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });

      // Generate export key for secure access
      const exportKey = this.generateExportKey(docId);

      // Navigate to the export embed route
      const exportUrl = `${this.appUrl}/embed/card/${cardId}?docId=${docId}&exportKey=${exportKey}`;

      this.logger.log(`Navigating to export URL for card ${cardId}`);

      await page.goto(exportUrl, {
        waitUntil: 'domcontentloaded', // Changed from networkidle2 for faster loading
        timeout,
      });

      // Wait for the export container to be ready
      try {
        await page.waitForSelector('#export-card-container.export-ready', {
          timeout: 8000, // Reduced from 20000
        });

        // Minimal wait for critical rendering - reduced from 2000ms
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Wait for images only if they exist and aren't loaded
        await page.evaluate(() => {
          const images = Array.from(document.images);
          if (images.length === 0) return Promise.resolve();
          
          return Promise.race([
            Promise.all(
              images
                .filter((img) => !img.complete)
                .map(
                  (img) =>
                    new Promise((resolve) => {
                      img.onload = img.onerror = resolve;
                      // Timeout individual images after 2s
                      setTimeout(resolve, 2000);
                    }),
                ),
            ),
            // Overall timeout for all images
            new Promise((resolve) => setTimeout(resolve, 3000)),
          ]);
        });

        // Small final wait for any CSS transitions - reduced from 500ms
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (waitError) {
        // Check if there's an error state
        const hasError = await page.$('#export-error');
        if (hasError) {
          const errorText = await page.evaluate(
            () => document.querySelector('#export-error')?.textContent || '',
          );
          throw new Error(`Export page error: ${errorText}`);
        }

        this.logger.warn(
          `Export container not found for card ${cardId}, attempting screenshot anyway`,
        );
      }

      // Take screenshot of the viewport
      const screenshot = (await page.screenshot({
        type: 'png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width,
          height,
        },
      })) as Buffer;

      this.logger.log(
        `Screenshot captured for card ${cardId} (${screenshot.length} bytes)`,
      );
      return screenshot;
    } catch (error) {
      this.logger.error(
        `Failed to capture screenshot for card ${cardId}`,
        error,
      );
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Take screenshots for multiple cards (optimized - parallel batches)
   */
  async takeMultipleCardScreenshots(
    docId: string,
    cardIds: string[],
    options: ScreenshotOptions = {},
  ): Promise<Map<string, Buffer>> {
    const screenshots = new Map<string, Buffer>();
    const BATCH_SIZE = 3; // Process 3 cards at a time for optimal performance

    try {
      // Initialize browser once for all screenshots
      await this.initializeBrowser();

      // Process cards in batches for parallel execution
      for (let i = 0; i < cardIds.length; i += BATCH_SIZE) {
        const batch = cardIds.slice(i, i + BATCH_SIZE);
        
        this.logger.log(
          `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(cardIds.length / BATCH_SIZE)} (${batch.length} cards)`,
        );

        // Process batch in parallel
        const batchPromises = batch.map(async (cardId) => {
          try {
            this.logger.log(`Capturing screenshot for card ${cardId}`);

            const screenshot = await this.takeCardScreenshot(
              docId,
              cardId,
              options,
            );

            screenshots.set(cardId, screenshot);
            this.logger.log(`Screenshot captured successfully for card ${cardId}`);
          } catch (error) {
            this.logger.error(
              `Failed to capture screenshot for card ${cardId}, continuing with next`,
              error,
            );
            // Continue with other cards even if one fails
          }
        });

        // Wait for all cards in the batch to complete
        await Promise.all(batchPromises);
      }

      this.logger.log(
        `Completed screenshot capture for ${screenshots.size}/${cardIds.length} cards`,
      );

      return screenshots;
    } catch (error) {
      this.logger.error('Failed to capture screenshots', error);
      throw error;
    }
  }
}

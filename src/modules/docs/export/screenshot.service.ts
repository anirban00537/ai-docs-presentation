import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { Browser, Page } from 'puppeteer';
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
    // Use FRONTEND_URL for accessing the Next.js frontend
    const frontendUrl = this.configService.get('FRONTEND_URL') || 
      this.configService.get('APP_URL') || 
      'http://localhost:3000';
    
    // Remove trailing slash for consistent URL building
    this.appUrl = frontendUrl.replace(/\/$/, '');
    
    this.exportSecret =
      this.configService.get('EXPORT_SECRET') ||
      'butterfast-export-secret-key';
    
    this.logger.log(`Screenshot service initialized with FRONTEND_URL: ${this.appUrl}`);
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
      this.logger.log('Launching Puppeteer browser...');
      
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
          '--single-process', // May help on some VPS environments
        ],
        // Try to find Chrome executable
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });

      this.logger.log('Browser initialized for screenshot capture');
      return this.browser;
    } catch (error) {
      this.logger.error(`Failed to initialize browser: ${error.message}`, error.stack);
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
    const { width = 1920, height = 1080, timeout = 25000 } = options;

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

      this.logger.log(`Navigating to export URL for card ${cardId}: ${exportUrl}`);

      try {
        await page.goto(exportUrl, {
          waitUntil: 'domcontentloaded', // Changed from networkidle2 for faster loading
          timeout,
        });
      } catch (navError) {
        this.logger.error(`Navigation failed for ${exportUrl}: ${navError.message}`);
        throw new Error(`Failed to navigate to export page: ${navError.message}. Check if APP_URL (${this.appUrl}) is accessible from the server.`);
      }

      // Wait for the export container to be ready
      try {
        await page.waitForSelector('#export-card-container.export-ready', {
          timeout: 10000,
        });

        // Wait for lazy image fetching hooks to complete (Unsplash API calls)
        // The useLazyImage hook has a 300ms debounce, so we wait longer
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Poll for images to appear and load (handles lazy-loaded images)
        // This waits for img elements to appear AND fully load
        await page.evaluate(() => {
          return new Promise<void>((resolve) => {
            const maxWait = 12000; // 12 seconds max
            const pollInterval = 500; // Check every 500ms
            const startTime = Date.now();
            
            const checkImages = () => {
              const images = Array.from(document.images);
              const allLoaded = images.every(img => img.complete && img.naturalWidth > 0);
              
              if (allLoaded || Date.now() - startTime > maxWait) {
                resolve();
                return;
              }
              
              // Continue polling
              setTimeout(checkImages, pollInterval);
            };
            
            // Start polling
            checkImages();
          });
        });

        // Final wait for any CSS transitions and final rendering
        await new Promise((resolve) => setTimeout(resolve, 500));
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
        `Failed to capture screenshot for card ${cardId}: ${error.message}`,
        error.stack,
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

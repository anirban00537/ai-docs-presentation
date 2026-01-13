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
   * Generate export key for secure slide access
   */
  private generateExportKey(presentationId: string): string {
    return crypto
      .createHash('sha256')
      .update(`${presentationId}:${this.exportSecret}`)
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
   * Take screenshot of a single slide using the export embed route
   */
  async takeSlideScreenshot(
    presentationId: string,
    slideId: string,
    options: ScreenshotOptions = {},
  ): Promise<Buffer> {
    const { width = 1920, height = 1080, timeout = 30000 } = options;

    const browser = await this.initializeBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport to exact slide dimensions (16:9 aspect ratio)
      await page.setViewport({
        width,
        height,
        deviceScaleFactor: 2, // High DPI for better quality
      });

      // Generate export key for secure access
      const exportKey = this.generateExportKey(presentationId);

      // Navigate to the export embed route
      const exportUrl = `${this.appUrl}/embed/slide/${slideId}?presentationId=${presentationId}&exportKey=${exportKey}`;

      this.logger.log(`Navigating to export URL: ${exportUrl}`);

      await page.goto(exportUrl, {
        waitUntil: 'networkidle2',
        timeout,
      });

      // Wait for the export container to be ready
      try {
        await page.waitForSelector('#export-slide-container.export-ready', {
          timeout: 20000,
        });

        // Additional wait for fonts and images to fully load
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Wait for any images to finish loading
        await page.evaluate(() => {
          return Promise.all(
            Array.from(document.images)
              .filter((img) => !img.complete)
              .map(
                (img) =>
                  new Promise((resolve) => {
                    img.onload = img.onerror = resolve;
                  }),
              ),
          );
        });

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
          `Export container not found for slide ${slideId}, attempting screenshot anyway`,
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
        `Screenshot captured for slide ${slideId} (${screenshot.length} bytes)`,
      );
      return screenshot;
    } catch (error) {
      this.logger.error(
        `Failed to capture screenshot for slide ${slideId}`,
        error,
      );
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Take screenshots for multiple slides (optimized - reuses browser)
   */
  async takeMultipleSlideScreenshots(
    presentationId: string,
    slideIds: string[],
    options: ScreenshotOptions = {},
  ): Promise<Map<string, Buffer>> {
    const screenshots = new Map<string, Buffer>();

    try {
      // Initialize browser once for all screenshots
      await this.initializeBrowser();

      for (const slideId of slideIds) {
        try {
          this.logger.log(`Capturing screenshot for slide ${slideId}`);

          const screenshot = await this.takeSlideScreenshot(
            presentationId,
            slideId,
            options,
          );

          screenshots.set(slideId, screenshot);
          this.logger.log(`Screenshot captured successfully for slide ${slideId}`);
        } catch (error) {
          this.logger.error(
            `Failed to capture screenshot for slide ${slideId}, continuing with next`,
            error,
          );
          // Continue with other slides even if one fails
        }
      }

      return screenshots;
    } catch (error) {
      this.logger.error('Failed to capture screenshots', error);
      throw error;
    }
  }
}

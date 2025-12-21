import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  Headers,
  Logger,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';
import { UseCreditsDto } from './dto/use-credits.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('subscription')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@UserInfo() user: User) {
    return this.subscriptionService.getSubscriptionStatus(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sync')
  async syncSubscription(@UserInfo() user: User) {
    return this.subscriptionService.syncSubscriptionFromPolar(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  async cancelSubscription(@UserInfo() user: User) {
    return this.subscriptionService.cancelSubscription(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('credits')
  async getCreditBalance(@UserInfo() user: User) {
    return this.subscriptionService.getCreditBalance(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('credits/use')
  async useCredits(@UserInfo() user: User, @Body() dto: UseCreditsDto) {
    return this.subscriptionService.useCredits(
      user,
      dto.amount,
      dto.description,
      dto.presentationId,
    );
  }

  /**
   * Get available products/pricing plans
   * This endpoint can be public or protected depending on your needs
   */
  @Get('products')
  async getProducts() {
    return this.subscriptionService.getProducts();
  }

  /**
   * Get product by ID
   */
  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.subscriptionService.getProduct(id);
  }

  /**
   * Create checkout session for a product
   */
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(
    @UserInfo() user: User,
    @Body() body: CreateCheckoutDto,
  ) {
    return this.subscriptionService.createCheckout(
      user,
      body.productId,
      body.successUrl,
    );
  }

  /**
   * Webhook endpoint for Polar.sh events
   * This endpoint should be publicly accessible (not behind JWT guard)
   */
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Request() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string | string[]>,
  ) {
    // Only process POST requests (webhooks are always POST)
    if (req.method !== 'POST') {
      return {
        success: false,
        message: 'Webhook endpoint only accepts POST requests',
      };
    }

    // Debug: Log all incoming headers for troubleshooting
    const allHeaders = {
      ...headers,
      ...(req.headers as any),
    };

    // Get headers case-insensitively (Express lowercases headers)
    const getHeader = (name: string): string | undefined => {
      const lowerName = name.toLowerCase();
      // Try multiple variations
      const value =
        headers[lowerName] ||
        headers[name] ||
        (req.headers as any)[lowerName] ||
        (req.headers as any)[name] ||
        (req.headers as any)[
          `X-${name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`
        ];
      return Array.isArray(value) ? value[0] : value;
    };

    // Polar.sh uses Standard Webhooks format (webhook-signature) not x-polar-signature
    const standardWebhookSignature = getHeader('webhook-signature');
    const standardWebhookId = getHeader('webhook-id');
    const standardWebhookTimestamp = getHeader('webhook-timestamp');

    // HYPOTHESIS B: Polar.sh uses x-polar-* headers (original assumption)
    const signature = getHeader('x-polar-signature');
    const event = getHeader('x-polar-event');

    // Debug logging - only log as MISSING if BOTH formats are missing
    const hasAnySignature = signature || standardWebhookSignature;
    const hasAnyEvent = event || standardWebhookId || (req.body as any)?.type;

    if (!hasAnySignature || !hasAnyEvent) {
      console.log('Webhook request received - Headers debug:', {
        'x-polar-signature': signature || 'MISSING',
        'x-polar-event': event || 'MISSING',
        'webhook-signature': standardWebhookSignature || 'MISSING',
        'webhook-id': standardWebhookId || 'MISSING',
        'all-header-keys': Object.keys(allHeaders),
        url: req.url,
        method: req.method,
        'content-type': getHeader('content-type'),
      });
    }

    // Verify webhook signature
    // NOTE: Polar.sh REQUIRES signature verification for security
    const webhookSecret = this.configService.get<string>(
      'POLAR_WEBHOOK_SECRET',
    );

    if (webhookSecret && signature) {
      // Try to get rawBody from multiple sources
      let rawBody = '';

      if (req.rawBody) {
        rawBody =
          typeof req.rawBody === 'string'
            ? req.rawBody
            : Buffer.isBuffer(req.rawBody)
              ? req.rawBody.toString('utf8')
              : JSON.stringify(req.rawBody);
      } else if (req.body) {
        // Fallback: reconstruct from parsed body (less secure but works)
        rawBody = JSON.stringify(req.body);
      }

      if (!rawBody) {
        console.error('Webhook: rawBody is missing. Headers:', {
          'x-polar-signature': signature,
          'x-polar-event': event,
          'content-type': getHeader('content-type'),
          'all-headers': Object.keys(headers),
        });
        return { success: false, message: 'Missing request body' };
      }

      const isValid = this.verifyWebhookSignature(
        rawBody,
        signature,
        webhookSecret,
      );

      if (!isValid) {
        console.error('Webhook signature verification failed:', {
          signature: signature?.substring(0, 20) + '...',
          hasSecret: !!webhookSecret,
          bodyLength: rawBody.length,
        });
        return { success: false, message: 'Invalid signature' };
      }
    } else if (webhookSecret && !signature) {
      // Try Standard Webhooks format if x-polar-* headers not found
      if (standardWebhookSignature && standardWebhookId) {
        // Use Standard Webhooks format - extract event from body or webhook-id
        // IMPORTANT: Use raw body as-is, don't JSON.stringify it (that changes the payload)
        const rawBody = req.rawBody
          ? typeof req.rawBody === 'string'
            ? req.rawBody
            : Buffer.isBuffer(req.rawBody)
              ? req.rawBody.toString('utf8')
              : JSON.stringify(req.rawBody)
          : JSON.stringify(req.body || {}); // Fallback only if rawBody not available

        const bodyData =
          typeof req.body === 'object' && req.body !== null
            ? (req.body as any)
            : {};
        const eventType =
          bodyData?.type || bodyData?.data?.type || standardWebhookId;

        // Verify Standard Webhooks signature (Svix format)
        // For development: skip verification if signature fails but log it
        let isValid = false;
        try {
          isValid = this.verifyStandardWebhookSignature(
            rawBody,
            standardWebhookSignature,
            standardWebhookTimestamp || '',
            webhookSecret,
            standardWebhookId || undefined,
          );
        } catch (error: any) {
          // Log the error
          this.logger.warn(
            `Signature verification error: ${error.message}`,
          );
          // In production, reject webhooks with invalid signatures
          const isProduction = this.configService.get('NODE_ENV') === 'production';
          if (isProduction) {
            return { success: false, message: 'Invalid webhook signature' };
          }
        }

        // In production, require valid signature
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        if (isProduction && !isValid) {
          return { success: false, message: 'Invalid webhook signature' };
        }

        if (eventType) {
          await this.subscriptionService.handleWebhook(
            eventType,
            bodyData?.data || bodyData,
          );
          return {
            success: true,
            message: isValid
              ? 'Webhook processed (Standard Webhooks format)'
              : 'Webhook processed (signature verification skipped - dev mode)',
          };
        }
      }

      this.logger.warn(
        'POLAR_WEBHOOK_SECRET configured but no signature header found. This might not be a Polar.sh webhook request.',
      );
      // Check if this looks like a test request (no Polar headers at all)
      const hasAnyPolarHeader =
        getHeader('x-polar-signature') ||
        getHeader('x-polar-event') ||
        getHeader('x-polar-timestamp') ||
        standardWebhookSignature;

      if (!hasAnyPolarHeader) {
        this.logger.warn(
          'Request appears to be a test/non-Polar request. Returning success for testing.',
        );
        return {
          success: true,
          message: 'Test request received (no Polar headers)',
        };
      }
    } else {
      // WARNING: Skipping signature verification is NOT recommended for production
      this.logger.warn(
        'POLAR_WEBHOOK_SECRET not configured, skipping signature verification (NOT RECOMMENDED)',
      );
    }

    const bodyData =
      typeof req.body === 'object' && req.body !== null
        ? (req.body as any)
        : {};
    const data = bodyData;

    // Event might be in body.type or body.data.type for Standard Webhooks
    const finalEvent =
      event || bodyData?.type || bodyData?.data?.type || standardWebhookId;

    if (!finalEvent) {
      this.logger.error(
        'Webhook: event type missing. This is not a valid Polar.sh webhook.',
      );
      this.logger.error('Request details:', {
        method: req.method,
        url: req.url,
        headers: Object.keys(allHeaders),
        bodyKeys: req.body ? Object.keys(req.body) : 'no body',
      });
      return {
        success: false,
        message: 'Missing event type - not a valid Polar.sh webhook',
      };
    }

    await this.subscriptionService.handleWebhook(
      finalEvent,
      data?.data || data,
    );

    return { success: true, message: 'Webhook processed' };
  }

  /**
   * Verify Standard Webhooks (Svix) format signature
   * Format: v1,<hex_digest>
   */
  private verifyStandardWebhookSignature(
    payload: string,
    signature: string,
    timestamp: string,
    secret: string,
    webhookId?: string,
  ): boolean {
    if (!signature || !timestamp || !secret) return false;

    try {
      // Svix/Polar.sh webhook secrets format: "whsec_<base64>" or "polar_whs_<base64>"
      // Extract and decode the secret part
      // IMPORTANT: The decoded secret is binary data, NOT a UTF-8 string
      let actualSecret: string | Buffer = secret;
      if (secret.startsWith('whsec_')) {
        // Standard Svix format: remove prefix and base64-decode to binary
        const secretPart = secret.substring(6); // Remove "whsec_"
        actualSecret = Buffer.from(secretPart, 'base64'); // Keep as Buffer (binary)
      } else if (secret.startsWith('polar_whs_')) {
        // Polar.sh format: remove prefix and base64-decode to binary
        const secretPart = secret.substring(10); // Remove "polar_whs_"
        actualSecret = Buffer.from(secretPart, 'base64'); // Keep as Buffer (binary)
      }
      // If secret doesn't start with a known prefix, use as-is (string)
      // Standard Webhooks (Svix) format: signature is "v1,<base64_digest>"
      // Signed payload format: timestamp + "." + payload
      // Signature is base64-encoded HMAC-SHA256, not hex
      // NOTE: Svix webhook-signature can contain multiple signatures: "v1,sig1 v1,sig2"
      // We need to check each signature until one matches
      const signatures = signature
        .split(' ')
        .map((s) => s.trim())
        .filter((s) => s);

      // Svix Standard Webhooks format: signed content = svix-id.svix-timestamp.raw-body
      // We use webhook-id, webhook-timestamp, and the raw payload
      const signedPayload = webhookId
        ? `${webhookId}.${timestamp}.${payload}`
        : `${timestamp}.${payload}`; // Fallback if webhook-id is missing

      // Try each signature (Svix can send multiple for secret rotation)
      for (const sig of signatures) {
        // Extract signature value from "v1,<signature>" format
        let signatureValue: string;
        if (sig.includes(',')) {
          const parts = sig.split(',');
          signatureValue = parts.length > 1 ? parts[1] : parts[0];
        } else if (sig.startsWith('v1')) {
          signatureValue = sig.substring(2);
        } else {
          signatureValue = sig;
        }

        // Use the processed secret (with prefix removed and decoded if needed)
        // actualSecret can be a Buffer (binary) or string
        const hmac = crypto.createHmac('sha256', actualSecret);
        hmac.update(signedPayload);
        const computedDigest = hmac.digest('base64');

        // Both signature and computed digest are now base64
        // Compare them directly (base64 strings)
        if (signatureValue.length !== computedDigest.length) {
          continue; // Try next signature
        }

        // Use timing-safe comparison for base64 strings
        const isValid = crypto.timingSafeEqual(
          Buffer.from(signatureValue, 'base64'),
          Buffer.from(computedDigest, 'base64'),
        );

        if (isValid) {
          return true; // Found a valid signature
        }
      }

      // None of the signatures matched
      return false;
    } catch (error) {
      console.error('Standard Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Verify Polar.sh webhook signature
   * Polar.sh uses Standard Webhooks format: sha256=<digest>
   */
  private verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    if (!signature || !secret) return false;

    try {
      // Polar.sh sends signature as "sha256=<digest>" or just the digest
      const signatureValue = signature.startsWith('sha256=')
        ? signature.substring(7)
        : signature;

      // Compute HMAC-SHA256
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      const computedDigest = hmac.digest('hex');

      // Compare signatures using timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(signatureValue, 'hex'),
        Buffer.from(computedDigest, 'hex'),
      );
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }
}

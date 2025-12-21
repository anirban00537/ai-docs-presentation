import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PolarService } from './services/polar.service';
import { CreditService } from './services/credit.service';
import { User } from '@prisma/client';
import {
  successResponse,
  errorResponse,
  processException,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { CreditBalanceResponseDto } from './dto/credit-balance-response.dto';
import { SubscriptionStatusDto } from './dto/subscription-status.dto';
import {
  FeatureResponseDto,
  BenefitResponseDto,
} from './dto/feature-response.dto';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly polarService: PolarService,
    private readonly creditService: CreditService,
  ) {}

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(user: User): Promise<ResponseModel> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      const creditBalance = await this.creditService.getCreditBalance(user.id);

      const now = new Date();
      const isSubscriptionValid =
        subscription &&
        (['active', 'trialing'].includes(subscription.status) ||
          (subscription.status === 'canceled' &&
            subscription.currentPeriodEnd &&
            new Date(subscription.currentPeriodEnd) > now));

      // Fetch product features if subscription has a productId
      let features: FeatureResponseDto | null = null;
      if (subscription?.productId && this.polarService.isConfigured()) {
        try {
          const product = await this.polarService.getProduct(
            subscription.productId,
          );
          if (product) {
            features = this.extractFeaturesFromProduct(product);
          }
        } catch (error) {
          this.logger.warn(
            `Failed to fetch product features for product ${subscription.productId}:`,
            error,
          );
        }
      }

      const status: SubscriptionStatusDto = {
        subscription: subscription
          ? (subscription as unknown as SubscriptionResponseDto)
          : null,
        creditBalance: creditBalance
          ? (creditBalance as unknown as CreditBalanceResponseDto)
          : null,
        isActive: !!isSubscriptionValid,
        hasCredits:
          creditBalance !== null && creditBalance.remainingCredits > 0,
        features,
      };

      return successResponse(
        'Subscription status retrieved successfully',
        status,
      );
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Get subscription features for a user
   */
  async getSubscriptionFeatures(user: User): Promise<ResponseModel> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (!subscription?.productId) {
        return successResponse('No active subscription found', {
          features: null,
          message: 'User does not have an active subscription',
        });
      }

      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      const product = await this.polarService.getProduct(
        subscription.productId,
      );
      if (!product) {
        return errorResponse('Product not found');
      }

      const features = this.extractFeaturesFromProduct(product);

      return successResponse(
        'Subscription features retrieved successfully',
        features,
      );
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Sync subscription from Polar.sh
   */
  async syncSubscriptionFromPolar(user: User): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      // Get or create customer in Polar
      const customer = await this.polarService.createOrGetCustomer(
        user.id,
        user.email,
        user.name || user.email,
      );

      if (!customer) {
        this.logger.error(
          `Sync error: Failed to find or create Polar customer for user ${user.id} (${user.email})`,
        );
        return errorResponse('Failed to create/get customer in Polar.sh');
      }

      this.logger.log(
        `Syncing subscription for user ${user.id} (Polar Customer: ${customer.id})`,
      );

      // Get active subscriptions
      const subscriptionsResponse =
        await this.polarService.getCustomerSubscriptions(customer.id);

      this.logger.debug(
        `Polar sync: Found ${JSON.stringify(subscriptionsResponse)} subscriptions for customer ${customer.id}`,
      );

      // Polar SDK returns a paginated response with items array,
      // sometimes under .result.items depending on version/method
      let activeSubscription = null;
      if (subscriptionsResponse) {
        const items =
          (subscriptionsResponse as any).result?.items ||
          (subscriptionsResponse as any).items ||
          [];

        // Find the "best" subscription. Order of preference: active > trialing > cancelling > past_due
        const priority = ['active', 'trialing', 'cancelling', 'past_due'];
        const validSubs = items.filter(
          (sub: any) =>
            priority.includes(sub.status) ||
            (sub.status === 'canceled' &&
              new Date(sub.current_period_end) > new Date()),
        );

        this.logger.log(
          `Found ${items.length} total subscriptions, ${validSubs.length} valid subscriptions for user ${user.id}`,
        );

        activeSubscription = validSubs.sort(
          (a: any, b: any) =>
            priority.indexOf(a.status) - priority.indexOf(b.status),
        )[0];

        if (activeSubscription) {
          this.logger.log(
            `Selected active subscription ${activeSubscription.id} with status ${activeSubscription.status}`,
          );
        }
      }

      if (!activeSubscription) {
        this.logger.warn(
          `No active subscription found for user ${user.id} in Polar.sh`,
        );
        // No active subscription, mark as inactive in local DB
        await this.prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            polarCustomerId: customer.id,
            status: 'inactive',
          },
          update: {
            status: 'inactive',
            polarCustomerId: customer.id,
          },
        });

        // Reset credits to 10 for inactive users
        this.logger.log(
          `Resetting credits to 10 for user ${user.id} due to inactive subscription`,
        );
        await this.creditService.updateMonthlyLimit(user.id, 10);

        return successResponse('Subscription synced successfully', {
          status: 'inactive',
        });
      }

      // Update or create subscription record
      // Safely extract fields whether they are camelCase (SDK) or snake_case (API)
      const currentPeriodStart =
        activeSubscription.currentPeriodStart ||
        activeSubscription.current_period_start;
      const currentPeriodEnd =
        activeSubscription.currentPeriodEnd ||
        activeSubscription.current_period_end;
      const cancelAtPeriodEnd =
        activeSubscription.cancelAtPeriodEnd ??
        activeSubscription.cancel_at_period_end ??
        false;
      const canceledAt =
        activeSubscription.canceledAt || activeSubscription.canceled_at;
      const productId =
        activeSubscription.productId ||
        activeSubscription.product?.id ||
        activeSubscription.product_id;
      const priceId =
        activeSubscription.priceId ||
        activeSubscription.price?.id ||
        activeSubscription.price_id;

      const subscription = await this.prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          polarSubscriptionId: activeSubscription.id,
          polarCustomerId: customer.id,
          status: activeSubscription.status,
          productId: productId,
          priceId: priceId,
          currentPeriodStart: currentPeriodStart
            ? new Date(currentPeriodStart)
            : null,
          currentPeriodEnd: currentPeriodEnd
            ? new Date(currentPeriodEnd)
            : null,
          cancelAtPeriodEnd: cancelAtPeriodEnd,
          canceledAt: canceledAt ? new Date(canceledAt) : null,
          metadata: activeSubscription.metadata || {},
        },
        update: {
          polarSubscriptionId: activeSubscription.id,
          polarCustomerId: customer.id,
          status: activeSubscription.status,
          productId: productId,
          priceId: priceId,
          currentPeriodStart: currentPeriodStart
            ? new Date(currentPeriodStart)
            : null,
          currentPeriodEnd: currentPeriodEnd
            ? new Date(currentPeriodEnd)
            : null,
          cancelAtPeriodEnd: cancelAtPeriodEnd,
          canceledAt: canceledAt ? new Date(canceledAt) : null,
          metadata: activeSubscription.metadata || {},
        },
      });

      // Update credit balance based on subscription
      if (activeSubscription.status === 'active') {
        const monthlyLimit = this.getMonthlyCreditLimit(
          activeSubscription.product?.id,
          activeSubscription,
        );
        await this.creditService.updateMonthlyLimit(user.id, monthlyLimit);
      }

      return successResponse('Subscription synced successfully', subscription);
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Cancel subscription
   * NOTE: Status remains 'active' until the period ends.
   * The 'canceled' status will be set by webhook when period ends.
   */
  async cancelSubscription(user: User): Promise<ResponseModel> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (!subscription) {
        return errorResponse('No subscription found');
      }

      if (!subscription.polarSubscriptionId) {
        return errorResponse('Subscription not linked to Polar.sh');
      }

      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      // Cancel in Polar.sh (at period end)
      await this.polarService.cancelSubscription(
        subscription.polarSubscriptionId,
        true, // cancel at period end
      );

      // Update local record - keep status as 'active' until period ends
      // The webhook will update status to 'canceled' or 'revoked' when period ends
      const updated = await this.prisma.subscription.update({
        where: { userId: user.id },
        data: {
          cancelAtPeriodEnd: true,
          // Don't change status - user still has access until period ends
        },
      });

      return successResponse(
        'Subscription will be canceled at the end of the billing period',
        updated,
      );
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Handle Polar.sh webhook events
   */
  async handleWebhook(event: string, data: any): Promise<void> {
    this.logger.log(`Webhook received: ${event}`);
    this.logger.debug(`Webhook data: ${JSON.stringify(data)}`);
    try {
      switch (event) {
        // Subscription lifecycle
        case 'subscription.created':
        case 'subscription.updated':
        case 'subscription.active':
          await this.handleSubscriptionUpdate(data);
          break;
        case 'subscription.canceled':
        case 'subscription.revoked':
          await this.handleSubscriptionCanceled(data);
          break;
        case 'subscription.uncanceled':
          await this.handleSubscriptionUncanceled(data);
          break;
        case 'subscription.past_due':
          await this.handleSubscriptionPastDue(data);
          break;

        // Customer lifecycle
        case 'customer.created':
        case 'customer.updated':
        case 'customer.deleted':
          await this.handleCustomerUpdate(data, event === 'customer.deleted');
          break;

        // Refunds
        case 'order.refunded':
          await this.handleOrderRefunded(data);
          break;

        // Usage-based billing
        case 'meter.usage_recorded':
          await this.handleMeterUsage(data);
          break;

        default:
          this.logger.log(`Unhandled webhook event: ${event}`);
      }
    } catch (error) {
      this.logger.error(`Error handling webhook ${event}:`, error);
      throw error;
    }
  }

  /**
   * Handle subscription update webhook
   */
  private async handleSubscriptionUpdate(data: any): Promise<void> {
    const polarSubscriptionId = data.id;
    this.logger.log(
      `Handling subscription update for Polar ID: ${polarSubscriptionId}`,
    );

    let subscription = await this.prisma.subscription.findUnique({
      where: { polarSubscriptionId },
    });

    // If subscription doesn't exist, try to find user and create it
    if (!subscription) {
      // Try to find user by customer email or external_id
      const customerEmail = data.customer?.email;
      const externalId = data.customer?.external_id;

      let user = null;

      if (externalId) {
        // Find user by external_id (which should be the user ID)
        user = await this.prisma.user.findUnique({
          where: { id: externalId },
        });
      }

      if (!user && customerEmail) {
        // Fallback: find user by email
        user = await this.prisma.user.findUnique({
          where: { email: customerEmail },
        });
      }

      if (!user) {
        this.logger.warn(
          `Subscription webhook: User not found for customer ${customerEmail || externalId}. Subscription ID: ${polarSubscriptionId}`,
        );
        return;
      }

      this.logger.log(
        `Found matching user ${user.id} for Polar subscription ${polarSubscriptionId}`,
      );

      // Create or update subscription record (use upsert to handle existing subscriptions)
      subscription = await this.prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          polarSubscriptionId: data.id,
          polarCustomerId: data.customer_id || data.customer?.id,
          status: data.status,
          productId: data.product_id || data.product?.id,
          priceId: data.price_id || data.price?.id,
          currentPeriodStart: data.current_period_start
            ? new Date(data.current_period_start)
            : null,
          currentPeriodEnd: data.current_period_end
            ? new Date(data.current_period_end)
            : null,
          cancelAtPeriodEnd: data.cancel_at_period_end || false,
          canceledAt: data.canceled_at ? new Date(data.canceled_at) : null,
          metadata: data.metadata || {},
        },
        update: {
          polarSubscriptionId: data.id,
          polarCustomerId: data.customer_id || data.customer?.id,
          status: data.status,
          productId: data.product_id || data.product?.id,
          priceId: data.price_id || data.price?.id,
          currentPeriodStart: data.current_period_start
            ? new Date(data.current_period_start)
            : null,
          currentPeriodEnd: data.current_period_end
            ? new Date(data.current_period_end)
            : null,
          cancelAtPeriodEnd: data.cancel_at_period_end || false,
          canceledAt: data.canceled_at ? new Date(data.canceled_at) : null,
          metadata: data.metadata || {},
        },
      });

      // Initialize credit balance for new subscriber
      await this.creditService.initializeCreditBalance(user.id);

      // Update monthly limit based on product metadata
      const monthlyLimit = this.getMonthlyCreditLimit(
        data.product_id || data.product?.id,
        data,
      );
      await this.creditService.updateMonthlyLimit(user.id, monthlyLimit);

      this.logger.log(
        `Created new subscription ${polarSubscriptionId} for user ${user.id}`,
      );
      return;
    }

    // Update existing subscription
    const previousStatus = subscription.status;
    const previousProductId = subscription.productId;
    const previousPeriodStart = subscription.currentPeriodStart
      ? new Date(subscription.currentPeriodStart).getTime()
      : 0;

    // Extract new values for comparison
    const newStatus = data.status;
    const newProductId = data.product_id || data.product?.id;
    const newPeriodStart = data.current_period_start
      ? new Date(data.current_period_start).getTime()
      : 0;

    await this.prisma.subscription.update({
      where: { polarSubscriptionId },
      data: {
        status: newStatus,
        productId: newProductId,
        priceId: data.price_id || data.price?.id,
        currentPeriodStart: data.current_period_start
          ? new Date(data.current_period_start)
          : null,
        currentPeriodEnd: data.current_period_end
          ? new Date(data.current_period_end)
          : null,
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
        canceledAt: data.canceled_at ? new Date(data.canceled_at) : null,
        metadata: data.metadata || {},
      },
    });

    // --- RENEWAL & PLAN CHANGE LOGIC ---

    // 1. Renewal: Period Start moved forward
    const isRenewal =
      newPeriodStart > previousPeriodStart &&
      (newStatus === 'active' || newStatus === 'trialing');

    // 2. Plan Change: Product ID is different
    const isPlanChange =
      newProductId !== previousProductId &&
      (newStatus === 'active' || newStatus === 'trialing');

    // 3. Reactivation: Status changed from inactive/past_due to active
    const isReactivation =
      (newStatus === 'active' || newStatus === 'trialing') &&
      previousStatus !== 'active' &&
      previousStatus !== 'trialing';

    if (isRenewal || isPlanChange || isReactivation) {
      if (isRenewal)
        this.logger.log(
          `Subscription RENEWAL detected for user ${subscription.userId}. Resetting credits.`,
        );
      if (isPlanChange)
        this.logger.log(
          `Subscription PLAN CHANGE detected for user ${subscription.userId}. Updating limit.`,
        );
      if (isReactivation)
        this.logger.log(
          `Subscription REACTIVATION detected for user ${subscription.userId}. Resetting credits.`,
        );

      const monthlyLimit = this.getMonthlyCreditLimit(newProductId, data);
      await this.creditService.updateMonthlyLimit(
        subscription.userId,
        monthlyLimit,
      );
    } else {
      this.logger.debug(
        `Minor subscription update for user ${subscription.userId} (No credit reset required)`,
      );
    }
  }

  /**
   * Handle subscription canceled webhook
   */
  private async handleSubscriptionCanceled(data: any): Promise<void> {
    const polarSubscriptionId = data.id;
    this.logger.log(
      `Handling subscription CANCELED/REVOKED: ${polarSubscriptionId}`,
    );

    // Find the subscription to get the userId
    const subscription = await this.prisma.subscription.findUnique({
      where: { polarSubscriptionId },
    });

    if (subscription?.userId) {
      this.logger.log(
        `Subscription ${polarSubscriptionId} ended for user ${subscription.userId}. Resetting credits to 10.`,
      );
      await this.creditService.updateMonthlyLimit(subscription.userId, 10);
    }

    await this.prisma.subscription.updateMany({
      where: { polarSubscriptionId },
      data: {
        status: data.status || 'canceled',
        canceledAt: data.canceled_at ? new Date(data.canceled_at) : new Date(),
        cancelAtPeriodEnd: data.cancel_at_period_end || true,
      },
    });
  }

  /**
   * Handle customer update webhook
   */
  private async handleCustomerUpdate(
    data: any,
    isDeleted = false,
  ): Promise<void> {
    // Handle customer updates if needed
    if (isDeleted) {
      this.logger.log(
        `CUSTOMER DELETED: ${data.id}. Marking associated subscriptions as inactive.`,
      );
      // Find subscription for this customer and mark as inactive
      const polarCustomerId = data.id;
      if (polarCustomerId) {
        await this.prisma.subscription.updateMany({
          where: { polarCustomerId },
          data: { status: 'inactive' },
        });
      }
    } else {
      this.logger.log(`Customer update: ${data.id}`);
    }
  }

  /**
   * Handle subscription uncanceled webhook
   * Fired when a user reactivates a subscription before period end
   */
  private async handleSubscriptionUncanceled(data: any): Promise<void> {
    const polarSubscriptionId = data.id;
    this.logger.log(`Subscription uncanceled: ${polarSubscriptionId}`);

    const updated = await this.prisma.subscription.updateMany({
      where: { polarSubscriptionId },
      data: {
        status: 'active',
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    if (updated.count > 0) {
      this.logger.log(`Reactivated subscription ${polarSubscriptionId}`);
    }
  }

  /**
   * Handle subscription past_due webhook
   * Fired when a payment fails and subscription enters grace period
   */
  private async handleSubscriptionPastDue(data: any): Promise<void> {
    const polarSubscriptionId = data.id;
    this.logger.warn(`Subscription past due: ${polarSubscriptionId}`);

    await this.prisma.subscription.updateMany({
      where: { polarSubscriptionId },
      data: {
        status: 'past_due',
      },
    });
  }

  /**
   * Handle order refunded webhook
   * Fired when a payment is refunded
   */
  private async handleOrderRefunded(data: any): Promise<void> {
    this.logger.log(`Order refunded: ${data.id}`);

    // Get customer info from the order
    const customerId = data.customer_id || data.customer?.id;
    const externalId = data.customer?.external_id;

    if (!customerId && !externalId) {
      this.logger.warn('Order refunded but no customer info found');
      return;
    }

    // Find the user
    let userId: string | null = null;

    if (externalId) {
      // external_id is the user ID
      userId = externalId;
    } else if (customerId) {
      // Find subscription by polar customer ID to get user
      const subscription = await this.prisma.subscription.findFirst({
        where: { polarCustomerId: customerId },
      });
      userId = subscription?.userId || null;
    }

    if (!userId) {
      this.logger.warn(`Could not find user for refunded order: ${data.id}`);
      return;
    }

    // Calculate refund amount in credits (you may want to adjust this logic)
    // For now, we'll mark the subscription as refunded
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (subscription) {
      // If this is a full refund, cancel the subscription
      const refundAmount = data.amount || data.refund_amount || 0;
      const orderAmount = data.order_amount || data.amount || 0;

      if (refundAmount >= orderAmount) {
        // Full refund - cancel subscription
        await this.prisma.subscription.update({
          where: { userId },
          data: {
            status: 'refunded',
            canceledAt: new Date(),
          },
        });
        this.logger.log(`Subscription ${subscription.id} marked as refunded`);
      }
    }
  }

  /**
   * Handle meter usage webhook (for usage-based billing)
   */
  private async handleMeterUsage(data: any): Promise<void> {
    // Handle meter usage if you're using usage-based billing
    this.logger.log(`Meter usage recorded: ${data.id}`);
  }

  /**
   * Extract features from Polar product data
   */
  extractFeaturesFromProduct(product: any): FeatureResponseDto {
    const productAny = product as any;

    // Extract benefits - handle both camelCase and snake_case
    const benefits: BenefitResponseDto[] = (
      product.benefits ||
      productAny.benefits ||
      []
    ).map((benefit: any) => {
      const benefitAny = benefit as any;
      return {
        id: benefit.id || benefitAny.id,
        type: benefit.type || benefitAny.type,
        description: benefit.description || benefitAny.description,
        selectable: benefit.selectable ?? benefitAny.selectable ?? true,
        metadata: benefit.metadata || benefitAny.metadata || {},
        properties: benefit.properties || benefitAny.properties || {},
      };
    });

    // Extract metadata
    const metadata = product.metadata || productAny.metadata || {};

    // Build feature list from benefits and metadata
    const features: string[] = [];

    // Add benefit descriptions as features
    benefits.forEach((benefit) => {
      if (benefit.description) {
        features.push(benefit.description);
      }
    });

    // Define known metadata keys with custom formatting
    const knownMetadataFormatters: Record<string, (value: any) => string> = {
      ai_credits: (v) => `${v} AI Credits per month`,
      max_slides: (v) => `Up to ${v} Slides per presentation`,
      max_presentations: (v) => `Up to ${v} Presentations`,
      presentations: (v) => `Up to ${v} Presentations`,
      beautiful_ai_images: (v) =>
        v === 'true' || v === true ? 'Beautiful AI-Generated Images' : '',
      ai_images: (v) =>
        v === 'true' || v === true ? 'Beautiful AI-Generated Images' : '',
      white_label: (v) =>
        v === 'true' || v === true ? 'White Label / No Branding' : '',
      no_branding: (v) =>
        v === 'true' || v === true ? 'White Label / No Branding' : '',
      unlimited_access: (v) =>
        v === 'true' || v === true || v ? 'Unlimited Access' : '',
      unlimited: (v) =>
        v === 'true' || v === true || v ? 'Unlimited Access' : '',
      priority_support: (v) =>
        v === 'true' || v === true || v ? 'Priority Support' : '',
      advanced_features: (v) =>
        v === 'true' || v === true || v ? 'Advanced Features' : '',
      advanced: (v) =>
        v === 'true' || v === true || v ? 'Advanced Features' : '',
      api_access: (v) => (v === 'true' || v === true || v ? 'API Access' : ''),
      api: (v) => (v === 'true' || v === true || v ? 'API Access' : ''),
      custom_templates: (v) =>
        v === 'true' || v === true || v ? 'Custom Templates' : '',
      templates: (v) =>
        v === 'true' || v === true || v ? 'Custom Templates' : '',
      export_formats: (v) => `Export Formats: ${v}`,
      storage_gb: (v) => `${v} GB Storage`,
      storage: (v) => `${v} GB Storage`,
      team_size: (v) => `Team Collaboration (${v || 'Unlimited'} members)`,
      collaboration: (v) =>
        v === 'true' || v === true || v
          ? `Team Collaboration (${metadata.team_size || 'Unlimited'} members)`
          : '',
      branding: (v) =>
        v && metadata.white_label !== 'true' ? 'Custom Branding' : '',
      analytics: (v) =>
        v === 'true' || v === true || v ? 'Advanced Analytics' : '',
      webhooks: (v) =>
        v === 'true' || v === true || v ? 'Webhook Integration' : '',
      sso: (v) =>
        v === 'true' || v === true || v ? 'Single Sign-On (SSO)' : '',
      single_sign_on: (v) =>
        v === 'true' || v === true || v ? 'Single Sign-On (SSO)' : '',
      backup: (v) =>
        v === 'true' || v === true || v ? 'Automated Backups' : '',
      backups: (v) =>
        v === 'true' || v === true || v ? 'Automated Backups' : '',
      version_history: (v) => `Version History (${v} versions)`,
      plan_name: (v) =>
        `${String(v).charAt(0).toUpperCase() + String(v).slice(1)} Plan`,
    };

    // Track features to avoid duplicates
    const featureSet = new Set<string>();

    // Process all metadata fields dynamically
    Object.entries(metadata).forEach(([key, value]) => {
      // Skip empty values
      if (value === null || value === undefined || value === '') {
        return;
      }

      // Use known formatter if available
      if (knownMetadataFormatters[key]) {
        const formatted = knownMetadataFormatters[key](value);
        if (formatted && !featureSet.has(formatted)) {
          features.push(formatted);
          featureSet.add(formatted);
        }
        // Continue to process even if we have a formatter, to handle aliases
        // But skip if this is an alias that would produce duplicate output
        // (e.g., ai_images and beautiful_ai_images both produce same output)
        return;
      }

      // For unknown metadata keys, create a human-readable feature
      // Convert snake_case to Title Case and format the value
      const formattedKey = key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Format value based on type
      let formattedValue: string;
      if (value === 'true' || value === true) {
        formattedValue = formattedKey;
      } else if (value === 'false' || value === false) {
        // Skip false values
        return;
      } else if (typeof value === 'number') {
        formattedValue = `${formattedKey}: ${value}`;
      } else {
        // For string values, check if it's a numeric string
        const stringValue = String(value);
        const trimmed = stringValue.trim();
        if (
          trimmed !== '' &&
          !isNaN(Number(trimmed)) &&
          !isNaN(parseFloat(trimmed))
        ) {
          // It's a numeric string, format as number
          formattedValue = `${formattedKey}: ${Number(trimmed)}`;
        } else {
          // Regular string value
          formattedValue = `${formattedKey}: ${trimmed}`;
        }
      }

      // Only add if not already in the set (avoid duplicates)
      if (formattedValue && !featureSet.has(formattedValue)) {
        features.push(formattedValue);
        featureSet.add(formattedValue);
      }
    });

    // Remove duplicates from features array (in case of any edge cases)
    const uniqueFeatures = Array.from(new Set(features));

    return {
      productId: product.id,
      productName: product.name || productAny.name,
      productDescription: product.description || productAny.description,
      benefits,
      metadata,
      features: uniqueFeatures.length > 0 ? uniqueFeatures : undefined,
    };
  }

  /**
   * Get monthly credit limit based on product ID or metadata
   * prioritized metadata from Polar.sh
   */
  private getMonthlyCreditLimit(productId?: string, data?: any): number {
    // Polar puts metadata either in the root data or under product
    const metadata = data?.metadata || data?.product?.metadata || {};
    let metadataLimit = metadata.ai_credits;

    // Direct check if metadata property exists on the object passed
    if (!metadataLimit && (data as any).metadata?.ai_credits) {
      metadataLimit = (data as any).metadata.ai_credits;
    }

    if (metadataLimit) {
      const parsed = parseInt(String(metadataLimit), 10);
      if (!isNaN(parsed) && parsed > 0) {
        this.logger.log(
          `CREDIT ASSIGNMENT [METADATA]: Assigning ${parsed} credits to user from product ${productId}`,
        );
        return parsed;
      }
    }

    // 2. Fallback to hardcoded limits - configure these based on your Polar.sh products
    const limits: Record<string, number> = {
      // Go Plan: 3000 credits for the $10 package
      'b0d421eb-615c-4ef8-9053-1a8449afbcc0': 3000,
      // Plus Plan: 10000 credits for the $20 package
      '308587ed-b4a0-469b-bfbc-89713a380bb3': 10000,
      // Pro Plan: 50000 credits for the $50 package
      'ecbe461f-0b80-486c-9ee1-5943b55922d3': 50000,
    };

    const limit = limits[productId || ''] || 0;
    if (limit > 0) {
      this.logger.log(
        `CREDIT ASSIGNMENT [FALLBACK]: Assigning ${limit} hardcoded credits for product ${productId}`,
      );
    } else {
      this.logger.warn(
        `CREDIT ASSIGNMENT [NONE]: No limit found for product ${productId} in metadata or fallbacks`,
      );
    }

    return limit;
  }

  /**
   * Get credit balance
   */
  async getCreditBalance(user: User): Promise<ResponseModel> {
    try {
      const balance = await this.creditService.getCreditBalance(user.id);

      // Simplify the response for the user
      const simplifiedBalance = {
        id: balance.id,
        userId: balance.userId,
        // The main balance is 'remainingCredits'
        remainingCredits: balance.remainingCredits,
        // Show total available in the current bucket
        totalCredits: Math.max(balance.totalCredits, balance.monthlyLimit),
        // Usage tracker
        monthlyUsed: balance.monthlyUsed,
        monthlyLimit: balance.monthlyLimit,
        lastResetAt: balance.lastResetAt,
        updatedAt: balance.updatedAt,
      };

      return successResponse(
        'Credit balance retrieved successfully',
        simplifiedBalance,
      );
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Use credits
   */
  async useCredits(
    user: User,
    amount: number,
    description?: string,
    presentationId?: string,
  ): Promise<ResponseModel> {
    try {
      await this.creditService.useCredits(
        user.id,
        amount,
        description,
        presentationId,
      );

      return this.getCreditBalance(user);
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Get available products/pricing plans
   */
  async getProducts(): Promise<ResponseModel> {
    this.logger.log('Fetching products from Polar.sh...');
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      const productsResponse = await this.polarService.listProducts();
      if (!productsResponse) {
        return errorResponse(
          'Failed to fetch products from Polar.sh. Please check your POLAR_ACCESS_TOKEN is valid and not expired.',
        );
      }

      // Transform products to include credit limits
      // Polar SDK returns a paginated response with items array
      const products: any[] = [];

      // Handle both direct items array and paginated response
      let items: any[] = [];

      // Check if it's a response object with items property
      // Polar SDK returns: { result: { items: [...] }, next: ..., ~next: ... }
      if (productsResponse && typeof productsResponse === 'object') {
        // Check for result.items (Polar SDK structure)
        if ((productsResponse as any).result?.items !== undefined) {
          const itemsValue = (productsResponse as any).result.items;
          if (Array.isArray(itemsValue)) {
            items = itemsValue;
          } else {
            // Try to convert iterator or other structure to array
            try {
              items = Array.from(itemsValue || []);
            } catch (e) {
              console.error('Failed to convert items to array:', e);
              return errorResponse(
                'Invalid products response format from Polar.sh',
              );
            }
          }
        } else if ((productsResponse as any).items !== undefined) {
          // Fallback: direct items property
          const itemsValue = (productsResponse as any).items;
          if (Array.isArray(itemsValue)) {
            items = itemsValue;
          } else {
            try {
              items = Array.from(itemsValue || []);
            } catch (e) {
              console.error('Failed to convert items to array:', e);
              return errorResponse(
                'Invalid products response format from Polar.sh',
              );
            }
          }
        } else if (Array.isArray(productsResponse)) {
          // Direct array response
          items = productsResponse;
        } else {
          // Unknown structure - log it for debugging
          console.error('Unknown products response structure:', {
            type: typeof productsResponse,
            keys: Object.keys(productsResponse || {}),
            sample: JSON.stringify(productsResponse).substring(0, 200),
          });
          return errorResponse(
            'Invalid products response format from Polar.sh',
          );
        }
      } else {
        return errorResponse('Invalid products response from Polar.sh');
      }

      if (!Array.isArray(items)) {
        console.error(
          `Products response items is not an array. Type: ${typeof items}`,
        );
        return errorResponse('Invalid products response format from Polar.sh');
      }

      products.push(
        ...items.map((product: any) => {
          // Polar SDK returns snake_case, handle both formats
          const prices = (product.prices || []).map((price: any) => ({
            id: price.id,
            productId: product.id,
            amountType: price.amountType || price.amount_type || 'fixed',
            priceAmount: price.priceAmount || price.price_amount || 0,
            priceCurrency: price.priceCurrency || price.price_currency || 'usd',
            metadata: price.metadata || {},
          }));

          // Extract benefits
          const benefits: BenefitResponseDto[] = (product.benefits || []).map(
            (benefit: any) => ({
              id: benefit.id,
              type: benefit.type,
              description: benefit.description,
              selectable: benefit.selectable ?? true,
              metadata: benefit.metadata || {},
              properties: benefit.properties || {},
            }),
          );

          // Extract features
          const features = this.extractFeaturesFromProduct(product);

          return {
            id: product.id,
            name: product.name,
            description: product.description || null,
            isArchived: product.isArchived || product.is_archived || false,
            recurringInterval:
              product.recurringInterval || product.recurring_interval,
            recurringIntervalCount:
              product.recurringIntervalCount ||
              product.recurring_interval_count ||
              1,
            prices,
            benefits,
            metadata: product.metadata || {},
            features: features.features,
            createdAt: product.createdAt || product.created_at,
            updatedAt:
              (product as any).updatedAt ||
              (product as any).updated_at ||
              product.createdAt ||
              product.created_at,
            // Add credit limit based on product metadata or configuration
            monthlyCreditLimit: this.getMonthlyCreditLimit(product.id, product),
          };
        }),
      );

      // Sort products by price (lowest first)
      if (products.length > 0) {
        products.sort((a, b) => {
          // Find minimum price for each product
          const getMinPrice = (p: any) => {
            if (!p.prices || p.prices.length === 0) return 999999;
            return Math.min(...p.prices.map((pr: any) => pr.priceAmount || 0));
          };

          const priceA = getMinPrice(a);
          const priceB = getMinPrice(b);

          if (priceA !== priceB) {
            return priceA - priceB;
          }

          // Fallback to name if prices are equal
          return (a.name || '').localeCompare(b.name || '');
        });

        this.logger.log(
          `Products sorted by price. Order: ${products.map((p) => `${p.name} ($${(p.prices?.[0]?.priceAmount || 0) / 100})`).join(', ')}`,
        );
      }

      return successResponse(
        `Products retrieved successfully (${new Date().toISOString()})`,
        products,
      );
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      const product = await this.polarService.getProduct(productId);
      if (!product) {
        return errorResponse('Product not found');
      }

      // Polar SDK returns snake_case properties
      const prices = (product.prices || []).map((price: any) => ({
        id: price.id,
        productId: product.id,
        amountType: price.amountType || price.amount_type || 'fixed',
        priceAmount: price.priceAmount || price.price_amount || 0,
        priceCurrency: price.priceCurrency || price.price_currency || 'usd',
        metadata: price.metadata || {},
      }));

      // Cast to any to access both camelCase and snake_case properties
      const productAny = product as any;

      // Extract benefits
      const benefits: BenefitResponseDto[] = (
        (product as any).benefits || []
      ).map((benefit: any) => ({
        id: benefit.id,
        type: benefit.type,
        description: benefit.description,
        selectable: benefit.selectable ?? true,
        metadata: benefit.metadata || {},
        properties: benefit.properties || {},
      }));

      // Extract features
      const features = this.extractFeaturesFromProduct(product);

      const productData = {
        id: product.id,
        name: product.name,
        description: product.description || null,
        isArchived: product.isArchived || productAny.is_archived || false,
        recurringInterval:
          product.recurringInterval || productAny.recurring_interval,
        recurringIntervalCount:
          product.recurringIntervalCount ||
          productAny.recurring_interval_count ||
          1,
        prices,
        benefits,
        metadata: product.metadata || {},
        features: features.features,
        createdAt: product.createdAt || productAny.created_at,
        updatedAt:
          productAny.updatedAt ||
          productAny.updated_at ||
          product.createdAt ||
          productAny.created_at,
        monthlyCreditLimit: this.getMonthlyCreditLimit(product.id),
      };

      return successResponse('Product retrieved successfully', productData);
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Create checkout session for a product
   */
  async createCheckout(
    user: User,
    productId: string,
    successUrl?: string,
  ): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      // Ensure customer exists in Polar
      const customer = await this.polarService.createOrGetCustomer(
        user.id,
        user.email,
        user.name || user.email,
      );

      if (!customer) {
        return errorResponse('Failed to create/get customer in Polar.sh');
      }

      // Create checkout session
      const checkout = await this.polarService.createCheckout(
        productId,
        user.email,
        successUrl,
      );

      if (!checkout) {
        return errorResponse('Failed to create checkout session');
      }

      // Return checkout URL - Polar SDK returns checkout object with url property
      const checkoutUrl =
        (checkout as any).url || (checkout as any).checkout_url || null;

      if (!checkoutUrl) {
        this.logger.error('Checkout created but no URL found:', checkout);
        return errorResponse('Checkout created but URL not available');
      }

      return successResponse('Checkout session created successfully', {
        checkoutUrl,
        checkoutId: (checkout as any).id,
      });
    } catch (error: any) {
      this.logger.error(`Failed to create checkout: ${error.message}`, error);
      return errorResponse(
        error.message || 'Failed to create checkout session',
      );
    }
  }
}

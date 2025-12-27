import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';

// Use centralized constant
const FREE_TIER_CREDITS = coreConstant.CREDITS.FREE_TIER;

@Injectable()
export class CreditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialize credit balance for a user
   */
  async initializeCreditBalance(userId: string, initialBalance: number = 30): Promise<void> {
    const existing = await this.prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!existing) {
      console.log(`[CREDIT_SERVICE] Initializing new credit balance for user ${userId} with ${initialBalance} credits`);
      await this.prisma.creditBalance.create({
        data: {
          userId,
          balance: initialBalance,
          quota: initialBalance,
          lastResetAt: new Date(),
        },
      });
    }
  }

  /**
    * Get credit balance for a user
    */
  async getCreditBalance(userId: string) {
    let balance = await this.prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      await this.initializeCreditBalance(userId);
      balance = await this.prisma.creditBalance.findUnique({
        where: { userId },
      });
    }

    return balance;
  }

  /**
    * Check if user has enough credits
    */
  async hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const balance = await this.getCreditBalance(userId);
    if (!balance) return false;

    return balance.balance >= requiredCredits;
  }

  /**
    * Use credits
    */
  async useCredits(
    userId: string,
    amount: number,
    description?: string,
    presentationId?: string,
  ): Promise<void> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException(
        `Invalid credit amount: ${amount}. Must be a positive integer.`,
      );
    }

    console.log(`[CREDIT_SERVICE] User ${userId} using ${amount} credits: ${description || 'No description'}`);
    
    await this.prisma.$transaction(async (tx) => {
      const balance = await tx.creditBalance.findUnique({
        where: { userId },
      });

      if (!balance) {
        throw new NotFoundException('Credit balance not found');
      }

      if (balance.balance < amount) {
        throw new BadRequestException(
          `Insufficient credits. Available: ${balance.balance}, Required: ${amount}`,
        );
      }

      const newBalance = balance.balance - amount;

      await tx.creditBalance.update({
        where: { userId },
        data: {
          balance: newBalance,
          usedCredits: {
            increment: amount,
          }
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -amount,
          type: 'usage',
          description: description || 'Credits used',
          presentationId,
          balanceAfter: newBalance,
        },
      });
    });
  }

  /**
    * Update credits based on subscription change
    * Logic: 
    * 1. Active subscription with valid period (not expired) -> User upgrades/renews: ADD credits to remaining balance
    * 2. Expired/No subscription -> New/Reactivation: REPLACE with new quota
    * 
    * @param userId - The user ID
    * @param newLimit - The new credit limit from the plan
    * @param options - Configuration options
    * @param options.forceReplace - If true, always replace instead of adding
    * @param options.previousPeriodEnd - The END date of the PREVIOUS subscription period (before update)
    */
  async updateCreditsFromSubscription(
    userId: string,
    newLimit: number,
    options?: {
      forceReplace?: boolean;
      previousPeriodEnd?: Date | null;
    },
  ): Promise<void> {
    const forceReplace = options?.forceReplace ?? false;
    const previousPeriodEnd = options?.previousPeriodEnd;
    
    console.log(
      `[CREDIT_SERVICE] Syncing credits for user ${userId} to ${newLimit} (forceReplace: ${forceReplace}, previousPeriodEnd: ${previousPeriodEnd})`,
    );

    await this.prisma.$transaction(async (tx) => {
      const existingBalance = await tx.creditBalance.findUnique({
        where: { userId },
      });

      const now = new Date();

      // Check if the PREVIOUS subscription period was still valid (not expired)
      // This determines if we should roll over remaining credits
      const hadValidActivePeriod = 
        previousPeriodEnd && 
        new Date(previousPeriodEnd) > now;

      let finalBalance: number;
      let updateDescription: string;
      let isActuallyAdding: boolean = false;

      console.log(
        `[CREDIT_SERVICE] Rollover Decision: userId=${userId}, previousPeriodEnd=${previousPeriodEnd}, isStillValid=${hadValidActivePeriod}, existingBalance=${existingBalance?.balance}, existingQuota=${existingBalance?.quota}`,
      );

      // We ADD credits ONLY if:
      // 1. The previous subscription period was still valid (not expired)
      // 2. User has an existing balance
      // 3. We're not forcing a replacement
      if (hadValidActivePeriod && existingBalance && !forceReplace) {
        // Upgrade/Mid-cycle renewal: Add to existing balance (rollover)
        finalBalance = existingBalance.balance + newLimit;
        updateDescription = `Plan upgrade: +${newLimit} credits added to existing ${existingBalance.balance} (rollover)`;
        isActuallyAdding = true;
        console.log(
          `[CREDIT_SERVICE] Action: ADDING (rollover). Previous period still valid. New Balance: ${finalBalance}`,
        );
      } else {
        // New subscription, expired period, or forced sync: Replace with new quota
        finalBalance = newLimit;
        if (forceReplace) {
          updateDescription = `Plan sync: Adjusted balance to ${newLimit} credits`;
        } else if (!previousPeriodEnd) {
          updateDescription = `New subscription: Set balance to ${newLimit} credits`;
        } else {
          updateDescription = `New billing cycle: Set balance to ${newLimit} credits (previous period expired)`;
        }
        isActuallyAdding = false;
        console.log(
          `[CREDIT_SERVICE] Action: REPLACING. Reason: ${!previousPeriodEnd ? 'No previous period' : hadValidActivePeriod ? 'Force replace' : 'Previous period expired'}. New Balance: ${finalBalance}`,
        );
      }

      if (!existingBalance) {
        console.log(`[CREDIT_SERVICE] Creating new credit balance record for user ${userId}`);
        await tx.creditBalance.create({
          data: {
            userId,
            balance: finalBalance,
            quota: newLimit,
            usedCredits: 0,
            lastResetAt: new Date(),
          },
        });
      } else {
        console.log(`[CREDIT_SERVICE] Updating existing credit balance record for user ${userId}`);
        await tx.creditBalance.update({
          where: { userId },
          data: {
            balance: finalBalance,
            quota: newLimit,
            usedCredits: 0,
            lastResetAt: new Date(),
          },
        });
      }

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: isActuallyAdding ? newLimit : finalBalance,
          type: 'purchase',
          description: updateDescription,
          balanceAfter: finalBalance,
        },
      });
      console.log(`[CREDIT_SERVICE] Credit sync completed for user ${userId}. Final balance: ${finalBalance}`);
    });
  }

  /**
   * Get credit transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 50) {
    return this.prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Reset credits to free tier (convenience method)
   * Use this when a subscription is canceled, expired, or revoked
   */
  async resetToFreeTier(userId: string): Promise<void> {
    await this.updateCreditsFromSubscription(userId, FREE_TIER_CREDITS, { 
      previousPeriodEnd: null 
    });
  }
}

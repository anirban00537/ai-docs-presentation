import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Constants for credit management
const FREE_TIER_CREDITS = 10;

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
    * 1. Active Upgrade (Active -> New Plan): balance = balance + newLimit
    * 2. New/Reactivation (Inactive -> Plan): balance = newLimit
    */
  async updateCreditsFromSubscription(
    userId: string,
    newLimit: number,
    forceReplace: boolean = false,
  ): Promise<void> {
    console.log(
      `[CREDIT_SERVICE] Syncing credits for user ${userId} to ${newLimit} (forceReplace: ${forceReplace})`,
    );

    await this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({
        where: { userId },
      });

      const existingBalance = await tx.creditBalance.findUnique({
        where: { userId },
      });

      const now = new Date();

      // Check if they have a valid active period currently
      const hasActiveSubscription =
        subscription &&
        ['active', 'trialing'].includes(subscription.status) &&
        subscription.currentPeriodEnd &&
        new Date(subscription.currentPeriodEnd) > now;

      let finalBalance: number;
      let updateDescription: string;
      let isActuallyAdding: boolean = false;

      console.log(
        `[CREDIT_SERVICE] Sync Trace: userId=${userId}, hasActiveSub=${hasActiveSubscription}, existingBalance=${existingBalance?.balance}, existingQuota=${existingBalance?.quota}`,
      );

      // We ADD credits if it's an active subscription AND we are not forcing a replacement
      if (hasActiveSubscription && existingBalance && !forceReplace) {
        // Upgrade/Renewal: Add to existing balance
        finalBalance = existingBalance.balance + newLimit;
        updateDescription = `Plan update: +${newLimit} credits added to balance`;
        isActuallyAdding = true;
        console.log(
          `[CREDIT_SERVICE] Action: ADDING. New Balance: ${finalBalance}`,
        );
      } else {
        // New, Reactivation, or Forced Sync: Replace existing balance
        finalBalance = newLimit;
        updateDescription = forceReplace 
          ? `Plan sync: Adjusted balance to ${newLimit} credits`
          : `New credit cycle: Set balance to ${newLimit} credits`;
        isActuallyAdding = false;
        console.log(
          `[CREDIT_SERVICE] Action: REPLACING. New Balance: ${finalBalance}`,
        );
      }

      if (!existingBalance) {
        console.log(`[CREDIT_SERVICE] Creating new record for user ${userId}`);
        await tx.creditBalance.create({
          data: {
            userId,
            balance: finalBalance,
            quota: newLimit,
            lastResetAt: new Date(),
          },
        });
      } else {
        console.log(`[CREDIT_SERVICE] Updating existing record for user ${userId}`);
        await tx.creditBalance.update({
          where: { userId },
          data: {
            balance: finalBalance,
            quota: newLimit,
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
      console.log(`[CREDIT_SERVICE] Sync completed for user ${userId}`);
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
}


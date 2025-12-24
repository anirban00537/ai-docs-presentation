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
  async initializeCreditBalance(userId: string, freeCredits: number = FREE_TIER_CREDITS): Promise<void> {
    const existing = await this.prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!existing) {
      console.log(`[CREDIT_SERVICE] Initializing new credit balance for user ${userId} with ${freeCredits} free credits`);
      await this.prisma.creditBalance.create({
        data: {
          userId,
          totalCredits: freeCredits,
          remainingCredits: freeCredits,
          monthlyLimit: 0,
          monthlyUsed: 0,
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

    // Check if the user has an active/valid subscription period
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const now = new Date();
    const isExpired = subscription && 
                      subscription.currentPeriodEnd && 
                      new Date(subscription.currentPeriodEnd) < now &&
                      !['active', 'trialing'].includes(subscription.status);

    if (isExpired && balance.remainingCredits > FREE_TIER_CREDITS) {
      console.warn(`[CREDIT_SERVICE] User ${userId} has expired subscription. Blocking high credit usage.`);
      // If expired, they shouldn't be using high balances that haven't been reset yet
      // They are only allowed to use up to 10 (the free tier)
      return false;
    }

    const hasEnough = balance.remainingCredits >= requiredCredits;
    if (!hasEnough) {
      console.warn(`[CREDIT_SERVICE] Insufficient balance for user ${userId}: Has ${balance.remainingCredits}, Needs ${requiredCredits}`);
    }
    return hasEnough;
  }

  /**
    * Use credits (deducts from free credits first, then paid credits)
    * Uses a database transaction to prevent race conditions
    */
  async useCredits(
    userId: string,
    amount: number,
    description?: string,
    presentationId?: string,
  ): Promise<void> {
    // Validate amount - must be positive integer
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException(
        `Invalid credit amount: ${amount}. Must be a positive integer.`,
      );
    }

    console.log(`[CREDIT_SERVICE] Attempting to use ${amount} credits for user ${userId} (${description || 'No description'})`);
    
    // Use a transaction to prevent race conditions
    await this.prisma.$transaction(async (tx) => {
      // Get the current balance within the transaction
      const balance = await tx.creditBalance.findUnique({
        where: { userId },
      });

      if (!balance) {
        throw new NotFoundException('Credit balance not found');
      }

      if (balance.remainingCredits < amount) {
        throw new BadRequestException(
          `Insufficient credits. Required: ${amount}, Available: ${balance.remainingCredits}`,
        );
      }

      const newRemainingCredits = balance.remainingCredits - amount;
      const newMonthlyUsed = balance.monthlyUsed + amount;

      await tx.creditBalance.update({
        where: { userId },
        data: {
          remainingCredits: newRemainingCredits,
          monthlyUsed: newMonthlyUsed,
          usedCredits: {
            increment: amount,
          }
        },
      });

      console.log(`[CREDIT_SERVICE] Success: User ${userId} used ${amount} credits. New balance: ${newRemainingCredits}`);

      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -amount,
          type: 'usage',
          description: description || 'Credits used',
          presentationId,
          balanceAfter: newRemainingCredits,
        },
      });
    });
  }

  /**
    * Add credits to user's balance
    * Uses a database transaction to prevent race conditions
    */
  async addCredits(
    userId: string,
    amount: number,
    type: 'purchase' | 'bonus' | 'refund' = 'purchase',
    description?: string,
    subscriptionId?: string,
  ): Promise<void> {
    // Validate amount - must be positive
    if (amount <= 0) {
      throw new BadRequestException(
        `Invalid credit amount: ${amount}. Must be a positive number.`,
      );
    }

    console.log(`[CREDIT_SERVICE] Adding ${amount} credits (${type}) to user ${userId}: ${description || ''}`);
    
    // Use a transaction to prevent race conditions
    await this.prisma.$transaction(async (tx) => {
      const balance = await tx.creditBalance.findUnique({
        where: { userId },
      });

      if (!balance) {
        // Initialize if not exists
        await tx.creditBalance.create({
          data: {
            userId,
            totalCredits: amount,
            remainingCredits: amount,
            monthlyLimit: 0,
            monthlyUsed: 0,
            lastResetAt: new Date(),
          },
        });

        // Create transaction record
        await tx.creditTransaction.create({
          data: {
            userId,
            amount,
            type,
            description: description || 'Credits added',
            subscriptionId,
            balanceAfter: amount,
          },
        });
        return;
      }

      const updatedBalance = await tx.creditBalance.update({
        where: { userId },
        data: {
          totalCredits: {
            increment: amount,
          },
          remainingCredits: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId,
          amount,
          type,
          description: description || 'Credits added',
          subscriptionId,
          balanceAfter: updatedBalance.remainingCredits,
        },
      });
    });
  }

  /**
    * Reset monthly usage (called when subscription renews)
    * Uses a database transaction to prevent race conditions
    */
  async resetMonthlyUsage(userId: string): Promise<void> {
    console.log(`[CREDIT_SERVICE] Resetting monthly usage for user ${userId}`);
    
    await this.prisma.$transaction(async (tx) => {
      await tx.creditBalance.update({
        where: { userId },
        data: {
          monthlyUsed: 0,
          lastResetAt: new Date(),
        },
      });
    });
  }

  /**
    * Update monthly limit based on subscription
    * Uses a database transaction to prevent race conditions
    */
  async updateMonthlyLimit(userId: string, limit: number): Promise<void> {
    console.log(`[CREDIT_SERVICE] Updating monthly limit for user ${userId} to ${limit} credits`);
    
    // Use a transaction to prevent race conditions
    await this.prisma.$transaction(async (tx) => {
      const balance = await tx.creditBalance.findUnique({
        where: { userId },
      });

      if (!balance) {
        // Initialize with the new limit
        await tx.creditBalance.create({
          data: {
            userId,
            totalCredits: limit,
            remainingCredits: limit,
            monthlyLimit: limit,
            monthlyUsed: 0,
            lastResetAt: new Date(),
          },
        });
        return;
      }

      await tx.creditBalance.update({
        where: { userId },
        data: {
          monthlyLimit: limit,
          remainingCredits: limit, // Reset balance to the new limit
          totalCredits: limit,     // Also update totalCredits to reflect current entitlement
          monthlyUsed: 0,          // Reset usage count
          lastResetAt: new Date(),
        },
      });
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


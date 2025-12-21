import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CreditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialize credit balance for a user
   */
  async initializeCreditBalance(userId: string, freeCredits: number = 10): Promise<void> {
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

    if (isExpired && balance.remainingCredits > 10) {
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
    */
  async addCredits(
    userId: string,
    amount: number,
    type: 'purchase' | 'bonus' | 'refund' = 'purchase',
    description?: string,
    subscriptionId?: string,
  ): Promise<void> {
    console.log(`[CREDIT_SERVICE] Adding ${amount} credits (${type}) to user ${userId}: ${description || ''}`);
    
    const balance = await this.getCreditBalance(userId);
    if (!balance) {
      await this.initializeCreditBalance(userId);
    }

    const updatedBalance = await this.prisma.creditBalance.update({
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
    await this.prisma.creditTransaction.create({
      data: {
        userId,
        amount,
        type,
        description: description || 'Credits added',
        subscriptionId,
        balanceAfter: updatedBalance.remainingCredits,
      },
    });
  }

  /**
    * Reset monthly usage (called when subscription renews)
    */
  async resetMonthlyUsage(userId: string): Promise<void> {
    console.log(`[CREDIT_SERVICE] Resetting monthly usage for user ${userId}`);
    await this.prisma.creditBalance.update({
      where: { userId },
      data: {
        monthlyUsed: 0,
        lastResetAt: new Date(),
      },
    });
  }

  /**
    * Update monthly limit based on subscription
    */
  async updateMonthlyLimit(userId: string, limit: number): Promise<void> {
    console.log(`[CREDIT_SERVICE] Updating monthly limit for user ${userId} to ${limit} credits`);
    
    const balance = await this.getCreditBalance(userId);
    if (!balance) {
      await this.initializeCreditBalance(userId);
    }

    await this.prisma.creditBalance.update({
      where: { userId },
      data: {
        monthlyLimit: limit,
        remainingCredits: limit, // Reset balance to the new limit
        monthlyUsed: 0,          // Reset usage count
        lastResetAt: new Date(),
      },
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


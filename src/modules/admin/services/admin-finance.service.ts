import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class AdminFinanceService {
  private readonly logger = new Logger(AdminFinanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSubscriptions(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 20, search = '', userId, status } = query;
      const skip = (page - 1) * perPage;

      const where: any = {};
      if (search) {
        where.OR = [
          { polarSubscriptionId: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }
      if (userId) where.userId = userId;
      if (status) where.status = status;

      const [subscriptions, total] = await Promise.all([
        this.prisma.subscription.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          include: {
            user: { 
              select: { 
                email: true, 
                name: true,
                CreditBalance: true
              } 
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.subscription.count({ where }),
      ]);

      // Fetch AI usage statistics for these users
      const userIds = subscriptions.map(s => s.userId);
      const usageStats = await this.prisma.aiUsage.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _sum: {
          inputTokens: true,
          outputTokens: true,
          cost: true
        }
      });

      // Map usage stats back to subscriptions
      const subscriptionsWithUsage = subscriptions.map(sub => {
        const usage = usageStats.find(u => u.userId === sub.userId)?._sum || {
          inputTokens: 0,
          outputTokens: 0,
          cost: 0
        };

        return {
          ...sub,
          usage: {
            inputTokens: usage.inputTokens || 0,
            outputTokens: usage.outputTokens || 0,
            totalTokens: (usage.inputTokens || 0) + (usage.outputTokens || 0),
            cost: usage.cost || 0
          },
          creditBalance: sub.user.CreditBalance
        };
      });

      return successResponse('Subscriptions retrieved successfully', {
        subscriptions: subscriptionsWithUsage,
        pagination: {
          page: Number(page),
          perPage: Number(perPage),
          total,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } catch (error) {
      return processException(error);
    }
  }

  async getRevenueAnalytics(): Promise<ResponseModel> {
    try {
      const [revenueData, activeSubs, churnedSubs] = await Promise.all([
        this.prisma.creditTransaction.aggregate({
          where: { type: 'purchase' },
          _sum: { amount: true }
        }),
        this.prisma.subscription.count({ where: { status: 'active' } }),
        this.prisma.subscription.count({ where: { status: 'canceled' } }),
      ]);

      // Note: amount is in cents/units, adjust if needed. Assuming it matches currency units for now.
      // If it's cents, we should divide by 100.
      return successResponse('Revenue analytics retrieved', {
        revenue: revenueData._sum.amount || 0,
        activeSubscriptions: activeSubs,
        churnedSubscriptions: churnedSubs,
      });
    } catch (error) {
      return processException(error);
    }
  }

  async getExpiringSubscriptions(): Promise<ResponseModel> {
    try {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          status: 'active',
          currentPeriodEnd: {
            lte: sevenDaysFromNow,
            gte: new Date(),
          },
        },
        include: { user: true },
      });

      return successResponse('Expiring subscriptions retrieved', subscriptions);
    } catch (error) {
      return processException(error);
    }
  }
}

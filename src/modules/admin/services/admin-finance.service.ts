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
          { stripeCustomerId: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
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
            user: { select: { email: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.subscription.count({ where }),
      ]);

      return successResponse('Subscriptions retrieved successfully', {
        subscriptions,
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
      const [totalRevenue, activeSubs, churnedSubs] = await Promise.all([
        this.prisma.aiUsage.aggregate({ _sum: { cost: true } }), // Simplified revenue proxy
        this.prisma.subscription.count({ where: { status: 'active' } }),
        this.prisma.subscription.count({ where: { status: 'canceled' } }),
      ]);

      return successResponse('Revenue analytics retrieved', {
        revenue: totalRevenue._sum.cost || 0,
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

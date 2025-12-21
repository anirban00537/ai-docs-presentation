import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<ResponseModel> {
    try {
      const [totalUsers, activeSubscriptions, totalTokensInput, totalTokensOutput, totalCost] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.subscription.count({ where: { status: 'active' } }),
        this.prisma.aiUsage.aggregate({ _sum: { inputTokens: true } }),
        this.prisma.aiUsage.aggregate({ _sum: { outputTokens: true } }),
        this.prisma.aiUsage.aggregate({ _sum: { cost: true } }),
      ]);

      return successResponse('Admin stats retrieved successfully', {
        totalUsers,
        activeSubscriptions,
        totalTokens: (totalTokensInput._sum.inputTokens || 0) + (totalTokensOutput._sum.outputTokens || 0),
        totalCost: totalCost._sum.cost || 0,
      });
    } catch (error) {
      return processException(error);
    }
  }

  async getAnalytics(): Promise<ResponseModel> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        totalUsers,
        activeSubscriptions,
        totalPresentations,
        totalMedia,
        totalTokensInput,
        totalTokensOutput,
        totalCost,
        userGrowth,
        revenueTrend,
        aiUsageOverview,
        aiModelDistribution,
        subscriptionBreakdown,
        geoDistribution,
        typeDistribution,
        statusDistribution
      ] = await Promise.all([
        // Totals
        this.prisma.user.count(),
        this.prisma.subscription.count({ where: { status: 'active' } }),
        this.prisma.presentation.count(),
        this.prisma.media.count(),
        this.prisma.aiUsage.aggregate({ _sum: { inputTokens: true } }),
        this.prisma.aiUsage.aggregate({ _sum: { outputTokens: true } }),
        this.prisma.aiUsage.aggregate({ _sum: { cost: true } }),

        // Registration Growth (30 days) - Raw SQL for date truncation
        this.prisma.$queryRaw`
          SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(*)::int as value
          FROM "User"
          WHERE "createdAt" >= ${thirtyDaysAgo}
          GROUP BY 1
          ORDER BY 1 ASC
        ` as Promise<any[]>,

        // Revenue (30 days) - Raw SQL for date truncation
        this.prisma.$queryRaw`
          SELECT DATE_TRUNC('day', "createdAt") as date, SUM("amount")::int as value
          FROM "credit_transactions"
          WHERE "type" = 'purchase' AND "createdAt" >= ${thirtyDaysAgo}
          GROUP BY 1
          ORDER BY 1 ASC
        ` as Promise<any[]>,

        // AI Usage Overview
        this.prisma.aiUsage.groupBy({
          by: ['type'],
          _count: { _all: true },
          _sum: { cost: true, inputTokens: true, outputTokens: true },
        }),

        // AI Model Distribution
        this.prisma.aiUsage.groupBy({
          by: ['modelName'],
          _count: { _all: true },
        }),

        // Subscription Breakdown
        this.prisma.subscription.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),

        // User Geo Distribution
        this.prisma.user.groupBy({
          by: ['country'],
          _count: { _all: true },
          where: { country: { not: null } },
          orderBy: { _count: { country: 'desc' } },
          take: 10
        }),

        // Presentation Type (Public vs Template)
        this.prisma.presentation.groupBy({
          by: ['isPublic', 'isTemplate'],
          _count: { _all: true },
        }),

        // User Role Distribution
        this.prisma.user.groupBy({
          by: ['role'],
          _count: { _all: true },
        })
      ]);

      const formatSQLTrend = (data: any[]) => data.map(item => ({
        date: new Date(item.date).toISOString().split('T')[0],
        value: item.value
      }));

      return successResponse('Analytics retrieved successfully', {
        summary: {
          totalUsers,
          activeSubscriptions,
          totalPresentations,
          totalMedia,
          totalTokens: (totalTokensInput._sum.inputTokens || 0) + (totalTokensOutput._sum.outputTokens || 0),
          totalCost: totalCost._sum.cost || 0,
        },
        trends: {
          registrations: formatSQLTrend(userGrowth),
          revenue: formatSQLTrend(revenueTrend),
        },
        distributions: {
          aiUsage: aiUsageOverview.map(u => ({
            type: u.type,
            count: u._count._all,
            cost: u._sum.cost,
            tokens: (u._sum.inputTokens || 0) + (u._sum.outputTokens || 0)
          })),
          aiModels: aiModelDistribution.map(m => ({
            name: m.modelName,
            count: m._count._all
          })),
          subscriptions: subscriptionBreakdown.map(s => ({
            status: s.status,
            count: s._count._all
          })),
          geo: geoDistribution.map(g => ({
            country: g.country,
            count: g._count._all
          })),
          presentationTypes: typeDistribution.map(t => ({
            isPublic: t.isPublic,
            isTemplate: t.isTemplate,
            count: t._count._all
          })),
          roles: statusDistribution.map(r => ({
            role: r.role,
            count: r._count._all
          }))
        }
      });
    } catch (error) {
      return processException(error);
    }
  }
}

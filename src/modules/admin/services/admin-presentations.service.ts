import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class AdminPresentationsService {
  private readonly logger = new Logger(AdminPresentationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPresentations(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 20, search = '', userId, isPublic, isTemplate } = query;
      const skip = (page - 1) * perPage;

      const where: any = {};
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (userId) where.userId = userId;
      if (isPublic !== undefined) where.isPublic = isPublic === 'true';
      if (isTemplate !== undefined) where.isTemplate = isTemplate === 'true';

      const [presentations, total] = await Promise.all([
        this.prisma.presentation.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          include: {
            user: { select: { email: true, name: true } },
            analytics: { select: { viewCount: true } },
            _count: { select: { slides: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.presentation.count({ where }),
      ]);

      // Get token usage and cost for each presentation
      const presentationsWithUsage = await Promise.all(
        presentations.map(async (presentation) => {
          // Get all AI usage records for this presentation
          const aiUsages = await this.prisma.aiUsage.findMany({
            where: {
              presentationId: presentation.id,
            },
            select: {
              inputTokens: true,
              outputTokens: true,
              cost: true,
            },
          });

          // Also check for outline-related usage if presentation was created from an outline
          const outline = await this.prisma.outline.findFirst({
            where: {
              presentationId: presentation.id,
            },
            select: { id: true },
          });

          let outlineUsages: any[] = [];
          if (outline) {
            outlineUsages = await this.prisma.aiUsage.findMany({
              where: {
                outlineId: outline.id,
              },
              select: {
                inputTokens: true,
                outputTokens: true,
                cost: true,
              },
            });
          }

          // Combine all usages
          const allUsages = [...aiUsages, ...outlineUsages];

          // Calculate totals
          const totalTokens = allUsages.reduce(
            (sum, usage) => sum + usage.inputTokens + usage.outputTokens,
            0,
          );
          const totalCost = allUsages.reduce((sum, usage) => sum + usage.cost, 0);

          return {
            ...presentation,
            aiUsage: {
              totalTokens,
              totalCost,
            },
          };
        }),
      );

      return successResponse('Presentations retrieved successfully', {
        presentations: presentationsWithUsage,
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

  async getTrendingContent(): Promise<ResponseModel> {
    try {
      const trending = await this.prisma.presentation.findMany({
        orderBy: { analytics: { viewCount: 'desc' } },
        take: 10,
        select: {
          id: true,
          title: true,
          tags: true,
          analytics: { select: { viewCount: true } },
          user: { select: { name: true, email: true } },
        },
      });
      return successResponse('Trending content retrieved', trending);
    } catch (error) {
      return processException(error);
    }
  }

  async getTemplateStats(): Promise<ResponseModel> {
    try {
      const stats = await this.prisma.layout.findMany({
        orderBy: { usageCount: 'desc' },
        take: 20,
        select: {
          id: true,
          name: true,
          usageCount: true,
          type: true,
        },
      });
      return successResponse('Template stats retrieved', stats);
    } catch (error) {
      return processException(error);
    }
  }

  async deletePresentation(id: string): Promise<ResponseModel> {
    try {
      await this.prisma.presentation.delete({ where: { id } });
      return successResponse('Presentation deleted successfully');
    } catch (error) {
      return processException(error);
    }
  }
}

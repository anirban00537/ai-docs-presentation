import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class AdminDocsService {
  private readonly logger = new Logger(AdminDocsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDocs(query: any): Promise<ResponseModel> {
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

      const [docs, total] = await Promise.all([
        this.prisma.doc.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          include: {
            user: { select: { email: true, name: true } },
            analytics: { select: { viewCount: true } },
            _count: { select: { cards: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.doc.count({ where }),
      ]);

      // Get token usage and cost for each doc
      const docsWithUsage = await Promise.all(
        docs.map(async (doc) => {
          // Get all AI usage records for this doc
          const aiUsages = await this.prisma.aiUsage.findMany({
            where: {
              docId: doc.id,
            },
            select: {
              inputTokens: true,
              outputTokens: true,
              cost: true,
            },
          });

          // Calculate totals
          const totalTokens = aiUsages.reduce(
            (sum, usage) => sum + usage.inputTokens + usage.outputTokens,
            0,
          );
          const totalCost = aiUsages.reduce((sum, usage) => sum + usage.cost, 0);

          return {
            ...doc,
            aiUsage: {
              totalTokens,
              totalCost,
            },
          };
        }),
      );

      return successResponse('Docs retrieved successfully', {
        docs: docsWithUsage,
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
      const trending = await this.prisma.doc.findMany({
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

  async deleteDoc(id: string): Promise<ResponseModel> {
    try {
      await this.prisma.doc.delete({ where: { id } });
      return successResponse('Doc deleted successfully');
    } catch (error) {
      return processException(error);
    }
  }
}

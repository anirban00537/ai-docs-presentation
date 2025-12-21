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
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.presentation.count({ where }),
      ]);

      return successResponse('Presentations retrieved successfully', {
        presentations,
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

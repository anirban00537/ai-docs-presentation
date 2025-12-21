import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class AdminActivityService {
  private readonly logger = new Logger(AdminActivityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSystemActivities(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 50, action, userId } = query;
      const skip = (page - 1) * perPage;

      const where: any = {};
      if (action) where.action = action;
      if (userId) where.userId = userId;

      const [activities, total] = await Promise.all([
        this.prisma.systemActivity.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          include: {
            user: { select: { name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.systemActivity.count({ where }),
      ]);

      return successResponse('System activities retrieved successfully', {
        activities,
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
}

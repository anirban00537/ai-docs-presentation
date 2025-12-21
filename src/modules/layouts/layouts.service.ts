import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  successResponse,
  errorResponse,
  processException,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { User } from '@prisma/client';
import { CreateLayoutDto } from './dto/create-layout.dto';

@Injectable()
export class LayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    payload: CreateLayoutDto,
  ): Promise<ResponseModel> {
    try {
      const layout = await this.prisma.layout.create({
        data: {
          userId: userId,
          name: payload.name,
          description: payload.description,
          thumbnail: payload.thumbnail,
          data: payload.data as any,
          type: 'admin', // TODO: For testing - will change later
          tags: payload.tags || [],
          isAdmin: true, // TODO: For testing - will change later
        },
      });
      return successResponse('Layout created successfully', layout);
    } catch (error) {
      console.error('Error creating layout:', error);
      return errorResponse('Failed to create layout', []);
    }
  }
  async findAll(userId: string): Promise<ResponseModel> {
    try {
      // TODO: For testing - return all admin layouts. Will filter by userId later
      const where: any = {
        deletedAt: null,
        isAdmin: true,
      };

      const layouts = await this.prisma.layout.findMany({
        where,
        orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
      });
      return successResponse('Layouts retrieved successfully', layouts);
    } catch (error) {
      console.error('Error retrieving layouts:', error);
      return errorResponse('Failed to retrieve layouts', []);
    }
  }
  async remove(id: string, userId: string): Promise<ResponseModel> {
    try {
      // TODO: For testing - allow deleting any admin layout. Will verify userId ownership later
      const layout = await this.prisma.layout.findFirst({
        where: {
          id,
          deletedAt: null,
          isAdmin: true, // TODO: For testing - will verify userId later
        },
      });

      if (!layout) {
        return errorResponse('Layout not found');
      }

      await this.prisma.layout.delete({ where: { id } });

      return successResponse('Layout deleted successfully', null);
    } catch (error) {
      processException(error);
    }
  }
}

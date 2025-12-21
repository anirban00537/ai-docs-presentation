import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, errorResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class AdminLayoutsService {
  private readonly logger = new Logger(AdminLayoutsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all layouts
   */
  async getLayouts(): Promise<ResponseModel> {
    try {
      const layouts = await this.prisma.layout.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return successResponse('Layouts retrieved successfully', layouts);
    } catch (error) {
      this.logger.error('Error fetching layouts:', error);
      return processException(error);
    }
  }

  /**
   * Get a single layout by ID
   */
  async getLayout(id: string): Promise<ResponseModel> {
    try {
      const layout = await this.prisma.layout.findUnique({
        where: { id },
      });

      if (!layout) {
        return errorResponse('Layout not found');
      }

      return successResponse('Layout retrieved successfully', layout);
    } catch (error) {
      this.logger.error(`Error fetching layout ${id}:`, error);
      return processException(error);
    }
  }

  /**
   * Delete a layout
   */
  async deleteLayout(id: string): Promise<ResponseModel> {
    try {
      // Soft delete by setting deletedAt
      await this.prisma.layout.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.log(`Layout deleted: ${id}`);
      return successResponse('Layout deleted successfully');
    } catch (error) {
      this.logger.error(`Error deleting layout ${id}:`, error);
      return processException(error);
    }
  }
}

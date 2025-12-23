import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {
  successResponse,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import { UpdatePresentationDto } from './dto/update-presentation.dto';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class PresentationService {
  private readonly logger = new Logger(PresentationService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user: User,
    payload: CreatePresentationDto,
  ): Promise<ResponseModel> {
    try {
      const presentation = await this.prisma.presentation.create({
        data: {
          ...payload,
          userId: user.id,
          ownerId: user.id,
        },
        include: {
          slides: {
            orderBy: { order: 'asc' },
          },
        },
      });

      this.logger.log(`CREATE: Presentation "${presentation.title}" (${presentation.id}) for user ${user.id}`);
      return successResponse('Presentation created successfully', presentation);
    } catch (error) {
      processException(error);
    }
  }

  async findAll(user: User, query: any): Promise<ResponseModel> {
    try {
      const paginate = await paginatioOptions(query);

      const presentations = await this.prisma.presentation.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
        },
        ...paginate,
        include: {
          slides: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            take: 1,
          },
          _count: {
            select: {
              slides: {
                where: { deletedAt: null },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      const total = await this.prisma.presentation.count({
        where: {
          userId: user.id,
          deletedAt: null,
        },
      });

      const paginationMeta = await paginationMetaData('presentation', query);

      const data = {
        list: presentations,
        meta: paginationMeta,
      };

      return successResponse('Presentations retrieved successfully', data);
    } catch (error) {
      processException(error);
    }
  }

  async findOne(id: string, user: User): Promise<ResponseModel> {
    try {
      const presentation = await this.prisma.presentation.findFirst({
        where: {
          id,
          userId: user.id,
          deletedAt: null,
        },
        include: {
          slides: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!presentation) {
        return errorResponse('Presentation not found');
      }

      return successResponse(
        'Presentation retrieved successfully',
        presentation,
      );
    } catch (error) {
      processException(error);
    }
  }

  async update(
    id: string,
    user: User,
    payload: UpdatePresentationDto,
  ): Promise<ResponseModel> {
    try {
      const presentation = await this.prisma.presentation.findFirst({
        where: {
          id,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!presentation) {
        return errorResponse('Presentation not found');
      }

      const updatedPresentation = await this.prisma.presentation.update({
        where: { id },
        data: {
          ...payload,
          version: presentation.version + 1,
        },
        include: {
          slides: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
          },
        },
      });

      return successResponse(
        'Presentation updated successfully',
        updatedPresentation,
      );
    } catch (error) {
      processException(error);
    }
  }

  async updateTitle(
    id: string,
    user: User,
    payload: { title: string },
  ): Promise<ResponseModel> {
    try {
      const presentation = await this.prisma.presentation.findFirst({
        where: {
          id,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!presentation) {
        return errorResponse('Presentation not found');
      }

      const updatedPresentation = await this.prisma.presentation.update({
        where: { id },
        data: {
          title: payload.title,
          version: presentation.version + 1,
        },
      });

      this.logger.log(`UPDATE TITLE: Presentation ${id} -> "${payload.title}"`);
      return successResponse(
        'Presentation title updated successfully',
        updatedPresentation,
      );
    } catch (error) {
      processException(error);
    }
  }

  async remove(id: string, user: User): Promise<ResponseModel> {
    try {
      const presentation = await this.prisma.presentation.findFirst({
        where: {
          id,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!presentation) {
        return errorResponse('Presentation not found');
      }

      await this.prisma.presentation.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return successResponse('Presentation deleted successfully');
    } catch (error) {
      processException(error);
    }
  }

  async addSlide(
    presentationId: string,
    user: User,
    payload: CreateSlideDto,
  ): Promise<ResponseModel> {
    try {
      const presentation = await this.prisma.presentation.findFirst({
        where: {
          id: presentationId,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!presentation) {
        return errorResponse('Presentation not found');
      }

      // Use a transaction to ensure atomicity and prevent race conditions
      const result = await this.prisma.$transaction(async (tx) => {
        // Get all existing slides to determine the correct order
        // This query is within a transaction, so it will see a consistent state
        const existingSlides = await tx.slide.findMany({
          where: {
            presentationId,
            deletedAt: null,
          },
          orderBy: { order: 'asc' },
        });

        const slideCount = existingSlides.length;
        // Find the maximum order value to ensure new slides are added at the end
        const maxOrder =
          existingSlides.length > 0
            ? Math.max(...existingSlides.map((s) => s.order))
            : -1;

        // If no order is provided, add at the end (maxOrder + 1)
        // Otherwise, use the provided order (for inserting at specific positions)
        let targetOrder =
          payload.order === undefined || payload.order === null
            ? maxOrder + 1
            : payload.order;

        // Ensure targetOrder is within valid range
        if (targetOrder < 0) {
          targetOrder = 0;
        }
        // If order is > maxOrder, it means add at the end (no shifting needed)
        if (targetOrder > maxOrder) {
          targetOrder = maxOrder + 1;
        }

        // Validate and adjust order if there's a conflict
        // If the target order already exists, shift all slides with order >= targetOrder
        const conflictingSlides = existingSlides.filter(
          (s) => s.order === targetOrder,
        );

        if (conflictingSlides.length > 0) {
          // Shift all slides with order >= targetOrder by 1
          // Process in reverse order (highest first) to avoid temporary conflicts
          const slidesToShift = existingSlides
            .filter((s) => s.order >= targetOrder)
            .sort((a, b) => b.order - a.order); // Sort descending

          for (const slideToShift of slidesToShift) {
            await tx.slide.update({
              where: { id: slideToShift.id },
              data: { order: slideToShift.order + 1 },
            });
          }
        }

        // Create the new slide with the target order
        const slide = await tx.slide.create({
          data: {
            presentationId,
            data: payload.data || {},
            order: targetOrder,
          },
        });

        this.logger.log(`ADD SLIDE: Added slide to presentation ${presentationId} at order ${targetOrder}`);
        return slide;
      });

      return successResponse('Slide added successfully', result);
    } catch (error) {
      processException(error);
    }
  }

  async updateSlide(
    slideId: string,
    user: User,
    payload: UpdateSlideDto,
  ): Promise<ResponseModel> {
    try {
      const slide = await this.prisma.slide.findFirst({
        where: {
          id: slideId,
          deletedAt: null,
        },
        include: {
          presentation: true,
        },
      });

      if (!slide) {
        return errorResponse('Slide not found');
      }

      if (slide.presentation.userId !== user.id) {
        return errorResponse('Unauthorized to update this slide');
      }

      const updatedSlide = await this.prisma.slide.update({
        where: { id: slideId },
        data: {
          ...(payload.data !== undefined && { data: payload.data }),
          ...(payload.order !== undefined && { order: payload.order }),
        },
      });

      return successResponse('Slide updated successfully', updatedSlide);
    } catch (error) {
      processException(error);
    }
  }

  async removeSlide(slideId: string, user: User): Promise<ResponseModel> {
    try {
      const slide = await this.prisma.slide.findFirst({
        where: {
          id: slideId,
          deletedAt: null,
        },
        include: {
          presentation: true,
        },
      });

      if (!slide) {
        return errorResponse('Slide not found');
      }

      if (slide.presentation.userId !== user.id) {
        return errorResponse('Unauthorized to delete this slide');
      }

      await this.prisma.slide.update({
        where: { id: slideId },
        data: {
          deletedAt: new Date(),
        },
      });

      return successResponse('Slide deleted successfully');
    } catch (error) {
      processException(error);
    }
  }

  async reorderSlides(
    presentationId: string,
    user: User,
    slideOrders: { slideId: string; order: number }[],
  ): Promise<ResponseModel> {
    try {
      const presentation = await this.prisma.presentation.findFirst({
        where: {
          id: presentationId,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!presentation) {
        return errorResponse('Presentation not found');
      }

      await this.prisma.$transaction(
        slideOrders.map(({ slideId, order }) =>
          this.prisma.slide.update({
            where: { id: slideId },
            data: { order },
          }),
        ),
      );

      return successResponse('Slides reordered successfully');
    } catch (error) {
      processException(error);
    }
  }
}

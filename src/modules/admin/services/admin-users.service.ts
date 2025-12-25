import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 20, search = '' } = query;
      const skip = (page - 1) * perPage;

      const where: any = {};
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          include: {
            Subscription: true,
            CreditBalance: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      return successResponse('Users retrieved successfully', {
        users,
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

  async getUserActivity(userId: string): Promise<ResponseModel> {
    try {
      const activities = await this.prisma.systemActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return successResponse('User activity retrieved', activities);
    } catch (error) {
      return processException(error);
    }
  }

  async adjustUserCredits(userId: string, amount: number, type: string, description: string): Promise<ResponseModel> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const balance = await tx.creditBalance.findUnique({ where: { userId } });
        if (!balance) throw new Error('Credit balance not found');

        const finalBalance = balance.balance + amount;

        const updated = await tx.creditBalance.update({
          where: { userId },
          data: {
            balance: finalBalance,
          },
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            amount,
            type,
            description,
            balanceAfter: finalBalance,
          },
        });

        return successResponse('Credits adjusted successfully', updated);
      });
    } catch (error) {
      return processException(error);
    }
  }

  async updateUserStatus(userId: string, status: number): Promise<ResponseModel> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { status },
      });
      return successResponse('User status updated', user);
    } catch (error) {
      return processException(error);
    }
  }
}

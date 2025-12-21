import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminPresentationsService } from '../services/admin-presentations.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminPresentationsController {
  constructor(private readonly presentationsService: AdminPresentationsService) {}

  @Get('presentations')
  async getPresentations(@Query() query: any): Promise<ResponseModel> {
    return this.presentationsService.getPresentations(query);
  }

  @Delete('presentations/:id')
  async deletePresentation(@Param('id') id: string): Promise<ResponseModel> {
    return this.presentationsService.deletePresentation(id);
  }

  @Get('content/trending')
  async getTrendingContent(): Promise<ResponseModel> {
    return this.presentationsService.getTrendingContent();
  }

  @Get('templates/stats')
  async getTemplateStats(): Promise<ResponseModel> {
    return this.presentationsService.getTemplateStats();
  }
}

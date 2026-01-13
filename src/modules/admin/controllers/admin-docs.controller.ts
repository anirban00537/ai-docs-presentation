import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminDocsService } from '../services/admin-docs.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminDocsController {
  constructor(private readonly docsService: AdminDocsService) {}

  @Get('docs')
  async getDocs(@Query() query: any): Promise<ResponseModel> {
    return this.docsService.getDocs(query);
  }

  @Delete('docs/:id')
  async deleteDoc(@Param('id') id: string): Promise<ResponseModel> {
    return this.docsService.deleteDoc(id);
  }

  @Get('content/trending')
  async getTrendingContent(): Promise<ResponseModel> {
    return this.docsService.getTrendingContent();
  }

  @Get('templates/stats')
  async getTemplateStats(): Promise<ResponseModel> {
    return this.docsService.getTemplateStats();
  }
}

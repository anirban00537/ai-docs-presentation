import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminLayoutsService } from '../services/admin-layouts.service';

@Controller('admin/layouts')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminLayoutsController {
  constructor(private readonly layoutsService: AdminLayoutsService) {}

  @Get()
  async getLayouts(): Promise<ResponseModel> {
    return this.layoutsService.getLayouts();
  }

  @Get(':id')
  async getLayout(@Param('id') id: string): Promise<ResponseModel> {
    return this.layoutsService.getLayout(id);
  }

  @Delete(':id')
  async deleteLayout(@Param('id') id: string): Promise<ResponseModel> {
    return this.layoutsService.deleteLayout(id);
  }
}

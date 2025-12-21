import { IsOptional, IsNumber, IsObject } from 'class-validator';

export class UpdateSlideDto {
  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsNumber()
  order?: number;
}


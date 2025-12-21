import { IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateSlideDto {
  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsNumber()
  order?: number;
}


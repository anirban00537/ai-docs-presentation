import { IsOptional, IsString, IsBoolean, IsArray, IsObject, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDocDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsObject()
  globalTheme?: any;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @IsOptional()
  @IsArray()
  tags?: string[];

  // Outline fields
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  numberOfCards?: number;

  @IsOptional()
  @IsString()
  outlineStatus?: string;
}


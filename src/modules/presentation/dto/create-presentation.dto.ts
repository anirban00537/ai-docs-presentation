import { IsOptional, IsString, IsBoolean, IsArray, IsObject } from 'class-validator';

export class CreatePresentationDto {
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
}


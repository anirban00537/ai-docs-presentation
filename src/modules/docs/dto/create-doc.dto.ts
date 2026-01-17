import { IsOptional, IsString, IsBoolean, IsArray, IsObject, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

// Supported document types
export const DOC_TYPES = ['presentation', 'carousel', 'resume', 'infographic', 'report'] as const;
export type DocType = typeof DOC_TYPES[number];

export class CreateDocDto {
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
  @IsString()
  @IsIn(DOC_TYPES, { message: `docType must be one of: ${DOC_TYPES.join(', ')}` })
  docType?: DocType;

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

  // Outline fields (merged from Outline)
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  numberOfCards?: number;
}

import { IsString, MaxLength, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOutlineDto {
  @IsString()
  @MaxLength(1000)
  prompt: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  numberOfSlides: number;
}

export class UpdateOutlineDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  outlines?: Array<{ 
    content: string; 
    schemaId?: string; 
    layoutId?: string; // Keep for backward compatibility
  }>;
}


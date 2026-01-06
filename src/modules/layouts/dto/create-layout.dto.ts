import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  MaxLength,
} from 'class-validator';

export class CreateLayoutDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnail?: string;

  @IsObject()
  data: any; // Layout/template data (JSON) - similar to Slide data

  @IsOptional()
  @IsString()
  type?: 'admin' | 'user'; // Defaults to 'user'

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  published?: boolean;
}


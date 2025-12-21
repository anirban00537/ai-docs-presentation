import { IsString, MaxLength, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFromPromptDto {
  @IsString()
  @MaxLength(1000)
  prompt: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  numberOfSlides: number;
}

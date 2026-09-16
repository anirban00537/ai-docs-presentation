import { IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateCardDto {
  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsObject()
  outline?: any; // Individual outline data for this card
}


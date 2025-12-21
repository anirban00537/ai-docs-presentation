import { IsString, IsInt, IsDate, IsOptional } from 'class-validator';

export class CreditBalanceResponseDto {
  @IsString()
  id: string;

  @IsString()
  userId: string;

  @IsInt()
  totalCredits: number;

  @IsInt()
  usedCredits: number;

  @IsInt()
  remainingCredits: number;

  @IsInt()
  monthlyLimit: number;

  @IsInt()
  monthlyUsed: number;

  @IsInt()
  freeCredits: number;

  @IsInt()
  freeCreditsUsed: number;

  @IsDate()
  @IsOptional()
  lastResetAt?: Date;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}


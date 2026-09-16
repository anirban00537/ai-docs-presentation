import { IsBoolean, IsOptional } from 'class-validator';

export class ToggleShareDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class ShareResponseDto {
  shareEnabled: boolean;
}

import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateDocTitleDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

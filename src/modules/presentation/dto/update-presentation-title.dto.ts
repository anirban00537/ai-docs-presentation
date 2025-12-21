import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePresentationTitleDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

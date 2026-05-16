import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class ConfirmDataDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  document_masked?: string;

  @IsBoolean()
  confirmed: boolean;
}

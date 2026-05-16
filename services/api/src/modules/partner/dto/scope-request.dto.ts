import { IsString, IsOptional } from 'class-validator';

export class ScopeRequestDto {
  @IsString()
  request_type: string;

  @IsOptional()
  @IsString()
  description?: string;
}

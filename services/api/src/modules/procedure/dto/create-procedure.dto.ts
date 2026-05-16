import { IsString, IsOptional } from 'class-validator';

export class CreateProcedureDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  customer_id?: string;

  @IsOptional()
  @IsString()
  template_id?: string;
}

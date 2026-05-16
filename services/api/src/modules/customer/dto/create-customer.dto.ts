import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  document_masked?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

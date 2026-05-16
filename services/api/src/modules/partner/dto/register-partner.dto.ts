import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class RegisterPartnerDto {
  @IsString()
  company_name: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  trading_name?: string;

  @IsEmail()
  owner_email: string;

  @MinLength(8)
  owner_password: string;

  @IsOptional()
  @IsString()
  owner_name?: string;
}

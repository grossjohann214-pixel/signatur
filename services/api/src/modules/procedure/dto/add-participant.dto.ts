import { IsString, IsOptional, IsEmail } from 'class-validator';

export class AddParticipantDto {
  @IsString()
  role: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  document_masked?: string;
}

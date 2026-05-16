import { IsString } from 'class-validator';

export class SubmitSignatureDto {
  @IsString()
  signature_hash: string;
}

import { IsString, IsOptional } from 'class-validator';

export class SubmitWalletDto {
  @IsString()
  wallet_address: string;

  @IsOptional()
  @IsString()
  network?: string;
}

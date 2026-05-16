import { Controller, Post, Body, Param } from '@nestjs/common';
import { CustomerFlowService } from './customer-flow.service';
import { ConfirmDataDto } from './dto/confirm-data.dto';
import { SubmitSignatureDto } from './dto/submit-signature.dto';
import { SubmitWalletDto } from './dto/submit-wallet.dto';

// All routes are PUBLIC — customer accesses via magic link token
@Controller('flow')
export class CustomerFlowController {
  constructor(private readonly flowService: CustomerFlowService) {}

  @Post('open')
  async openLink(@Body() body: { token: string }) {
    return this.flowService.openLink(body.token);
  }

  @Post(':linkId/confirm')
  async confirmData(@Param('linkId') linkId: string, @Body() body: ConfirmDataDto) {
    return this.flowService.confirmData(linkId, body);
  }

  @Post(':linkId/sign')
  async submitSignature(@Param('linkId') linkId: string, @Body() body: SubmitSignatureDto) {
    return this.flowService.submitSignature(linkId, body.signature_hash);
  }

  @Post(':linkId/wallet')
  async submitWallet(@Param('linkId') linkId: string, @Body() body: SubmitWalletDto) {
    return this.flowService.submitWallet(linkId, body.wallet_address, body.network);
  }

  @Post(':linkId/complete')
  async completeFlow(@Param('linkId') linkId: string) {
    return this.flowService.completeFlow(linkId);
  }
}

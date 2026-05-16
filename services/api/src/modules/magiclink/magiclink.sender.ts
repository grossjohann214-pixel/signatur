import { Injectable } from '@nestjs/common';

@Injectable()
export class MockMagicLinkSender {
  async sendMagicLink(participantId: string, token: string) {
    // Abstração de envio para FASE 0.
    // Não implementa e-mail/SMS real e não registra o token.
    return Promise.resolve(true);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditPayload {
  entity_type: string;
  entity_id: string;
  action: string;
  evidence_hash?: string;
  protocol_number?: string;
  tx_hash?: string;
  actor_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async record(payload: AuditPayload) {
    const record = await this.prisma.auditRecord.create({
      data: {
        entity_type: payload.entity_type,
        entity_id: payload.entity_id,
        action: payload.action,
        new_value: {
          evidence_hash: payload.evidence_hash,
          protocol_number: payload.protocol_number,
          tx_hash: payload.tx_hash,
          metadata: payload.metadata,
        },
        actor_id: payload.actor_id || null,
        ip_address: payload.ip_address || null,
        user_agent: payload.user_agent || null,
      },
    });

    this.logger.log(`Audit: ${payload.action} on ${payload.entity_type}:${payload.entity_id}`);
    return record;
  }

  async getByEntity(entityType: string, entityId: string) {
    return this.prisma.auditRecord.findMany({
      where: { entity_type: entityType, entity_id: entityId },
      orderBy: { timestamp: 'desc' },
    });
  }

  // Mock AuditSGL external call — will be replaced with real API
  async submitToAuditSGL(evidenceId: string, evidenceHash: string, txHash?: string) {
    this.logger.log(`[MOCK] AuditSGL submission: evidence=${evidenceId} hash=${evidenceHash} tx=${txHash}`);

    // Simulate external audit response
    const mockResponse = {
      audit_id: `AUDIT-${Date.now().toString(36).toUpperCase()}`,
      status: 'verified',
      risk_score: 0,
      timestamp: new Date().toISOString(),
    };

    await this.prisma.evidence.update({
      where: { id: evidenceId },
      data: { audit_response_id: mockResponse.audit_id },
    });

    return mockResponse;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { sha256 } from '../../../../../packages/crypto/index';

function canonicalize(obj: any): any {
  if (Array.isArray(obj)) return obj.map(canonicalize);
  if (obj && typeof obj === 'object') {
    const sortedKeys = Object.keys(obj).sort();
    const out: any = {};
    for (const k of sortedKeys) {
      out[k] = canonicalize(obj[k]);
    }
    return out;
  }
  return obj;
}

@Injectable()
export class EvidenceService {
  constructor(private prisma: PrismaService) {}

  version = '1.0';

  canonicalizeAndHash(evidence: any) {
    const canonical = canonicalize(evidence);
    const payload = { version: this.version, canonical };
    const str = JSON.stringify(payload);
    const hash = sha256(str);
    return { version: this.version, canonical, hash, str };
  }

  async createEvidence(procedureId: string, evidence: any) {
    const { version, hash } = this.canonicalizeAndHash(evidence);
    const rec = await this.prisma.evidence.create({ data: { procedure_id: procedureId, schema_version: version, evidence_hash: hash } });
    return rec;
  }
}

import * as crypto from 'crypto';

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function normalizeJson(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

export default { sha256, normalizeJson };

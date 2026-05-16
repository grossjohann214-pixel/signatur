import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    // tenant_id must be present in request.user (from JWT) or headers
    const user = req.user || {};
    const headerTenant = req.headers['x-tenant-id'] || req.headers['x-tenant'] || null;
    const headerPartner = req.headers['x-partner-id'] || null;

    const tenantId = user.tenant_id || headerTenant;
    const partnerId = user.partner_id || headerPartner;

    if (!tenantId) throw new ForbiddenException('tenant_id required');

    if (user && user.tenant_id && headerTenant && user.tenant_id !== headerTenant) {
      throw new ForbiddenException('tenant mismatch');
    }

    req.tenant = tenantId;
    req.partner = partnerId || null;

    return true;
  }
}

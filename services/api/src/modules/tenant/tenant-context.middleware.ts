import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void) {
    // tenant_id eh resolvido pelo JwtStrategy e fica em req.user.tenant_id
    // Este middleware apenas garante que req.tenantId esteja disponivel
    if (req.user?.tenant_id) {
      req.tenantId = req.user.tenant_id;
    }
    next();
  }
}

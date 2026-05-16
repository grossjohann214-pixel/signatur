import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { tenantStorage } from './tenant-context';

@Injectable()
export class TenantTransactionInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const tenantId = req?.user?.tenant_id || null;
    const bypass = !tenantId;

    return from(
      this.prisma.$transaction(async (tx: any) => {
        if (bypass) {
          await tx.$executeRawUnsafe(
            `SELECT set_config('app.bypass_rls', 'on', true)`,
          );
        } else {
          await tx.$executeRawUnsafe(
            `SELECT set_config('app.current_tenant_id', $1, true)`,
            tenantId,
          );
        }

        return tenantStorage.run({ tenantId, bypass, tx }, async () => {
          return next.handle().toPromise();
        });
      }),
    );
  }
}

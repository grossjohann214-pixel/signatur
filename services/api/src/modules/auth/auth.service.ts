import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user: any = await this.prisma.partnerUser.findUnique({ where: { email } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) return null;

    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { sub: user.id, role: user.role, tenant_id: user.tenant_id, partner_id: user.partner_id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validateJwtPayload(payload: any) {
    if (!payload || !payload.sub) throw new UnauthorizedException();
    const user = await this.prisma.partnerUser.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();
    const { password, ...result } = user;
    return result;
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }
}

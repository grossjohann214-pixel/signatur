import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('E2E - Full Flow', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let partnerId: string;
  const email = `e2e_${Date.now()}@test.local`;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = module.get(PrismaService);
  });

  afterAll(async () => {
    // Cleanup
    await prisma.partnerContract.deleteMany({});
    await prisma.partnerScopeRequest.deleteMany({});
    await prisma.partnerUser.deleteMany({ where: { email } });
    await prisma.partnerTenant.deleteMany({});
    await prisma.partnerBranding.deleteMany({});
    await prisma.partner.deleteMany({ where: { company_name: 'E2E Corp' } });
    await app.close();
  });

  // 1. Register
  it('POST /api/partners/register', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/partners/register')
      .send({ company_name: 'E2E Corp', owner_email: email, owner_password: 'Test123!@#' })
      .expect(201);

    expect(res.body.partner_id).toBeDefined();
    expect(res.body.status).toBe('draft');
    partnerId = res.body.partner_id;
  });

  // 2. Validation rejects bad input
  it('POST /api/partners/register rejects invalid email', async () => {
    await request(app.getHttpServer())
      .post('/api/partners/register')
      .send({ company_name: 'Bad', owner_email: 'not-an-email', owner_password: 'Test123!@#' })
      .expect(400);
  });

  // 3. Login
  it('POST /api/auth/login', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'Test123!@#' })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    accessToken = res.body.access_token;
  });

  // 4. Wrong password
  it('POST /api/auth/login rejects wrong password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'wrong' })
      .expect(401);
  });

  // 5. GET /auth/me
  it('GET /api/auth/me returns user', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.email).toBe(email);
    expect(res.body.role).toBe('admin');
  });

  // 6. GET /partners/me
  it('GET /api/partners/me returns partner', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/partners/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.company_name).toBe('E2E Corp');
  });

  // 7. GET /partners/me/status
  it('GET /api/partners/me/status returns draft', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/partners/me/status')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.status).toBe('draft');
    expect(res.body.production_released).toBe(false);
  });

  // 8. Protected route without token
  it('GET /api/partners/me without token returns 401', async () => {
    await request(app.getHttpServer())
      .get('/api/partners/me')
      .expect(401);
  });

  // 9. Admin route without token returns 401
  it('GET /api/admin/partners/pending without token returns 401', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/partners/pending')
      
      .expect(401);
  });
});

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional(),
  NODE_ENV: z.string().optional(),
  JWT_SECRET: z.string().min(8),
});

export const env = EnvSchema.safeParse(process.env);

if (!env.success) {
  // In Fase 0 we will not throw to avoid blocking local edits; log for visibility.
  console.warn('Env validation warnings:', env.error.format());
}

export default env;

import { z } from 'zod';

export const PartnerRegistrationSchema = z.object({
  company_name: z.string().min(1),
  cnpj: z.string().optional(),
  trading_name: z.string().optional(),
  contact_email: z.string().email(),
});

export type PartnerRegistration = z.infer<typeof PartnerRegistrationSchema>;

export default {};

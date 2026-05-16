// Shared TypeScript types for SingulAI Validate
export type UUID = string;

export interface BaseEntity {
  id: string;
  tenant_id: string;
  partner_id?: string | null;
  created_by?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Partner extends BaseEntity {
  company_name: string;
  cnpj?: string | null;
  trading_name?: string | null;
  status: string;
}

export default {};

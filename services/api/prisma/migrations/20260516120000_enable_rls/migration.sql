-- Row Level Security para isolamento multi-tenant
-- Tabelas com tenant_id: Partner, PartnerTenant, PartnerScopeRequest,
-- PartnerContract, PartnerUser, Customer, Procedure

-- Funcao helper: retorna true se bypass ativo ou tenant bate
CREATE OR REPLACE FUNCTION sgl_tenant_check(row_tenant_id text)
RETURNS boolean AS $$
BEGIN
  IF current_setting('app.bypass_rls', true) = 'on' THEN
    RETURN true;
  END IF;
  RETURN row_tenant_id = current_setting('app.current_tenant_id', true);
END;
$$ LANGUAGE plpgsql STABLE;

-- Partner
ALTER TABLE "Partner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Partner" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Partner"
  USING (sgl_tenant_check(tenant_id))
  WITH CHECK (sgl_tenant_check(tenant_id));

-- PartnerTenant
ALTER TABLE "PartnerTenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnerTenant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "PartnerTenant"
  USING (sgl_tenant_check(tenant_id))
  WITH CHECK (sgl_tenant_check(tenant_id));

-- PartnerScopeRequest
ALTER TABLE "PartnerScopeRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnerScopeRequest" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "PartnerScopeRequest"
  USING (sgl_tenant_check(tenant_id))
  WITH CHECK (sgl_tenant_check(tenant_id));

-- PartnerContract
ALTER TABLE "PartnerContract" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnerContract" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "PartnerContract"
  USING (sgl_tenant_check(tenant_id))
  WITH CHECK (sgl_tenant_check(tenant_id));

-- PartnerUser
ALTER TABLE "PartnerUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnerUser" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "PartnerUser"
  USING (sgl_tenant_check(tenant_id))
  WITH CHECK (sgl_tenant_check(tenant_id));

-- Customer
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Customer"
  USING (sgl_tenant_check(tenant_id))
  WITH CHECK (sgl_tenant_check(tenant_id));

-- Procedure
ALTER TABLE "Procedure" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Procedure" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Procedure"
  USING (sgl_tenant_check(tenant_id))
  WITH CHECK (sgl_tenant_check(tenant_id));

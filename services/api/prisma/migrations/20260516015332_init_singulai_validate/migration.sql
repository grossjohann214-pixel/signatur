-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "cnpj" TEXT,
    "trading_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerBranding" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "logo_url" TEXT,
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "display_name" TEXT,

    CONSTRAINT "PartnerBranding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerTenant" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',

    CONSTRAINT "PartnerTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "partner_id" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "type" TEXT NOT NULL,
    "template_id" TEXT,
    "status" TEXT NOT NULL,
    "document_hash" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureParticipant" (
    "id" TEXT NOT NULL,
    "procedure_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "document_masked" TEXT,
    "wallet_address" TEXT,
    "signature_hash" TEXT,
    "status" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "ProcedureParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureLink" (
    "id" TEXT NOT NULL,
    "procedure_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "opened_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcedureLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "procedure_id" TEXT NOT NULL,
    "schema_version" TEXT NOT NULL,
    "evidence_hash" TEXT NOT NULL,
    "protocol_number" TEXT,
    "web3_tx_hash" TEXT,
    "audit_response_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Web3Transaction" (
    "id" TEXT NOT NULL,
    "procedure_id" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "block_number" INTEGER,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3),

    CONSTRAINT "Web3Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditRecord" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "actor_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerBranding_partner_id_key" ON "PartnerBranding"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerTenant_partner_id_key" ON "PartnerTenant"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "PartnerBranding" ADD CONSTRAINT "PartnerBranding_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerTenant" ADD CONSTRAINT "PartnerTenant_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

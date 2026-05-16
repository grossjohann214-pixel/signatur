-- AlterTable
ALTER TABLE "PartnerTenant" ADD COLUMN     "production_released" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "production_released_at" TIMESTAMP(3),
ADD COLUMN     "production_released_by" TEXT;

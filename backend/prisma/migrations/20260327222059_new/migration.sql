-- CreateEnum
CREATE TYPE "ProfessionalClientStatus" AS ENUM ('invited', 'active', 'disabled');

-- AlterTable
ALTER TABLE "professional_client" ADD COLUMN     "status" "ProfessionalClientStatus" NOT NULL DEFAULT 'invited';

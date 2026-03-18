/*
  Warnings:

  - You are about to drop the column `notes` on the `guideline` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `guideline` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `nutrition_goal` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "GoalSource" AS ENUM ('system_default', 'user_defined', 'professional_defined');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('active', 'archived');

-- AlterTable
ALTER TABLE "guideline" DROP COLUMN "notes",
DROP COLUMN "period";

-- AlterTable
ALTER TABLE "nutrition_goal" DROP COLUMN "period",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "source" "GoalSource" NOT NULL DEFAULT 'system_default',
ADD COLUMN     "status" "GoalStatus" NOT NULL DEFAULT 'active';

-- DropEnum
DROP TYPE "Period";

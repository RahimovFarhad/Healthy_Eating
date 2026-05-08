/*
  Warnings:

  - You are about to drop the `client_risk_snapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recipe_assignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `risk_rule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "client_risk_snapshot" DROP CONSTRAINT "client_risk_snapshot_rule_id_fkey";

-- DropForeignKey
ALTER TABLE "client_risk_snapshot" DROP CONSTRAINT "client_risk_snapshot_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_assignment" DROP CONSTRAINT "recipe_assignment_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_assignment" DROP CONSTRAINT "recipe_assignment_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_assignment" DROP CONSTRAINT "recipe_assignment_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "risk_rule" DROP CONSTRAINT "risk_rule_nutrient_id_fkey";

-- DropTable
DROP TABLE "client_risk_snapshot";

-- DropTable
DROP TABLE "recipe_assignment";

-- DropTable
DROP TABLE "risk_rule";

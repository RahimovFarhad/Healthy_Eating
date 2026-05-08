/*
  Warnings:

  - A unique constraint covering the columns `[subscriber_id,recipe_id]` on the table `recipe_review` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "recipe_review_subscriber_id_review_id_key";

-- AlterTable
ALTER TABLE "recipe" ADD COLUMN     "carbs" DECIMAL(8,2),
ADD COLUMN     "fat" DECIMAL(8,2),
ADD COLUMN     "kcal" INTEGER,
ADD COLUMN     "protein" DECIMAL(8,2),
ADD COLUMN     "salt" DECIMAL(8,2),
ADD COLUMN     "saturated_fat" DECIMAL(8,2),
ADD COLUMN     "sugars" DECIMAL(8,2);

-- CreateIndex
CREATE UNIQUE INDEX "recipe_review_subscriber_id_recipe_id_key" ON "recipe_review"("subscriber_id", "recipe_id");

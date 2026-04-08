/*
  Warnings:

  - You are about to drop the column `food_item_id` on the `diary_entry_item` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_g` on the `diary_entry_item` table. All the data in the column will be lost.
  - You are about to drop the `food_nutrient` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[source,external_id]` on the table `food_item` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `portion_id` to the `diary_entry_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `diary_entry_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `food_item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FoodSource" AS ENUM ('fatsecret', 'user', 'system');

-- DropForeignKey
ALTER TABLE "diary_entry_item" DROP CONSTRAINT "diary_entry_item_food_item_id_fkey";

-- DropForeignKey
ALTER TABLE "food_nutrient" DROP CONSTRAINT "food_nutrient_food_item_id_fkey";

-- DropForeignKey
ALTER TABLE "food_nutrient" DROP CONSTRAINT "food_nutrient_nutrient_id_fkey";

-- AlterTable
ALTER TABLE "diary_entry_item" DROP COLUMN "food_item_id",
DROP COLUMN "quantity_g",
ADD COLUMN     "portion_id" INTEGER NOT NULL,
ADD COLUMN     "quantity" DECIMAL(10,3) NOT NULL;

-- AlterTable
ALTER TABLE "food_item" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "source" "FoodSource" NOT NULL;

-- DropTable
DROP TABLE "food_nutrient";

-- CreateTable
CREATE TABLE "food_portion" (
    "portion_id" SERIAL NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "weight_g" DECIMAL(10,2),

    CONSTRAINT "food_portion_pkey" PRIMARY KEY ("portion_id")
);

-- CreateTable
CREATE TABLE "food_portion_nutrient" (
    "id" SERIAL NOT NULL,
    "portion_id" INTEGER NOT NULL,
    "nutrient_id" INTEGER NOT NULL,
    "amount" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "food_portion_nutrient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "food_portion_nutrient_portion_id_nutrient_id_key" ON "food_portion_nutrient"("portion_id", "nutrient_id");

-- CreateIndex
CREATE UNIQUE INDEX "food_item_source_external_id_key" ON "food_item"("source", "external_id");

-- AddForeignKey
ALTER TABLE "food_portion" ADD CONSTRAINT "food_portion_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_item"("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_portion_nutrient" ADD CONSTRAINT "food_portion_nutrient_portion_id_fkey" FOREIGN KEY ("portion_id") REFERENCES "food_portion"("portion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_portion_nutrient" ADD CONSTRAINT "food_portion_nutrient_nutrient_id_fkey" FOREIGN KEY ("nutrient_id") REFERENCES "nutrient"("nutrient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entry_item" ADD CONSTRAINT "diary_entry_item_portion_id_fkey" FOREIGN KEY ("portion_id") REFERENCES "food_portion"("portion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

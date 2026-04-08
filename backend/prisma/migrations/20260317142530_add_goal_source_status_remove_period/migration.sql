/*
  Warnings:

  - Made the column `source` on table `guideline` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "guideline" ALTER COLUMN "source" SET NOT NULL;

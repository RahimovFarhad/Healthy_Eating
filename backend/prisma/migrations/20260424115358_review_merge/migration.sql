/*
  Warnings:

  - You are about to drop the `recipe_comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recipe_rating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "recipe_comment" DROP CONSTRAINT "recipe_comment_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_comment" DROP CONSTRAINT "recipe_comment_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_rating" DROP CONSTRAINT "recipe_rating_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_rating" DROP CONSTRAINT "recipe_rating_subscriber_id_fkey";

-- DropTable
DROP TABLE "recipe_comment";

-- DropTable
DROP TABLE "recipe_rating";

-- CreateTable
CREATE TABLE "recipe_review" (
    "review_id" SERIAL NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_review_pkey" PRIMARY KEY ("review_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipe_review_subscriber_id_review_id_key" ON "recipe_review"("subscriber_id", "review_id");

-- AddForeignKey
ALTER TABLE "recipe_review" ADD CONSTRAINT "recipe_review_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_review" ADD CONSTRAINT "recipe_review_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

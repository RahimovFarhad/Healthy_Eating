-- AlterTable
ALTER TABLE "food_item" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by_user_id" INTEGER;

-- AddForeignKey
ALTER TABLE "food_item" ADD CONSTRAINT "food_item_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

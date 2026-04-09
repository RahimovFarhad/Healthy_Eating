/*
  Warnings:

  - You are about to drop the `advice_message` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('Professional', 'Subscriber');

-- DropForeignKey
ALTER TABLE "advice_message" DROP CONSTRAINT "advice_message_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "advice_message" DROP CONSTRAINT "advice_message_subscriber_id_fkey";

-- DropTable
DROP TABLE "advice_message";

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "sent_by" "MessageSender" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

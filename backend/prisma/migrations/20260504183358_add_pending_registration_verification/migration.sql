-- AlterTable
ALTER TABLE "recipe" ADD COLUMN     "category" TEXT,
ADD COLUMN     "cook_time" TEXT,
ADD COLUMN     "cuisine" TEXT,
ADD COLUMN     "fibre" DECIMAL(8,2),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "servings" INTEGER;

-- CreateTable
CREATE TABLE "pending_registration" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "verification_code_hash" TEXT NOT NULL,
    "code_expires_at" TIMESTAMP(3) NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "resend_count" INTEGER NOT NULL DEFAULT 0,
    "last_sent_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_registration_email_key" ON "pending_registration"("email");

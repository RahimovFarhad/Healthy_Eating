-- CreateTable
CREATE TABLE "recipe_share" (
    "id" SERIAL NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "RecipeStatus" NOT NULL DEFAULT 'assigned',
    "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_share_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_usage" (
    "id" SERIAL NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,

    CONSTRAINT "recipe_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipe_usage_subscriber_id_recipe_id_key" ON "recipe_usage"("subscriber_id", "recipe_id");

-- AddForeignKey
ALTER TABLE "recipe_share" ADD CONSTRAINT "recipe_share_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_share" ADD CONSTRAINT "recipe_share_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_share" ADD CONSTRAINT "recipe_share_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_usage" ADD CONSTRAINT "recipe_usage_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_usage" ADD CONSTRAINT "recipe_usage_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

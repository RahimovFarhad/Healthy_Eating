/*
  Warnings:

  - A unique constraint covering the columns `[food_item_id,nutrient_id]` on the table `food_nutrient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[professional_id,subscriber_id]` on the table `professional_client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscriber_id,recipe_id]` on the table `recipe_favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[recipe_id,ingredient_id]` on the table `recipe_ingredient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscriber_id,recipe_id]` on the table `recipe_rating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "food_nutrient_food_item_id_nutrient_id_key" ON "food_nutrient"("food_item_id", "nutrient_id");

-- CreateIndex
CREATE UNIQUE INDEX "professional_client_professional_id_subscriber_id_key" ON "professional_client"("professional_id", "subscriber_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_favorite_subscriber_id_recipe_id_key" ON "recipe_favorite"("subscriber_id", "recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_ingredient_recipe_id_ingredient_id_key" ON "recipe_ingredient"("recipe_id", "ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_rating_subscriber_id_recipe_id_key" ON "recipe_rating"("subscriber_id", "recipe_id");

-- AddForeignKey
ALTER TABLE "professional_client" ADD CONSTRAINT "professional_client_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_client" ADD CONSTRAINT "professional_client_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_nutrient" ADD CONSTRAINT "food_nutrient_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_item"("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_nutrient" ADD CONSTRAINT "food_nutrient_nutrient_id_fkey" FOREIGN KEY ("nutrient_id") REFERENCES "nutrient"("nutrient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entry" ADD CONSTRAINT "diary_entry_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entry_item" ADD CONSTRAINT "diary_entry_item_diary_entry_id_fkey" FOREIGN KEY ("diary_entry_id") REFERENCES "diary_entry"("diary_entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entry_item" ADD CONSTRAINT "diary_entry_item_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_item"("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advice_message" ADD CONSTRAINT "advice_message_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advice_message" ADD CONSTRAINT "advice_message_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_goal" ADD CONSTRAINT "nutrition_goal_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_goal" ADD CONSTRAINT "nutrition_goal_set_by_professional_id_fkey" FOREIGN KEY ("set_by_professional_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_goal" ADD CONSTRAINT "nutrition_goal_nutrient_id_fkey" FOREIGN KEY ("nutrient_id") REFERENCES "nutrient"("nutrient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guideline" ADD CONSTRAINT "guideline_nutrient_id_fkey" FOREIGN KEY ("nutrient_id") REFERENCES "nutrient"("nutrient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_rule" ADD CONSTRAINT "risk_rule_nutrient_id_fkey" FOREIGN KEY ("nutrient_id") REFERENCES "nutrient"("nutrient_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_risk_snapshot" ADD CONSTRAINT "client_risk_snapshot_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_risk_snapshot" ADD CONSTRAINT "client_risk_snapshot_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "risk_rule"("rule_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "recipe_ingredient_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "recipe_ingredient_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredient"("ingredient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_favorite" ADD CONSTRAINT "recipe_favorite_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_favorite" ADD CONSTRAINT "recipe_favorite_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_assignment" ADD CONSTRAINT "recipe_assignment_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_assignment" ADD CONSTRAINT "recipe_assignment_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_assignment" ADD CONSTRAINT "recipe_assignment_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_rating" ADD CONSTRAINT "recipe_rating_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_rating" ADD CONSTRAINT "recipe_rating_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_comment" ADD CONSTRAINT "recipe_comment_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_comment" ADD CONSTRAINT "recipe_comment_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan" ADD CONSTRAINT "plan_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_item" ADD CONSTRAINT "plan_item_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_item" ADD CONSTRAINT "plan_item_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

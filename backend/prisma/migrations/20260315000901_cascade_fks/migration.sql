-- DropForeignKey
ALTER TABLE "advice_message" DROP CONSTRAINT "advice_message_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "advice_message" DROP CONSTRAINT "advice_message_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "client_risk_snapshot" DROP CONSTRAINT "client_risk_snapshot_rule_id_fkey";

-- DropForeignKey
ALTER TABLE "client_risk_snapshot" DROP CONSTRAINT "client_risk_snapshot_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "diary_entry" DROP CONSTRAINT "diary_entry_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "diary_entry_item" DROP CONSTRAINT "diary_entry_item_diary_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "diary_entry_item" DROP CONSTRAINT "diary_entry_item_portion_id_fkey";

-- DropForeignKey
ALTER TABLE "food_portion" DROP CONSTRAINT "food_portion_food_item_id_fkey";

-- DropForeignKey
ALTER TABLE "food_portion_nutrient" DROP CONSTRAINT "food_portion_nutrient_nutrient_id_fkey";

-- DropForeignKey
ALTER TABLE "food_portion_nutrient" DROP CONSTRAINT "food_portion_nutrient_portion_id_fkey";

-- DropForeignKey
ALTER TABLE "guideline" DROP CONSTRAINT "guideline_nutrient_id_fkey";

-- DropForeignKey
ALTER TABLE "nutrition_goal" DROP CONSTRAINT "nutrition_goal_nutrient_id_fkey";

-- DropForeignKey
ALTER TABLE "nutrition_goal" DROP CONSTRAINT "nutrition_goal_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "plan" DROP CONSTRAINT "plan_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "plan_item" DROP CONSTRAINT "plan_item_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "plan_item" DROP CONSTRAINT "plan_item_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "professional_client" DROP CONSTRAINT "professional_client_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "professional_client" DROP CONSTRAINT "professional_client_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_assignment" DROP CONSTRAINT "recipe_assignment_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_assignment" DROP CONSTRAINT "recipe_assignment_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_assignment" DROP CONSTRAINT "recipe_assignment_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_comment" DROP CONSTRAINT "recipe_comment_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_comment" DROP CONSTRAINT "recipe_comment_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_favorite" DROP CONSTRAINT "recipe_favorite_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_favorite" DROP CONSTRAINT "recipe_favorite_subscriber_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_ingredient" DROP CONSTRAINT "recipe_ingredient_ingredient_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_ingredient" DROP CONSTRAINT "recipe_ingredient_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_rating" DROP CONSTRAINT "recipe_rating_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_rating" DROP CONSTRAINT "recipe_rating_subscriber_id_fkey";

-- AddForeignKey
ALTER TABLE "professional_client" ADD CONSTRAINT "professional_client_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_client" ADD CONSTRAINT "professional_client_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_portion" ADD CONSTRAINT "food_portion_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_item"("food_item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_portion_nutrient" ADD CONSTRAINT "food_portion_nutrient_portion_id_fkey" FOREIGN KEY ("portion_id") REFERENCES "food_portion"("portion_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_portion_nutrient" ADD CONSTRAINT "food_portion_nutrient_nutrient_id_fkey" FOREIGN KEY ("nutrient_id") REFERENCES "nutrient"("nutrient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entry" ADD CONSTRAINT "diary_entry_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entry_item" ADD CONSTRAINT "diary_entry_item_diary_entry_id_fkey" FOREIGN KEY ("diary_entry_id") REFERENCES "diary_entry"("diary_entry_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entry_item" ADD CONSTRAINT "diary_entry_item_portion_id_fkey" FOREIGN KEY ("portion_id") REFERENCES "food_portion"("portion_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advice_message" ADD CONSTRAINT "advice_message_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advice_message" ADD CONSTRAINT "advice_message_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_goal" ADD CONSTRAINT "nutrition_goal_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_goal" ADD CONSTRAINT "nutrition_goal_nutrient_id_fkey" FOREIGN KEY ("nutrient_id") REFERENCES "nutrient"("nutrient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guideline" ADD CONSTRAINT "guideline_nutrient_id_fkey" FOREIGN KEY ("nutrient_id") REFERENCES "nutrient"("nutrient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_risk_snapshot" ADD CONSTRAINT "client_risk_snapshot_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_risk_snapshot" ADD CONSTRAINT "client_risk_snapshot_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "risk_rule"("rule_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "recipe_ingredient_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "recipe_ingredient_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredient"("ingredient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_favorite" ADD CONSTRAINT "recipe_favorite_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_favorite" ADD CONSTRAINT "recipe_favorite_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_assignment" ADD CONSTRAINT "recipe_assignment_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_assignment" ADD CONSTRAINT "recipe_assignment_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_assignment" ADD CONSTRAINT "recipe_assignment_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_rating" ADD CONSTRAINT "recipe_rating_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_rating" ADD CONSTRAINT "recipe_rating_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_comment" ADD CONSTRAINT "recipe_comment_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_comment" ADD CONSTRAINT "recipe_comment_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan" ADD CONSTRAINT "plan_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_item" ADD CONSTRAINT "plan_item_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_item" ADD CONSTRAINT "plan_item_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;

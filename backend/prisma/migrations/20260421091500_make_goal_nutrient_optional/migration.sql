-- Allow free-form goals that are not tied to a specific nutrient
ALTER TABLE "nutrition_goal"
ALTER COLUMN "nutrient_id" DROP NOT NULL;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('default', 'subscriber', 'professional');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateEnum
CREATE TYPE "NutrientType" AS ENUM ('macro', 'micro');

-- CreateEnum
CREATE TYPE "Period" AS ENUM ('daily', 'weekly', 'monthly');

-- CreateEnum
CREATE TYPE "Demographic" AS ENUM ('adult', 'child_1_3', 'child_4_6', 'child_7_10', 'teen', 'older_adult');

-- CreateEnum
CREATE TYPE "Comparator" AS ENUM ('<', '<=', '>', '>=', 'between', 'outside');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('assigned', 'viewed', 'saved', 'cooked', 'dismissed');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('auto_suggested', 'template', 'manual');

-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "professional_client" (
    "id" SERIAL NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professional_client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_item" (
    "food_item_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,

    CONSTRAINT "food_item_pkey" PRIMARY KEY ("food_item_id")
);

-- CreateTable
CREATE TABLE "nutrient" (
    "nutrient_id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "type" "NutrientType" NOT NULL,

    CONSTRAINT "nutrient_pkey" PRIMARY KEY ("nutrient_id")
);

-- CreateTable
CREATE TABLE "food_nutrient" (
    "id" SERIAL NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "nutrient_id" INTEGER NOT NULL,
    "amount_per_100g" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "food_nutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diary_entry" (
    "diary_entry_id" SERIAL NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "consumed_at" TIMESTAMP(3) NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "diary_entry_pkey" PRIMARY KEY ("diary_entry_id")
);

-- CreateTable
CREATE TABLE "diary_entry_item" (
    "id" SERIAL NOT NULL,
    "diary_entry_id" INTEGER NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "quantity_g" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "diary_entry_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advice_message" (
    "advice_id" SERIAL NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advice_message_pkey" PRIMARY KEY ("advice_id")
);

-- CreateTable
CREATE TABLE "nutrition_goal" (
    "goal_id" SERIAL NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "set_by_professional_id" INTEGER,
    "nutrient_id" INTEGER NOT NULL,
    "period" "Period" NOT NULL,
    "target_min" DECIMAL(12,4),
    "target_max" DECIMAL(12,4),
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "notes" TEXT,

    CONSTRAINT "nutrition_goal_pkey" PRIMARY KEY ("goal_id")
);

-- CreateTable
CREATE TABLE "guideline" (
    "guideline_id" SERIAL NOT NULL,
    "nutrient_id" INTEGER NOT NULL,
    "demographic" "Demographic" NOT NULL,
    "period" "Period" NOT NULL,
    "min_value" DECIMAL(12,4),
    "max_value" DECIMAL(12,4),
    "source" TEXT,
    "notes" TEXT,

    CONSTRAINT "guideline_pkey" PRIMARY KEY ("guideline_id")
);

-- CreateTable
CREATE TABLE "risk_rule" (
    "rule_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nutrient_id" INTEGER,
    "comparator" "Comparator" NOT NULL,
    "threshold_min" DECIMAL(12,4),
    "threshold_max" DECIMAL(12,4),
    "window_days" INTEGER NOT NULL,
    "severity" "Severity" NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "risk_rule_pkey" PRIMARY KEY ("rule_id")
);

-- CreateTable
CREATE TABLE "client_risk_snapshot" (
    "snapshot_id" SERIAL NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "rule_id" INTEGER NOT NULL,
    "risk_level" "Severity" NOT NULL,
    "score" DECIMAL(12,4),
    "reason" TEXT,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_risk_snapshot_pkey" PRIMARY KEY ("snapshot_id")
);

-- CreateTable
CREATE TABLE "recipe" (
    "recipe_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,

    CONSTRAINT "recipe_pkey" PRIMARY KEY ("recipe_id")
);

-- CreateTable
CREATE TABLE "ingredient" (
    "ingredient_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ingredient_pkey" PRIMARY KEY ("ingredient_id")
);

-- CreateTable
CREATE TABLE "recipe_ingredient" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "quantity" TEXT,

    CONSTRAINT "recipe_ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_favorite" (
    "id" SERIAL NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_assignment" (
    "assignment_id" SERIAL NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "note" TEXT,
    "status" "RecipeStatus" NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_assignment_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateTable
CREATE TABLE "recipe_rating" (
    "rating_id" SERIAL NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_rating_pkey" PRIMARY KEY ("rating_id")
);

-- CreateTable
CREATE TABLE "recipe_comment" (
    "comment_id" SERIAL NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "plan" (
    "plan_id" SERIAL NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "plan_type" "PlanType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "plan_item" (
    "plan_item_id" SERIAL NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "planned_date" DATE NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "servings" INTEGER,

    CONSTRAINT "plan_item_pkey" PRIMARY KEY ("plan_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "nutrient_code_key" ON "nutrient"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_name_key" ON "ingredient"("name");

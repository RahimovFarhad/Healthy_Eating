CREATE TABLE "goal_check_in" (
  "check_in_id" SERIAL NOT NULL,
  "goal_id" INTEGER NOT NULL,
  "date" DATE NOT NULL,
  "is_done" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "goal_check_in_pkey" PRIMARY KEY ("check_in_id")
);

CREATE UNIQUE INDEX "goal_check_in_goal_id_date_key" ON "goal_check_in"("goal_id", "date");

ALTER TABLE "goal_check_in"
ADD CONSTRAINT "goal_check_in_goal_id_fkey"
FOREIGN KEY ("goal_id") REFERENCES "nutrition_goal"("goal_id")
ON DELETE CASCADE ON UPDATE CASCADE;

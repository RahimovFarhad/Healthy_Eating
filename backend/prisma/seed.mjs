import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const nutrients = [
  { code: "calories", name: "Calories", unit: "kcal", type: "macro" },
  { code: "protein", name: "Protein", unit: "g", type: "macro" },
  { code: "carbohydrates", name: "Carbohydrates", unit: "g", type: "macro" },
  { code: "fat", name: "Fat", unit: "g", type: "macro" },
  { code: "fibre", name: "Fibre", unit: "g", type: "macro" },
  { code: "sugar", name: "Sugar", unit: "g", type: "macro" },
  { code: "salt", name: "Salt", unit: "g", type: "micro" }
];

// ──────────────────────────────────────────────
// 2. Guidelines — UK Government / PHE 2016, SACN 2011/2015
//
// All values are daily. Male/female values averaged
// where the Demographic enum is not gendered.
//
// Conventions:
//   calories     → max only (EAR, capped to address overweight)
//   protein      → min only (RNI, sufficient for 97.5%)
//   carbohydrates→ min only ("at least")
//   fat          → max only ("less than")
//   fibre        → min only (recommended intake target)
//   sugar        → max only (free sugars, "less than")
//   sodium       → max only (population target, mg)
// ──────────────────────────────────────────────

const GUIDELINE_SOURCE = "UK Government / PHE 2016, SACN 2011/2015";

// Each entry: [nutrientCode, demographic, minValue, maxValue]
const guidelines = [
  // ── child_1_3 (ages 1–3) ──
  ["calories",      "child_1_3", null,  1046],
  ["protein",       "child_1_3", 14.5,  null],
  ["carbohydrates", "child_1_3", 140,   null],
  // fat: no DRV set for under-5s
  ["fibre",         "child_1_3", 15,    null],
  ["sugar",         "child_1_3", null,  14],
  ["sodium",        "child_1_3", null,  800],

  // ── child_4_6 (ages 4–6) ──
  ["calories",      "child_4_6", null,  1430],
  ["protein",       "child_4_6", 19.7,  null],
  ["carbohydrates", "child_4_6", 191,   null],
  ["fat",           "child_4_6", null,  56],
  ["fibre",         "child_4_6", 17.5,  null],
  ["sugar",         "child_4_6", null,  19],
  ["sodium",        "child_4_6", null,  1200],

  // ── child_7_10 (ages 7–10) ──
  ["calories",      "child_7_10", null, 1760],
  ["protein",       "child_7_10", 28.3, null],
  ["carbohydrates", "child_7_10", 235,  null],
  ["fat",           "child_7_10", null, 69],
  ["fibre",         "child_7_10", 20,   null],
  ["sugar",         "child_7_10", null, 24],
  ["sodium",        "child_7_10", null, 2000],

  // ── teen (ages 11–18) ──
  ["calories",      "teen", null,  2250],
  ["protein",       "teen", 45.9,  null],
  ["carbohydrates", "teen", 300,   null],
  ["fat",           "teen", null,  88],
  ["fibre",         "teen", 27.5,  null],
  ["sugar",         "teen", null,  30],
  ["sodium",        "teen", null,  2400],

  // ── adult (ages 19–64) ──
  ["calories",      "adult", null,  2250],
  ["protein",       "adult", 50.3,  null],
  ["carbohydrates", "adult", 300,   null],
  ["fat",           "adult", null,  88],
  ["fibre",         "adult", 30,    null],
  ["sugar",         "adult", null,  30],
  ["sodium",        "adult", null,  2400],

  // ── older_adult (ages 65–74) ──
  ["calories",      "older_adult", null,  2127],
  ["protein",       "older_adult", 49.9,  null],
  ["carbohydrates", "older_adult", 284,   null],
  ["fat",           "older_adult", null,  83],
  ["fibre",         "older_adult", 30,    null],
  ["sugar",         "older_adult", null,  29],
  ["sodium",        "older_adult", null,  2400],
];

async function readJSON(fileName) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const recipesPath = path.join(__dirname, fileName);

  const data = await fs.promises.readFile(recipesPath, 'utf-8');
  return JSON.parse(data);
}

async function upsertRecipeAsSystemFood({ recipe, nutrientMap }) {
  const externalId = `recipe:${recipe.recipeId}`;
  
  // I will use upsert instead of create to avoid issues when seed is run multiple times
  // PS externalId logic is first added for foods fetched from external APIs, so it may introduce some bugs (highly unlikely, but this comment is here for future reference)
  const foodItem = await prisma.foodItem.upsert({
    where: {
      source_externalId: {
        source: "system",
        externalId
      }
    },
    update: {
      name: recipe.title
    },
    create: {
      name: recipe.title,
      source: "system",
      externalId
    }
  });

  let portion = await prisma.foodPortion.findFirst({
    where: {
      foodItemId: foodItem.foodItemId,
      description: "1 serving"
    }
  });

  if (!portion) {
    portion = await prisma.foodPortion.create({
      data: {
        foodItemId: foodItem.foodItemId,
        description: "1 serving",
        weightG: null
      }
    });
  }

  const nutrientValues = [
    { code: "calories", amount: recipe.kcal ?? 0 },
    { code: "protein", amount: recipe.protein ?? 0 },
    { code: "carbohydrates", amount: recipe.carbs ?? 0 },
    { code: "fat", amount: recipe.fat ?? 0 },
    { code: "sugar", amount: recipe.sugars ?? 0 },
    { code: "sodium", amount: (recipe.salt ?? 0) * 400 }
  ];

  for (const n of nutrientValues) {
    const nutrientId = nutrientMap[n.code];
    if (!nutrientId) continue;

    await prisma.foodPortionNutrient.upsert({
      where: {
        portionId_nutrientId: {
          portionId: portion.portionId,
          nutrientId
        }
      },
      update: {
        amount: n.amount
      },
      create: {
        portionId: portion.portionId,
        nutrientId,
        amount: n.amount
      }
    });
  }

  return { foodItemId: foodItem.foodItemId, portionId: portion.portionId };
}


async function main() {
  for (const nutrient of nutrients) {
    await prisma.nutrient.upsert({
      where: { code: nutrient.code },
      update: {
        name: nutrient.name,
        unit: nutrient.unit,
        type: nutrient.type
      },
      create: nutrient
    });
  }

  console.log(`Seeded ${nutrients.length} nutrients`);

  const nutrientRows = await prisma.nutrient.findMany();
  const nutrientMap = Object.fromEntries(
    nutrientRows.map((n) => [n.code, n.nutrientId])
  );

  let guidelineCount = 0;

  for (const [code, demographic, minValue, maxValue] of guidelines) {
    const nutrientId = nutrientMap[code];
    if (!nutrientId) {
      console.warn(`Unknown nutrient code "${code}"`);
      continue;
    }

    // Checking if the guideline already exists 
    const existing = await prisma.guideline.findFirst({
      where: { nutrientId, demographic },
    });

    if (existing) {
      await prisma.guideline.update({
        where: { guidelineId: existing.guidelineId },
        data: {
          minValue,
          maxValue,
          source: GUIDELINE_SOURCE,
        },
      });
    } else {
      await prisma.guideline.create({
        data: {
          nutrientId,
          demographic,
          minValue,
          maxValue,
          source: GUIDELINE_SOURCE,
        },
      });
    }

    guidelineCount++;
  }

  console.log(`Seeded ${guidelineCount} guidelines across 6 demographics`);

  const recipes = await readJSON("./recipes.json");

  for (const r of recipes) {
    const recipe = await prisma.recipe.create({
      data: {
        title:        r.title,
        category:     r.category ?? null,
        cuisine:      r.cuisine ?? null,
        servings:     r.servings ?? null,
        cookTime:     r.time ?? null,
        image:        r.image ?? null,
        instructions: r.steps.join('\n\n'),
        kcal:         r.kcal,
        protein:      r.protein,
        carbs:        r.carbs,
        sugars:       r.sugars,
        fat:          r.fat,
        saturatedFat: r.saturatedFat,
        salt:         r.salt,
        fibre:        r.fibre ?? null,
      }
    });

    for (let i = 0; i < r.ingredients.length; i++) {
      const name = r.ingredientNames[i] ?? r.ingredients[i]

      const ingredient = await prisma.ingredient.upsert({ // I do upsert to prevent potential issues if same ingredients are reused
        where:  { name },
        update: {},
        create: { name }
      })

      await prisma.recipeIngredient.create({
        data: {
          recipeId:     recipe.recipeId,
          ingredientId: ingredient.ingredientId,
          quantity:     r.ingredients[i] 
        }
      })
    }

    await upsertRecipeAsSystemFood({ recipe, nutrientMap }); // I do this so that recipes can be logged as foods for easy of use

  }

  console.log(`Seeded ${recipes.length} recipes`)



}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

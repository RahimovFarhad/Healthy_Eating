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
  { code: "sodium", name: "Sodium", unit: "mg", type: "micro" }
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

  fs.readFile(recipesPath, function(err, data) { 

    if (err) throw err; 

    return JSON.parse(data); 
  }); 
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

  


}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

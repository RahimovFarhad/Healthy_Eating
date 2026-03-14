import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

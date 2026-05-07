import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";
import jwt from "jsonwebtoken";

const { sign } = jwt;

let testUserId = null;
let validAccessToken = null;
let createdRecipeIds = [];
let createdIngredientIds = [];

const TEST_ID = Date.now();

describe("Recipe API", () => {
  beforeAll(async () => {
    const testUser = await prisma.user.create({
      data: {
        fullName: "Recipe Test User",
        email: `recipe-test-${TEST_ID}@example.com`,
        passwordHash: "test-hash",
        role: "default",
      },
    });

    testUserId = testUser.userId;

    validAccessToken = sign(
      {
        userId: testUserId,
        email: testUser.email,
        role: "default",
        tokenType: "access",
      },
      process.env.JWT_SECRET || "default-secret-key",
      { expiresIn: "1h" }
    );

    const garlic = await prisma.ingredient.create({
      data: {
        name: `garlic recipe test ${TEST_ID}`,
      },
    });

    const chicken = await prisma.ingredient.create({
      data: {
        name: `chicken recipe test ${TEST_ID}`,
      },
    });

    const tomato = await prisma.ingredient.create({
      data: {
        name: `tomato recipe test ${TEST_ID}`,
      },
    });

    createdIngredientIds = [
      garlic.ingredientId,
      chicken.ingredientId,
      tomato.ingredientId,
    ];

    const britishBreakfast = await prisma.recipe.create({
      data: {
        title: `British Breakfast Test Recipe ${TEST_ID}`,
        category: "Breakfast",
        cuisine: "British",
        servings: 1,
        cookTime: "20 minutes",
        instructions: "Cook the test breakfast recipe.",
        kcal: 400,
        recipeIngredients: {
          create: [
            {
              quantity: "1 clove",
              ingredientId: garlic.ingredientId,
            },
            {
              quantity: "100g",
              ingredientId: chicken.ingredientId,
            },
          ],
        },
      },
    });

    const italianBreakfast = await prisma.recipe.create({
      data: {
        title: `Italian Breakfast Test Recipe ${TEST_ID}`,
        category: "Breakfast",
        cuisine: "Italian",
        servings: 2,
        cookTime: "15 minutes",
        instructions: "Cook the test Italian recipe.",
        kcal: 350,
        recipeIngredients: {
          create: [
            {
              quantity: "2 cloves",
              ingredientId: garlic.ingredientId,
            },
            {
              quantity: "1 portion",
              ingredientId: tomato.ingredientId,
            },
          ],
        },
      },
    });

    const italianDinner = await prisma.recipe.create({
      data: {
        title: `Italian Dinner Test Recipe ${TEST_ID}`,
        category: "Dinner",
        cuisine: "Italian",
        servings: 2,
        cookTime: "30 minutes",
        instructions: "Cook the test dinner recipe.",
        kcal: 500,
        recipeIngredients: {
          create: [
            {
              quantity: "150g",
              ingredientId: chicken.ingredientId,
            },
          ],
        },
      },
    });

    createdRecipeIds = [
      britishBreakfast.recipeId,
      italianBreakfast.recipeId,
      italianDinner.recipeId,
    ];
  });

  afterAll(async () => {
    if (createdRecipeIds.length > 0) {
      await prisma.recipeReview.deleteMany({
        where: {
          recipeId: {
            in: createdRecipeIds,
          },
        },
      });

      await prisma.recipeFavorite.deleteMany({
        where: {
          recipeId: {
            in: createdRecipeIds,
          },
        },
      });

      await prisma.recipeIngredient.deleteMany({
        where: {
          recipeId: {
            in: createdRecipeIds,
          },
        },
      });

      await prisma.recipe.deleteMany({
        where: {
          recipeId: {
            in: createdRecipeIds,
          },
        },
      });
    }

    if (createdIngredientIds.length > 0) {
      await prisma.ingredient.deleteMany({
        where: {
          ingredientId: {
            in: createdIngredientIds,
          },
        },
      });
    }

    if (testUserId) {
      await prisma.user.deleteMany({
        where: {
          userId: testUserId,
        },
      });
    }

    await prisma.$disconnect();
  });

  describe("Authorization", () => {
    test("GET /api/recipes requires authorization", async () => {
      const res = await request(app).get("/api/recipes");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("List Recipes", () => {
    test("GET /api/recipes returns 200 and an array", async () => {
      const res = await request(app)
        .get("/api/recipes")
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("recipes");
      expect(Array.isArray(res.body.recipes)).toBe(true);
    });

    test("GET /api/recipes?category=Breakfast returns only recipes in that category", async () => {
      const res = await request(app)
        .get("/api/recipes")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .query({
          category: "Breakfast",
        });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.recipes)).toBe(true);
      expect(res.body.recipes.length).toBeGreaterThan(0);

      res.body.recipes.forEach((recipe) => {
        expect(recipe.category).toBe("Breakfast");
      });
    });

    test("GET /api/recipes?cuisine=Italian returns only recipes in that cuisine", async () => {
      const res = await request(app)
        .get("/api/recipes")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .query({
          cuisine: "Italian",
        });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.recipes)).toBe(true);
      expect(res.body.recipes.length).toBeGreaterThan(0);

      res.body.recipes.forEach((recipe) => {
        expect(recipe.cuisine).toBe("Italian");
      });
    });

    test("GET /api/recipes?category=Breakfast&cuisine=British applies both filters together", async () => {
      const res = await request(app)
        .get("/api/recipes")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .query({
          category: "Breakfast",
          cuisine: "British",
        });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.recipes)).toBe(true);
      expect(res.body.recipes.length).toBeGreaterThan(0);

      res.body.recipes.forEach((recipe) => {
        expect(recipe.category).toBe("Breakfast");
        expect(recipe.cuisine).toBe("British");
      });
    });

    test("GET /api/recipes?ingredients=garlic returns recipes containing that ingredient", async () => {
      const res = await request(app)
        .get("/api/recipes")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .query({
          ingredients: "garlic",
        });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.recipes)).toBe(true);
      expect(res.body.recipes.length).toBeGreaterThan(0);

      res.body.recipes.forEach((recipe) => {
        const ingredients = recipe.ingredients.map((ingredient) =>
          ingredient.toLowerCase()
        );

        expect(
          ingredients.some((ingredient) => ingredient.includes("garlic"))
        ).toBe(true);
      });
    });

    test("GET /api/recipes?ingredients=chicken,garlic returns recipes containing both ingredients", async () => {
      const res = await request(app)
        .get("/api/recipes")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .query({
          ingredients: "chicken,garlic",
        });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.recipes)).toBe(true);
      expect(res.body.recipes.length).toBeGreaterThan(0);

      res.body.recipes.forEach((recipe) => {
        const ingredients = recipe.ingredients.map((ingredient) =>
          ingredient.toLowerCase()
        );

        expect(
          ingredients.some((ingredient) => ingredient.includes("chicken"))
        ).toBe(true);

        expect(
          ingredients.some((ingredient) => ingredient.includes("garlic"))
        ).toBe(true);
      });
    });
  });
});
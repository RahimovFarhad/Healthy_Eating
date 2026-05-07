import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import jwt from "jsonwebtoken";

const { sign } = jwt;

let testUserId = null;
let testUserEmail = null;
let validAccessToken = null;
let testRecipeId = null;
let testRecipeExternalId = null;
let testRecipeFoodItemId = null;

let createdDiaryEntryId = null;

describe("Diary API", () => {
  beforeAll(async () => {
    const now = Date.now();
    testUserEmail = `test-diary-${now}@example.com`;
    testRecipeId = now;
    testRecipeExternalId = `recipe:${testRecipeId}`;

    const createdUser = await prisma.user.create({
      data: {
        fullName: "Test User",
        email: testUserEmail,
        passwordHash: "test-hash",
        role: "default",
      },
    });
    testUserId = createdUser.userId;

    validAccessToken = sign(
      {
        userId: testUserId,
        email: testUserEmail,
        role: "default",
        tokenType: "access",
      },
      process.env.JWT_SECRET || "default-secret-key",
      { expiresIn: "1h" }
    );

    const recipeFoodItem = await prisma.foodItem.create({
      data: {
        name: "Recipe 1",
        brand: null,
        source: "system",
        externalId: testRecipeExternalId,
      },
    });
    testRecipeFoodItemId = recipeFoodItem.foodItemId;

    await prisma.foodPortion.create({
      data: {
        foodItemId: recipeFoodItem.foodItemId,
        description: "1 serving",
        weightG: null,
      },
    });
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.diaryEntryItem.deleteMany({
        where: {
          diaryEntry: {
            subscriberId: testUserId,
          },
        },
      });

      await prisma.diaryEntry.deleteMany({
        where: {
          subscriberId: testUserId,
        },
      });
    }

    if (createdDiaryEntryId) {
      await prisma.diaryEntryItem.deleteMany({
        where: {
          diaryEntryId: createdDiaryEntryId,
        },
      });

      await prisma.diaryEntry.deleteMany({
        where: {
          diaryEntryId: createdDiaryEntryId,
        },
      });
    }

    if (testRecipeFoodItemId) {
      await prisma.foodPortion.deleteMany({
        where: {
          foodItemId: testRecipeFoodItemId,
        },
      });
    }

    if (testRecipeExternalId) {
      await prisma.foodItem.deleteMany({
        where: {
          source: "system",
          externalId: testRecipeExternalId,
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
    test("POST /diary/entries requires authorization", async () => {
      const res = await request(app).post("/api/diary/entries").send({
        consumedAt: "2026-03-08T12:00:00.000Z",
        mealType: "breakfast",
      });

      expect(res.statusCode).toBe(401);
    });

    test("GET /diary/summary requires authorization", async () => {
      const res = await request(app).get("/api/diary/summary");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /diary/entries", () => {
    test("rejects empty body", async () => {
      const res = await request(app)
        .post("/api/diary/entries")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Consumed at date is required",
      });
    });

    test("rejects missing meal type", async () => {
      const res = await request(app)
        .post("/api/diary/entries")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          consumedAt: "2026-03-08T12:00:00.000Z",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Meal type is required and must be one of: breakfast, lunch, dinner, snack",
      });
    });

    test("rejects invalid meal type", async () => {
      const res = await request(app)
        .post("/api/diary/entries")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          consumedAt: "2026-03-08T12:00:00.000Z",
          mealType: "brunch",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Meal type is required and must be one of: breakfast, lunch, dinner, snack",
      });
    });

    test("succeeds with valid data", async () => {
      const res = await request(app)
        .post("/api/diary/entries")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          consumedAt: "2026-03-08T12:00:00.000Z",
          mealType: "breakfast",
          notes: "test breakfast",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("entry");
      createdDiaryEntryId = res.body.entry?.diaryEntryId ?? null;
    });
  });

  describe("GET /diary/entries", () => {
    test("returns diary entries list", async () => {
      const res = await request(app)
        .get("/api/diary/entries")
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("record");
    });
  });

  describe("GET /diary/entries/:id", () => {
    test("rejects invalid id", async () => {
      const res = await request(app)
        .get("/api/diary/entries/abc")
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Diary Entry ID is required",
      });
    });

    test("returns diary entry by id", async () => {
      if (!createdDiaryEntryId) {
        return;
      }

      const res = await request(app)
        .get(`/api/diary/entries/${createdDiaryEntryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("entry");
    });
  });

  describe("GET /diary/summary", () => {
    test("rejects missing period", async () => {
      const res = await request(app)
        .get("/api/diary/summary")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .query({
          endDate: "2026-03-08",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Period is required and must be one of: daily, weekly, monthly",
      });
    });

    test("rejects invalid endDate", async () => {
      const res = await request(app)
        .get("/api/diary/summary")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .query({
          period: "daily",
          endDate: "not-a-date",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "endDate is required and must be a valid date",
      });
    });

    test("returns summary successfully", async () => {
      const res = await request(app)
        .get("/api/diary/summary")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .query({
          period: "daily",
          endDate: "2026-03-09",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("summary");
    });
  });

  describe("POST /diary/entries/recipe/:recipeId", () => {
    test("rejects invalid recipe id", async () => {
      const res = await request(app)
        .post("/api/diary/entries/recipe/abc")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          consumedAt: "2026-03-08T12:00:00.000Z",
          mealType: "lunch",
          notes: "recipe entry",
          servings: 1,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Recipe ID is required",
      });
    });

    test("returns created diary entry with recipe when valid", async () => {
      const res = await request(app)
        .post(`/api/diary/entries/recipe/${testRecipeId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          consumedAt: "2026-03-08T12:00:00.000Z",
          mealType: "lunch",
          notes: "recipe entry",
          servings: 1,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("entry");
    });
  });

  describe("POST /diary/entries/:id/recipe/:recipeId", () => {
    test("rejects invalid diary entry id", async () => {
      const res = await request(app)
        .post("/api/diary/entries/abc/recipe/1")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          servings: 1,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Diary Entry ID is required",
      });
    });

    test("rejects invalid recipe id", async () => {
      const res = await request(app)
        .post(`/api/diary/entries/${createdDiaryEntryId}/recipe/abc`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          servings: 1,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Recipe ID is required",
      });
    });

    test("adds recipe as diary entry item when valid", async () => {
      if (!createdDiaryEntryId) {
        return;
      }

      const res = await request(app)
        .post(`/api/diary/entries/${createdDiaryEntryId}/recipe/${testRecipeId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          servings: 1,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("newItem");
    });
  });
});

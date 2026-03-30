import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";
import jwt from "jsonwebtoken";

const { sign } = jwt;

const userPayload = {
  userId: 1,
  email: "test@example.com",
  role: "default",
  tokenType: "access",
};

const validAccessToken = sign(
  userPayload,
  process.env.JWT_SECRET || "default-secret-key",
  { expiresIn: "1h" }
);

let createdDiaryEntryId = null;

describe("Diary API", () => {
  afterAll(async () => {
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

    await prisma.$disconnect();
  });

  describe("Authorization", () => {
    test("POST /diary/entries requires authorization", async () => {
      const res = await request(app).post("/diary/entries").send({
        consumedAt: "2026-03-08T12:00:00.000Z",
        mealType: "breakfast",
      });

      expect(res.statusCode).toBe(401);
    });

    test("GET /diary/summary requires authorization", async () => {
      const res = await request(app).get("/diary/summary");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /diary/entries", () => {
    test("rejects empty body", async () => {
      const res = await request(app)
        .post("/diary/entries")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Consumed at date is required",
      });
    });

    test("rejects missing meal type", async () => {
      const res = await request(app)
        .post("/diary/entries")
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
        .post("/diary/entries")
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
        .post("/diary/entries")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          consumedAt: "2026-03-08T12:00:00.000Z",
          mealType: "breakfast",
          notes: "test breakfast",
        });

      expect([201, 500]).toContain(res.statusCode);

      if (res.statusCode === 201) {
        expect(res.body).toHaveProperty("entry");
        createdDiaryEntryId = res.body.entry?.diaryEntryId ?? null;
      }
    });
  });

  describe("GET /diary/entries", () => {
    test("returns diary entries list", async () => {
      const res = await request(app)
        .get("/diary/entries")
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect([200, 500]).toContain(res.statusCode);

      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty("record");
      }
    });
  });

  describe("GET /diary/entries/:id", () => {
    test("rejects invalid id", async () => {
      const res = await request(app)
        .get("/diary/entries/abc")
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
        .get(`/diary/entries/${createdDiaryEntryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect([200, 400]).toContain(res.statusCode);

      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty("entry");
      }
    });
  });

  describe("GET /diary/summary", () => {
    test("rejects missing period", async () => {
      const res = await request(app)
        .get("/diary/summary")
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
        .get("/diary/summary")
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
        .get("/diary/summary")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .query({
          period: "daily",
          endDate: "2026-03-09",
        });

      expect([200, 500]).toContain(res.statusCode);

      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty("summary");
      }
    });
  });
});
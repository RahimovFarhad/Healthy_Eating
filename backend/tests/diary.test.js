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

  test("Create entry requires authorization", async () => {
    const res = await request(app).post("/diary/entries").send({
      consumedAt: "2026-03-08T12:00:00.000Z",
      mealType: "breakfast",
    });

    expect(res.statusCode).toBe(401);
  });

  test("Get summary requires authorization", async () => {
    const res = await request(app).get("/diary/summary");

    expect(res.statusCode).toBe(401);
  });

  test("Create entry rejects empty body", async () => {
    const res = await request(app)
      .post("/diary/entries")
      .set("Authorization", `Bearer ${validAccessToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Consumed at date is required",
    });
  });

  test("Create entry rejects missing meal type", async () => {
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

  test("Create entry rejects invalid meal type", async () => {
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

  test("Get summary rejects missing period", async () => {
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

  test("Get summary rejects invalid endDate", async () => {
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

  test("Create entry succeeds", async () => {
    const res = await request(app)
      .post("/diary/entries")
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

  test("List diary entries succeeds", async () => {
    const res = await request(app)
      .get("/diary/entries")
      .set("Authorization", `Bearer ${validAccessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("record");
  });

  test("Get diary entry by id rejects invalid id", async () => {
    const res = await request(app)
      .get("/diary/entries/abc")
      .set("Authorization", `Bearer ${validAccessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Diary Entry ID is required",
    });
  });

  test("Get diary entry by id succeeds", async () => {
    expect(createdDiaryEntryId).toBeDefined();

    const res = await request(app)
      .get(`/diary/entries/${createdDiaryEntryId}`)
      .set("Authorization", `Bearer ${validAccessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("entry");
  });

  test("Get summary succeeds", async () => {
    const res = await request(app)
      .get("/diary/summary")
      .set("Authorization", `Bearer ${validAccessToken}`)
      .query({
        period: "daily",
        endDate: "2026-03-09",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("summary");
  });
});
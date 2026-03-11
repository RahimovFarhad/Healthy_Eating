import request from "supertest"
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";
import jwt from "jsonwebtoken"

const { sign } = jwt;


const userPayload = {
  userId: 1,
  email: "test@example.com",
  role: "default",
  tokenType: "access"
};

const validAccessToken = sign(userPayload, process.env.JWT_SECRET || "default-secret-key", { expiresIn: "1h" });
let createdPostId = null;

describe("Diary API", () => {
  afterAll(async () => {
      if (createdPostId) {
        await prisma.post.deleteMany({
          where: {
            postId: createdPostId,
          },
        });
      }
      await prisma.$disconnect();
    });

  test("Create entry requires authorization", async () => {
    const res = await request(app)
      .post("/diary/entries")
      .send({
        date: "2026-03-08"
      })

    expect(res.statusCode).toBe(401)
    expect(res.body).toEqual({
      message: "Authorization header missing"
    })
  })

  test("Get summary requires authorization", async () => {
    const res = await request(app)
      .get("/diary/summary")

    expect(res.statusCode).toBe(401)
    expect(res.body).toEqual({
      message: "Authorization header missing"
    })
  })

  test("Create entry rejects empty body", async () => {
    const res = await request(app)
      .post("/diary/entries")
      .set("Authorization", `Bearer ${validAccessToken}`)
      .send({})

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: "Consumed at date is required"
    })
  })

  test("Create entry rejects missing meal type", async () => {
    const res = await request(app)
      .post("/diary/entries")
      .set("Authorization", `Bearer ${validAccessToken}`)
      .send({
        consumedAt: "2026-03-08T12:00:00.000Z"
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: "Meal type is required and must be one of: breakfast, lunch, dinner, snack"
    })
  })
})

import request from "supertest"
import { jest } from "@jest/globals"

jest.unstable_mockModule("../src/db/prisma.ts", () => ({
  prisma: {
    $queryRaw: jest.fn()
  }
}))

const { default: app } = await import("../src/app.js")

describe("Diary API", () => {

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

})

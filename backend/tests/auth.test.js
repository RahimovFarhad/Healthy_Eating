import request from "supertest"
import { jest } from "@jest/globals"

jest.unstable_mockModule("../src/db/prisma.ts", () => ({
  prisma: {
    $queryRaw: jest.fn()
  }
}))

const { default: app } = await import("../src/app.js")

describe("Auth API", () => {

  test("Register rejects missing username", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "123456"
      })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      message: "Email, username, and password are required"
    })
  })

  test("Login rejects missing password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "test@example.com"
      })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      message: "Email and password are required"
    })
  })

})

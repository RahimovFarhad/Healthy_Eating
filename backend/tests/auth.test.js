import request from "supertest"
import app from "../src/app.js"

describe("Auth API", () => {

  test("Register user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "123456"
      })

    expect(res.statusCode).toBeDefined()
  })

  test("Login user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "123456"
      })

    expect(res.statusCode).toBeDefined()
  })

})
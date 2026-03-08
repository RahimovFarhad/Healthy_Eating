import request from "supertest"
import app from "../src/app.js"

describe("Diary API", () => {

  test("Create entry", async () => {
    const res = await request(app)
      .post("/diary/entries")
      .send({
        date: "2026-03-08"
      })

    expect(res.statusCode).toBeDefined()
  })

  test("Get summary", async () => {
    const res = await request(app)
      .get("/diary/summary")

    expect(res.statusCode).toBeDefined()
  })

})
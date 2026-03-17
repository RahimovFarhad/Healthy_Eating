import request from "supertest"
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

const TEST_USER = {
  email: `auth-int-${Date.now()}@example.com`,
  username: "auth_integration_user",
  password: "Password123!",
};

let createdUserId = null;
let refreshCookie = null;

describe("Auth API", () => {
  afterAll(async () => {
    if (createdUserId) {
      await prisma.user.deleteMany({
        where: {
          userId: createdUserId,
        },
      });
    }
    await prisma.$disconnect();
  });

  test("Register creates user", async () => {
    const res = await request(app).post("/auth/register").send(TEST_USER);

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      message: "User registered successfully",
    });
    expect(typeof res.body.userId).toBe("number");
    createdUserId = res.body.userId;
  });

  test("Register rejects duplicate email", async () => {
    const res = await request(app).post("/auth/register").send(TEST_USER);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("Login returns access token and refresh cookie", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(Array.isArray(cookies)).toBe(true);

    const refreshTokenCookie = cookies.find(cookie =>
      cookie.toLowerCase().includes("refreshtoken")
    );
    expect(refreshTokenCookie).toBeDefined();

    refreshCookie = refreshTokenCookie;
  });

  test("Login rejects invalid password", async () => {
     const res = await request(app)
      .post("/auth/login")
      .send({
        email: TEST_USER.email,
        password: "WrongPassword123!",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  test("Refresh returns new access token", async () => {
    expect(refreshCookie).toBeDefined();

    const res = await request(app)
      .get("/auth/refresh")
      .set("Cookie", refreshCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });

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

  test("Register rejects missing email", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        username: "testuser",
        password: "123456"
      })

    expect(res.statusCode).toBe(400)
  })

  test("Register rejects empty body", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({})

    expect(res.statusCode).toBe(400)
  })

  test("Login rejects empty body", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({})

    expect(res.statusCode).toBe(400)
  })
})



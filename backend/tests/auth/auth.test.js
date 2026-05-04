import jwt from "jsonwebtoken";
import request from "supertest"
import app from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";

const { sign } = jwt;

const TEST_ID = Date.now();
const TEST_USER = {
  email: `auth-int-${TEST_ID}@example.com`,
  username: `auth_integration_user_${TEST_ID}`,
  password: "Password123!",
};

const expiredRefreshToken = sign(
  {
    userId: 9999,
    email: "",
    role: "default",
    tokenType: "refresh"
  },
  process.env.JWT_SECRET || "default-secret-key",
  { expiresIn: "-1h" }
);

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

  describe("Register", () => {
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

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty("message");
    });

    test("Register rejects duplicate username", async () => {
      const res = await request(app).post("/auth/register").send({
        email: `another-${Date.now()}@example.com`,
        username: TEST_USER.username,
        password: TEST_USER.password,
      });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty("message");
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

    test("Register rejects missing email", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          username: "testuser",
          password: "123456"
        })

      expect(res.statusCode).toBe(400)
    })

    test("Register rejects missing password", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          username: "testuser"
        })

      expect(res.statusCode).toBe(400)
    })

    test("Register rejects empty body", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({})

      expect(res.statusCode).toBe(400)
    })
  });

  describe("Login", () => {
    test("Login returns access token and refresh cookie with email", async () => {
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

    test("Login rejects missing email", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          password: "123456"
        })

      expect(res.statusCode).toBe(400)
      expect(res.body).toEqual({
        message: "Email and password are required"
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

    test("Login rejects empty body", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({})

      expect(res.statusCode).toBe(400)
    })

    test("Login rejects non-existing user", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "123456"
        })

      expect(res.statusCode).toBe(404)
      expect(res.body).toEqual({
        message: "User not found"
      })
    })
  });

  describe("Refresh Token", () => {
    test("Refresh returns new access token", async () => {
      expect(refreshCookie).toBeDefined();

      const res = await request(app)
        .get("/auth/refresh")
        .set("Cookie", refreshCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");
    });

    test ("Refresh rejects missing token", async () => {
      const res = await request(app)
        .get("/auth/refresh")

      expect(res.statusCode).toBe(401)
      expect(res.body).toEqual({
        message: "Refresh token is required"
      })
    });

    test("Refresh rejects expired token", async () => {
      const expiredTokenCookie = `refreshToken=${expiredRefreshToken}; HttpOnly; Path=/; Max-Age=3600`;
      const res = await request(app)
        .get("/auth/refresh")
        .set("Cookie", expiredTokenCookie);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        message: "Invalid refresh token"
      });
    });
  });

})





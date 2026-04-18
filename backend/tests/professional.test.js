import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";
import jwt from "jsonwebtoken";
import { start } from "repl";

const { sign } = jwt;

const uniqueKey = Date.now(); // Unique key to avoid conflicts with existing users
const userPayload = {
  userId: -1,
  fullName: `Test User ${uniqueKey}`,
  email: `test${uniqueKey}@example.com`, // lets add current time to email to avoid conflicts with existing users
  role: "default",
  tokenType: "access",
};

var subscriber;

var validAccessToken = null;
var subscriberAccessToken = null;


describe("Professional API", () => {
  beforeAll(async () => {
    // Ensure the test user exists in the database
    let user = await prisma.user.create({
      data: {
        fullName: "Test User",
        email: userPayload.email,
        passwordHash: "hashedpassword", // In a real test, you might want to hash this properly
        role: userPayload.role,
      },
    });
    userPayload.userId = user.userId;
    validAccessToken = sign(userPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

    subscriber = await prisma.user.create({
      data: {
        fullName: `Subscriber User ${uniqueKey}`,
        email: `subscriber${uniqueKey}@example.com`,
        passwordHash: "hashedpassword",
        role: "default",
      },
    });
    subscriberAccessToken = sign(
      {
        userId: subscriber.userId,
        email: subscriber.email,
        role: subscriber.role,
        tokenType: "access",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

  });

  afterAll(async () => {
    if (userPayload.userId > 0 && subscriber?.userId > 0) {
      await prisma.message.deleteMany({
        where: {
          professionalId: userPayload.userId,
          subscriberId: subscriber.userId,
        },
      });

      await prisma.nutritionGoal.deleteMany({
        where: {
          subscriberId: subscriber.userId,
          setByProfessionalId: userPayload.userId,
        },
      });

      await prisma.professionalClient.deleteMany({
        where: {
          professionalId: userPayload.userId,
          subscriberId: subscriber.userId,
        },
      });
    }

    if (subscriber?.userId > 0) {
      await prisma.user.deleteMany({
        where: {
          userId: subscriber.userId,
        },
      });
    }

    if (userPayload.userId > 0) {
      await prisma.user.deleteMany({
        where: {
          userId: userPayload.userId,
        },
      });
    }

    await prisma.$disconnect();
  });
  

  describe("PATCH /professional/setAsProfessional", () => {
    test("rejects unauthorized requests", async () => {
      const res = await request(app).patch("/professional/setAsProfessional");

      expect(res.statusCode).toBe(401);
    });
    test("success on valid input", async () => {
      const res = await request(app)
        .patch("/professional/setAsProfessional")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.statusCode).toBe(200);
      // body includes things like createdAt and updatedAt, so we will just check for the presence of professional object its userId, and role
      expect(res.body).toHaveProperty("professional");  
      expect(res.body.professional).toHaveProperty("userId", userPayload.userId);
      expect(res.body.professional).toHaveProperty("role", "professional");

      validAccessToken = sign(
        { ...userPayload, role: "professional" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    });

  });
  describe("POST /professional/inviteClient", () => {
    test("rejects unauthorized requests", async () => {
      const res = await request(app).post("/professional/client-invitations").send({
        subscriberId: 1,
      });

      expect(res.statusCode).toBe(401);
    });
    test("rejects empty input", async () => {
      const res = await request(app)
        .post("/professional/client-invitations")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });
    test("rejects invalid subscriberId", async () => {
      const res = await request(app)
        .post("/professional/client-invitations")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          subscriberId: "invalid-id",
        });

      expect(res.statusCode).toBe(400);
    });
    test("rejects non-existing subscriberId", async () => {
      const res = await request(app)
        .post("/professional/client-invitations")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          subscriberId: 999999, // assuming this ID does not exist
        });

      expect(res.statusCode).toBe(400);
    });
    test("rejects if professional is not actually a professional", async () => {
      // This test would involve creating a user without the "professional" role and attempting to invite a client
      // let's just send the request from subscriber user, who is not a professional
        const subscriberAccessToken = sign(
            {
            userId: subscriber.userId,
            email: subscriber.email,
            role: subscriber.role,
            tokenType: "access",
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        const res = await request(app)
          .post("/professional/client-invitations")
          .set("Authorization", `Bearer ${subscriberAccessToken}`)
          .send({
            subscriberId: 999999,
          });
      expect(res.statusCode).toBe(403);
    });
    test("success on valid input", async () => {
      const res = await request(app)
        .post("/professional/client-invitations")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          subscriberId: subscriber.userId,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("invitation");
      expect(res.body.invitation).toHaveProperty("professionalId", userPayload.userId);
      expect(res.body.invitation).toHaveProperty("subscriberId", subscriber.userId);
    });

  });

  describe("GET /professional/clients", () => {
    beforeAll(async () => {
      // professional should have sent the invitation by now, but it is not accepted yet, so we will accept the invitation by directly updating the database
      await prisma.professionalClient.updateMany({
        where: {
          professionalId: userPayload.userId,
          subscriberId: subscriber.userId,
        },
        data: {
          status: "active",
        },
      });
    });
    test("rejects unauthorized requests", async () => {
      const res = await request(app).get("/professional/clients");

      expect(res.statusCode).toBe(401);
    });

    test("success on valid input", async () => {
      const res = await request(app)
        .get("/professional/clients")
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("clients");
      expect(Array.isArray(res.body.clients)).toBe(true);
    });

    test("rejects invalid include query", async () => {
      const res = await request(app)
        .get("/professional/clients")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .query({
          include: "invalid",
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /professional/clients/:clientId/messages", () => {
    test("rejects unauthorized requests", async () => {
      const res = await request(app)
        .post(`/professional/clients/${subscriber.userId}/messages`)
        .send({
          message: "Hello",
        });

      expect(res.statusCode).toBe(401);
    });

    test("rejects empty message", async () => {
      const res = await request(app)
        .post(`/professional/clients/${subscriber.userId}/messages`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });

    test("success on valid input", async () => {
      const res = await request(app)
        .post(`/professional/clients/${subscriber.userId}/messages`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          message: "Hello from professional",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toHaveProperty("professionalId", userPayload.userId);
      expect(res.body.message).toHaveProperty("subscriberId", subscriber.userId);
    });
  });

  describe("GET /professional/clients/:clientId/messages", () => { 
    test("rejects unauthorized requests", async () => {
      const res = await request(app)
        .get(`/professional/clients/${subscriber.userId}/messages`);

      expect(res.statusCode).toBe(401);
    });

    test("rejects invalid clientId", async () => {
      const res = await request(app)
        .get("/professional/clients/invalid/messages")
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(res.statusCode).toBe(400);
    });

    test("success on valid input", async () => {
      const res = await request(app)
        .get(`/professional/clients/${subscriber.userId}/messages`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("messages");
      expect(Array.isArray(res.body.messages)).toBe(true);
    });
  });


});

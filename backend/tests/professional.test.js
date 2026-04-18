import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";
import jwt from "jsonwebtoken";

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

});

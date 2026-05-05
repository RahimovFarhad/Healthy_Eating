import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import jwt from "jsonwebtoken";

const { sign } = jwt;

let testUserId = null;
let testUserEmail = null;
let validAccessToken = null;
let createdGoalId = null;

describe("Goals API", () => {
    beforeAll(async () => {
        const now = Date.now();
        testUserEmail = `test-goals-${now}@example.com`;

        const createdUser = await prisma.user.create({
            data: {
                fullName: "Test User",
                email: testUserEmail,
                passwordHash: "test-hash",
                role: "default"
            },
        });
        testUserId = createdUser.userId;

        validAccessToken = sign(
            {
                userId: testUserId,
                email: testUserEmail,
                role: "default",
                tokenType: "access",
            },
            process.env.JWT_SECRET || "default-secret-key", {   expiresIn: "1h" }
        );
    });
    
    afterAll(async () => {

        if (testUserId) {
            await prisma.goalCheckIn.deleteMany({
                where: {
                    goal: {
                        subscriberId: testUserId
                    },
                },
            });

            await prisma.nutritionGoal.deleteMany({
                where: {
                    subscriberId: testUserId
                },
            });

            await prisma.user.deleteMany({
                where: {
                    userId: testUserId
                },
            });
        }

        await prisma.$disconnect();
    });

    describe("Authorization", () => {
        test("GET /api/goals requires authorization", async () => {
            const res = await request(app).get("/api/goals");

            expect(res.statusCode).toBe(401);
        });

        test("POST /api/goals requires authorization", async () => {
            const res = await request(app).post("/api/goals").send({
                goal: {
                    notes: "Unauthorized goal"
                }
            });

            expect(res.statusCode).toBe(401);
        });
    });
    describe("GET /api/goals/nutrients", () => {
        test("returns nutrients list", async () => {
            const res = await request(app)
            .get("/api/goals/nutrients")
            .set("Authorization", `Bearer ${validAccessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("nutrients");
            expect(Array.isArray(res.body.nutrients)).toBe(true);
        });
    });
    describe("POST /api/goals", () => {
        test("creates goal with valid date", async () => {
            const res = await request(app)
                .post("/api/goals")
                .set("Authorization", `Bearer ${validAccessToken}`)
                .send({
                    goal: {
                        notes: "eat one more root vegetable",
                        startDate: "2026-05-01T12:00:00.000Z",
                        endDate: "2026-05-02T12:00:00.000Z"
                    }
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("createdGoal");
            createdGoalId = res.body.createdGoal?.goalId ?? null;
        });
        test("rejects empty body", async () => {
            const res = await request(app)
            .post("/api/goals")
            .set("Authorization", `Bearer ${validAccessToken}`)
            .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({
                error: "goal is required",
            });
        });
        test("rejects missing goal notes", async () => {
            const res = await request(app)
            .post("/api/goals")
            .set("Authorization", `Bearer ${validAccessToken}`)
            .send({
                goal: {

                }
            });

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({
                error: "goal.notes is required",
            });
        });
    });
    describe("GET /api/goals", () => {
        test("returns user goals list", async () => {
            const res = await request(app)
                .get("/api/goals")
                .set("Authorization",`Bearer ${validAccessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("goals");
            expect(Array.isArray(res.body.goals)).toBe(true);
        });
        test("rejects invalid include value", async () => {
            const res = await request(app)
                .get("/api/goals")
                .set("Authorization", `Bearer ${validAccessToken}`)
                .query({
                    include: "invalid"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({  error: "include must be one of: today, all"    });
        });
    });
    describe("PATCH /api/goals", () => {
        test("updates goal when valid", async () => {
            if (!createdGoalId) return;

            const res = await request(app)
                .patch("/api/goals")
                .set("Authorization", `Bearer ${validAccessToken}`)
                .send({
                    goal: {
                        goalId: createdGoalId,
                        notes: "updated notes"
                    }
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("updatedGoal");
            expect(res.body.updatedGoal).toHaveProperty("goalId",createdGoalId);
            expect(res.body.updatedGoal).toHaveProperty(
                "notes",
                "updated notes"
            );
        });
        test("rejects invalid goal ID", async () => {
            const res = await request(app)
                .patch("/api/goals")
                .set("Authorization", `Bearer ${validAccessToken}`)
                .send({
                    goal: {
                        goalId: "goalId",
                        notes: "updated notes"
                    }
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({  error: "goalId is required and must be a positive integer"  });
        });
        test("rejects missing goal object", async () => {
            const res = await request(app)
            .patch("/api/goals")
            .set("Authorization", `Bearer ${validAccessToken}`)
            .send({
            });

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({  error: "goal is required"   });
        });
    });
    describe("PATCH /api/goals/:goalId/toggle-done", () => {
        test("toggles done for valid goal", async () => {
            if (!createdGoalId) return;

            const res = await request(app)
                .patch(`/api/goals/${createdGoalId}/toggle-done`)
                .set("Authorization", `Bearer ${validAccessToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("checkIn");
            expect(res.body.checkIn).toHaveProperty("goalId",createdGoalId);
            expect(typeof res.body.checkIn.isDone).toBe("boolean");
        });
        test("rejects invalid goal ID", async () => {
            const res = await request(app)
            .patch("/api/goals/goalId/toggle-done")
            .set("Authorization", `Bearer ${validAccessToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({  error: "Goal ID must be a positive integer" });
        });
    });
    describe("DELETE /api/goals/:goalId", () => {
        test("archives goal when valid", async () => {
           if (!createdGoalId) return;

            const res = await request(app)
                .delete(`/api/goals/${createdGoalId}`)
                .set("Authorization", `Bearer ${validAccessToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("deletedGoal");
            expect(res.body.deletedGoal).toHaveProperty("goalId",createdGoalId);
            expect(res.body.deletedGoal).toHaveProperty(
                "status",
                "archived"
            ); 
        });
        test("rejects invalid goal ID", async () => {
            const res = await request(app)
            .delete("/api/goals/goalId")
            .set("Authorization", `Bearer ${validAccessToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({  error: "Goal ID must be a positive integer" });
        });
    });
});


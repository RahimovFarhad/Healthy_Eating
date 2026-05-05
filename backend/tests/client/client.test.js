import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import jwt from "jsonwebtoken";

const { sign } = jwt;

let clientUserId = null;
let clientEmail = null;
let accessToken = null;

let professionalActiveId = null;
let professionalInvitedAcceptId = null;
let professionalInvitedRejectId = null;
let professionalNoLinkId = null;

let recipeId = null;

describe("Client API", () => {
    beforeAll(async () => {
        const now = Date.now();
        clientEmail = `test-client-${now}@example.com`;

        const clientUser = await prisma.user.create({
            data: {
                fullName: "Test User",
                email: testUserEmail,
                passwordHash: "test_password",
                role: "default",
            }
        });
        clientUserId = clientUser.userId;

        validAccessToken = sign(
            {
                userId: testUserId,
                email: testUserEmail,
                role: "default",
                tokenType: "access",
            },
            process.env.JWT_SECRET || "default-secret-key",
            { expiresIn: "1h" }
        );

        const [professionalActive,professionalInvitedAccept,professionalInvitedReject,professionalNoLink] = await Promise.all([
            prisma.user.create({
                data: {
                    fullName: "Professional Active",
                    email: `pro-active-${now}@example.com`,
                    passwordHash: "test_password",
                    role: "professional",
                }
            }),
            prisma.user.create({
                data: {
                    fullName: "Professional Invited Accept",
                    email: `pro-inv-accept-${now}@example.com`,
                    passwordHash: "test_password",
                    role: "professional",
                },
            }),
            prisma.user.create({
                data: {
                    fullName: "Professional No Link",
                    email: `pro-nolink-${now}@example.com`,
                    passwordHash: "test_password",
                    role: "professional",
                },
            }),
        ]); 

        professionalActiveId = professionalActive.userId;
        professionalInvitedAcceptId = professionalInvitedAccept.userId;
        professionalInvitedRejectId = professionalInvitedReject.userId;
        professionalNoLinkId = professionalNoLink.userId;

        await prisma.professionalClient.createMany({
            data: [
                {
                    professionalId: professionalActiveId,
                    subscriberId: clientUserId,
                    status: "active",
                },
                {
                    professionalId: professionalInvitedAcceptId,
                    subscriberId: clientUserId,
                    status: "invited",
                },
                {
                    professionalId: professionalInvitedRejectId,
                    subscriberId: clientUserId,
                    status: "invited",
                }
            ]
        });

        const recipe = await prisma.recipe.create({
            data: {
                title: "Testing shared recipe",
                instructions: "cut carrots",
            },
        });
        recipeId = recipe.recipeId;

        await prisma.recipeShare.create({
            data: {
                professionalId: professionalActiveId,
                subscriberId: clientUserId,
                recipeId,
                status: "assigned",
            },
        });

        await prisma.message.create({
            data: {
                professionalId: professionalActiveId,
                subscriberId: clientUserId,
                message: "Welcome message from professional",
                sentBy: "professional",
            },
        });
    });
    
    afterAll(async () => {
        if (clientUserId) {
            await prisma.message.deleteMany({
                where: {
                    subscriberId: clientUserId
                },
            });

            await prisma.recipeShare.deleteMany({
                where: {
                    subscriberId: clientUserId
                },
            });

            await prisma.professionalClient.deleteMany({
                where: {
                    subscriberId: clientUserId
                },
            });
        }

        if (recipeId) {
            await prisma.recipe.deleteMany({
                where: {
                    recipeId
                }
            });
        }

        const userIds = [
        clientUserId,
        professionalActiveId,
        professionalInvitedAcceptId,
        professionalInvitedRejectId,
        professionalNoLinkId,
        ].filter(Boolean);

        if (userIds.length > 0) {
            await prisma.user.deleteMany({
                where: {
                    userId: {
                        in: userIds
                    },
                },
            });
        }

        await prisma.$disconnect();
    });

    describe("Authorization", () => {
        test("GET /api/client/professionals requires authorization", async () => {
            const res = await request(app).get("/api/client/professionals");

            expect(res.statusCode).toBe(401);
        });

        test("GET /api/client/client-invitations requires authorization", async () => {
            const res = await request(app).get("/api/client/client-invitations");

            expect(res.statusCode).toBe(401);
        });
    });

    describe("Invitations", () => {
        test("GET /api/client/client-invitations returns invited professionals", async () => {
            const res = await request(app)
                .get("/api/client/client-invitations")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("invitations");
            expect(Array.isArray(res.body.invitations)).toBe(true);
        });

        test("POST /api/client/client-invitations/:professionalId/accept accepts invitation", async () => {
            const res = await request(app)
                .post(`/api/client/client-invitations/${professionalInvitedAcceptId}/accept`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: "Invitation accepted successfully" });

            const updated = await prisma.professionalClient.findUnique({
                where: {
                    professionalId_subscriberId: {
                        professionalId: professionalInvitedAcceptId,
                        subscriberId: clientUserId,
                    },
                },
            });
            expect(updated?.status).toBe("active");
        });

        test("POST /api/client/client-invitations/:professionalId/reject rejects invitation", async () => {
            const res = await request(app)
                .post(`/api/client/client-invitations/${professionalInvitedRejectId}/reject`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: "Invitation rejected successfully" });

            const updated = await prisma.professionalClient.findUnique({
                where: {
                    professionalId_subscriberId: {
                        professionalId: professionalInvitedRejectId,
                        subscriberId: clientUserId,
                    },
                },
            });
            expect(updated?.status).toBe("disabled");
        });

        test("POST /api/client/client-invitations/:professionalId/accept rejects invalid professional ID", async () => {
            const res = await request(app)
                .post("/api/client/client-invitations/abc/accept")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: "Professional ID is required" });
        });
    });

    describe("Professionals", () => {
        test("GET /api/client/professionals returns active professionals", async () => {
            const res = await request(app)
                .get("/api/client/professionals")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("professionals");
            expect(Array.isArray(res.body.professionals)).toBe(true);
        });
    });

    describe("Remove Professional", () => {
        test("DELETE /api/client/professionals/:professionalId removes active professional", async () => {
            const res = await request(app)
                .delete(`/api/client/professionals/${professionalActiveId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: "Professional removed successfully" });

            const updated = await prisma.professionalClient.findUnique({
                where: {
                    professionalId_subscriberId: {
                        professionalId: professionalActiveId,
                        subscriberId: clientUserId,
                    },
                }
            });
            expect(updated?.status).toBe("disabled");
        });
        
        test("DELETE /api/client/professionals/:professionalId rejects invalid professional ID", async () => {
            const res = await request(app)
                .delete("/api/client/professionals/bad_professionalId")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: "Professional ID is required" });
        }); 
    });

    describe("Messages", () => {
        test("GET /api/client/professionals/:professionalId/messages returns message list", async () => {
            const res = await request(app)
                .get(`/api/client/professionals/${professionalActiveId}/messages`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("messages");
            expect(Array.isArray(res.body.messages)).toBe(true);
        });

        test("POST /api/client/professionals/:professionalId/messages sends message", async () => {
            const res = await request(app)
                .post(`/api/client/professionals/${professionalActiveId}/messages`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ message: "Hello. I've hit my protein goals." });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("message", "Message sent successfully");
            expect(res.body).toHaveProperty("sentMessage");
        });

        test("POST /api/client/professionals/:professionalId/messages rejects empty message", async () => {
            const res = await request(app)
                .post(`/api/client/professionals/${professionalActiveId}/messages`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: "message is required" });
        });
    });

    describe("Shared Recipes", () => {
        test("GET /api/client/professionals/:professionalId/shared-recipes returns shared recipes", async () => {
            const res = await request(app)
                .get(`/api/client/professionals/${professionalActiveId}/shared-recipes`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("sharedRecipes");
            expect(Array.isArray(res.body.sharedRecipes)).toBe(true);
        });

        test("GET /api/client/professionals/:professionalId/shared-recipes blocks unassigned professional", async () => {
            const res = await request(app)
                .get(`/api/client/professionals/${professionalNoLinkId}/shared-recipes`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({
                error: "Client is not assigned to this professional",
            });
        });
    });
});
import request from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import jwt from "jsonwebtoken";

const { sign } = jwt;

describe("Goals API", () => {
    beforeAll(async () => {
        // TODO
    });
    
    afterAll(async () => {
        // TODO
    });
});


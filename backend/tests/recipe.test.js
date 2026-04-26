import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

describe("Recipe API", () => {
    describe("List Recipes", () => {
        test.todo("GET /api/recipes returns 200 and an array");
        test.todo("GET /api/recipes?category=Breakfast returns only recipes in that category");
        test.todo("GET /api/recipes?cuisine=Italian returns only recipes in that cuisine");
        test.todo("GET /api/recipes?category=Breakfast&cuisine=British applies both filters together");
        test.todo("GET /api/recipes?ingredients=garlic returns recipes containing that ingredient");
        test.todo("GET /api/recipes?ingredients=chicken,garlic returns recipes containing both ingredients");
    });
    
});

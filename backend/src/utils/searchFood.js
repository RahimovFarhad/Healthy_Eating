/**
 * FatSecret food search utilities
 * Provides food search and retrieval with Redis caching
 * @module utils/searchFood
 */

import { getToken } from "./apiTokenManager.js";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";

import { createClient } from "redis";
const redis = createClient();
let redisConnectPromise;

/**
 * Ensures Redis connection is established
 * Uses a promise to prevent concurrent connection attempts
 * Silently handles connection failures
 * @returns {Promise<boolean>} True if connected, false if connection failed
 */
async function ensureRedisConnected() {
    if (redis.isOpen) return true;
    if (!redisConnectPromise) {
        redisConnectPromise = redis.connect().catch((error) => {
            redisConnectPromise = undefined;
            // fail silently if Redis fails
            return false;
        });
    }
    const result = await redisConnectPromise;
    return result !== false;
}

/**
 * Searches for foods by query string
 * Results are cached in Redis for 7 days
 * @param {string} query - The search query
 * @returns {Promise<Object>} FatSecret API search results
 * @throws {Error} If API request fails
 */
async function searchFood(query) {
    const redisConnected = await ensureRedisConnected();

    if (redisConnected) {
        try {
            const cacheKey = `search:${query}`;
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (error) {
            // fal silently if Redis fails
        }
    }

    const token = await getToken();
    const response = await axios.get("https://platform.fatsecret.com/rest/foods/search/v1", {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            method: "foods.search",
            search_expression: query,
            format: "json"
        }
    });

    if (redisConnected) {
        try {
            const cacheKey = `search:${query}`;
            await redis.setEx(cacheKey, 60 * 60 * 24 * 7, JSON.stringify(response.data)); // 7 days TTL
        } catch (error) {
            // fal silently if Redis fails
        }
    }

    return response.data;
}

/**
 * Retrieves detailed food information by FatSecret food ID
 * Results are cached in Redis for 7 days
 * @param {string|number} id - The FatSecret food ID
 * @returns {Promise<Object>} Parsed food data with portions and nutrients
 * @throws {Error} If API request or parsing fails
 */
async function searchFoodById(id) {
    const redisConnected = await ensureRedisConnected();

    if (redisConnected) {
        try {
            const cacheKey = `food:${id}`;
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (error) {
            // fail silently if Redis fails
        }
    }

    const token = await getToken();
    const response = await axios.get("https://platform.fatsecret.com/rest/food/v5", {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            food_id: id
        },
        responseType: "text" // force raw XML string
    });

    const parsed = parseFoodResponse(response.data);

    if (redisConnected) {
        try {
            const cacheKey = `food:${id}`;
            await redis.setEx(cacheKey, 60 * 60 * 24 * 7, JSON.stringify(parsed)); // 7 days TTL
        } catch (error) {
            // fail silently if Redis fails
        }
    }

    return parsed;
}

const parser = new XMLParser({ ignoreAttributes: false });

/**
 * Converts sodium in milligrams to salt in grams
 * Uses the conversion factor: salt = sodium * 2.5 / 1000
 * @param {string|number} sodiumMg - Sodium amount in milligrams
 * @returns {number} Salt amount in grams (rounded to 3 decimal places)
 */
function sodiumMgToSaltG(sodiumMg) {
    // Convert sodium in mg to salt in g: salt = sodium * 2.5 / 1000
    return Number((((parseFloat(sodiumMg) || 0) * 2.5) / 1000).toFixed(3));
}

/**
 * Parses FatSecret XML food response into structured format
 * Extracts food name, brand, portions, and nutrient data
 * @param {string} xml - Raw XML response from FatSecret API
 * @returns {Object} Parsed food object with name, brand, and portions array
 * @throws {Error} If XML is invalid or missing required data
 */
function parseFoodResponse(xml) {
    try {
        const result = parser.parse(xml);

        // Log the parsed result to debug

        const food = result.food;

        if (!food) {
            throw new Error("Invalid food data: no food object found");
        }

        if (!food.servings || !food.servings.serving) {
            throw new Error("Invalid food data: no servings found");
        }

        const rawServings = food.servings.serving;
        const servings = Array.isArray(rawServings) ? rawServings : [rawServings];

        return {
            name: food.food_name,
            brand: food.brand_name || null,
            portions: servings.map(s => ({
                description: s.serving_description,
                weight_g: parseFloat(s.metric_serving_amount),
                nutrients: [
                    { nutrientId: 1, amount: parseFloat(s.calories)     || 0 },
                    { nutrientId: 2, amount: parseFloat(s.protein)       || 0 },
                    { nutrientId: 3, amount: parseFloat(s.carbohydrate)  || 0 },
                    { nutrientId: 4, amount: parseFloat(s.fat)           || 0 },
                    { nutrientId: 5, amount: parseFloat(s.fiber)         || 0 },
                    { nutrientId: 6, amount: parseFloat(s.sugar)         || 0 },
                    { nutrientId: 7, amount: sodiumMgToSaltG(s.sodium) },
                ]
            }))
        };
    } catch (error) {
        throw error;
    }
}

export { searchFood, searchFoodById, parseFoodResponse };

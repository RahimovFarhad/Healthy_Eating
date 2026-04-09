import { getToken } from './apiTokenManager.js';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

import { createClient } from 'redis';
const redis = createClient();
await redis.connect();

async function searchFood(query) {
    const cacheKey = `search:${query}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    console.log("Cache miss for key:", cacheKey); // Debug log

    const token = await getToken();
    const response = await axios.get('https://platform.fatsecret.com/rest/foods/search/v1', {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            method: 'foods.search',
            search_expression: query,
            format: 'json'
        }
    });

    await redis.setEx(cacheKey, 60 * 60 * 24 * 7, JSON.stringify(response.data)); // 7 days TTL
    return response.data;
}

async function searchFoodById(id) {
    const cacheKey = `food:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const token = await getToken();
    const response = await axios.get(`https://platform.fatsecret.com/rest/food/v5`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            food_id: id
        },
        responseType: 'text' // force raw XML string
    });

    const parsed = parseFoodResponse(response.data);
    await redis.setEx(cacheKey, 60 * 60 * 24 * 7, JSON.stringify(parsed)); // 7 days TTL
    return parsed;
}

const parser = new XMLParser({ ignoreAttributes: false });

function parseFoodResponse(xml) {
    const result = parser.parse(xml);
    const food = result.food;
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
                { nutrientId: 7, amount: parseFloat(s.sodium)        || 0 },
            ]
        }))
    };
}

export { searchFood, searchFoodById, parseFoodResponse };
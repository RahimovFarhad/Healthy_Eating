import { getToken } from './apiTokenManager.js';
import axios from 'axios';

async function searchFood(query) {
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

    const foods = response.data?.foods?.food || [];
    foods.forEach(food => {
        console.log( parseFoodDescription(food.food_description) );
    });

    return response.data;
}

function parseFoodDescription(description) {
    // "Per 100g - Calories: 135kcal | Fat: 1.07g | Carbs: 27.64g | Protein: 2.64g"
    
    const servingMatch = description.match(/Per (.+?) -/);
    const caloriesMatch = description.match(/Calories: ([\d.]+)kcal/);
    const fatMatch = description.match(/Fat: ([\d.]+)g/);
    const carbsMatch = description.match(/Carbs: ([\d.]+)g/);
    const proteinMatch = description.match(/Protein: ([\d.]+)g/);

    return {
        serving: servingMatch?.[1],        // "100g" or "1/2 cup" or "1 serving"
        calories: parseFloat(caloriesMatch?.[1]),
        fat: parseFloat(fatMatch?.[1]),
        carbs: parseFloat(carbsMatch?.[1]),
        protein: parseFloat(proteinMatch?.[1])
    };
}

export { searchFood };
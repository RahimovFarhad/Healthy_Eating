/**
 * Recipes service module
 * Handles business logic for recipes, favorites, and reviews
 * @module recipes/service
 */

import { validateListRecipesInput, validatePositiveInteger, validateReviewInput } from "./recipes.validator.js";
import { listRecipes, findRecipeById, createRecipeReview, toggleRecipeFavorite, toggleRecipeUsage } from "./recipes.repository.js";

async function listRecipesService({ category, cuisine, ingredients, subscriberId }) {
    const filters = validateListRecipesInput({ category, cuisine, ingredients });
    const recipes = await listRecipes(filters);
    return processReturnedRecipes(recipes, subscriberId);
}

async function getRecipeByIdService({ recipeId, subscriberId }) {
    const normalizedRecipeId = validatePositiveInteger({ value: recipeId });
    const recipe = await findRecipeById({ recipeId: normalizedRecipeId });
    if (!recipe) return null;
    return processReturnedRecipes([recipe], subscriberId)[0];
}

async function submitRecipeReviewService({ recipeId, subscriberId, rating, comment }) {
    const normalizedRecipeId = validatePositiveInteger({ value: recipeId });
    const normalizedSubscriberId = validatePositiveInteger({ value: subscriberId });
    const reviewValues = validateReviewInput({ rating, comment });

    return createRecipeReview({
        recipeId: normalizedRecipeId,
        subscriberId: normalizedSubscriberId,
        rating: reviewValues.rating,
        comment: reviewValues.comment,
    });
}

async function toggleRecipeFavoriteService({ recipeId, subscriberId }) {
    const normalizedRecipeId = validatePositiveInteger({ value: recipeId });
    const normalizedSubscriberId = validatePositiveInteger({ value: subscriberId });

    return toggleRecipeFavorite({ recipeId: normalizedRecipeId, subscriberId: normalizedSubscriberId });
}

async function toggleRecipeUsageService({ recipeId, subscriberId }) {
    const normalizedRecipeId = validatePositiveInteger({ value: recipeId });
    const normalizedSubscriberId = validatePositiveInteger({ value: subscriberId });

    return toggleRecipeUsage({ recipeId: normalizedRecipeId, subscriberId: normalizedSubscriberId });
}

async function getFavoriteRecipesService({ subscriberId, category, cuisine, ingredients }) {
    const normalizedSubscriberId = validatePositiveInteger({ value: subscriberId });
    const filters = validateListRecipesInput({ category, cuisine, ingredients });
    const recipes = await listRecipes({ ...filters, favoritedBySubscriberId: normalizedSubscriberId });
    return processReturnedRecipes(recipes, normalizedSubscriberId);
}

async function getUsedRecipesService({ subscriberId, category, cuisine, ingredients }) {
    const normalizedSubscriberId = validatePositiveInteger({ value: subscriberId });
    const filters = validateListRecipesInput({ category, cuisine, ingredients });
    const recipes = await listRecipes({ ...filters, usedBySubscriberId: normalizedSubscriberId });
    return processReturnedRecipes(recipes, normalizedSubscriberId);
}

function processReturnedRecipes(recipes, subscriberId) {
    const averageRating = (reviews) => {
        if (!reviews || reviews.length === 0) return null;
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return total / reviews.length;
    }

    return recipes.map((recipe) => {
        const { recipeIngredients, reviews, favorites, usages, ...recipeWithoutIngredients } = recipe;
        const isFavorited = subscriberId
            ? (favorites ?? []).some(f => f.subscriberId === subscriberId)
            : false;
        const isUsed = subscriberId
            ? (usages ?? []).some(u => u.subscriberId === subscriberId)
            : false;
        return {
            ...recipeWithoutIngredients,
            averageRating: averageRating(reviews),
            reviewCount: (reviews ?? []).length,
            reviews,
            isFavorited,
            isUsed,
            ingredients: recipeIngredients.map((ri) => ri.ingredient.name),
            ingredientDetails: recipeIngredients.map((ri) => ({ quantity: ri.quantity, name: ri.ingredient.name })),
        };
    });
}

export {
    listRecipesService,
    getRecipeByIdService,
    submitRecipeReviewService,
    toggleRecipeFavoriteService,
    toggleRecipeUsageService,
    getFavoriteRecipesService,
    getUsedRecipesService
};

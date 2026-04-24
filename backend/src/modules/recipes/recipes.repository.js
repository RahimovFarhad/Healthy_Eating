import { prisma } from "../../db/prisma.js";

async function listRecipes({ category, cuisine, ingredients }){
    return prisma.recipe.findMany({
        where: {
            ...(category && { category }),
            ...(cuisine && { cuisine }),
            ...(ingredients && ingredients.length > 0 && {
                recipeIngredients: {
                    some: {
                        ingredient: {
                            name: {
                                in: ingredients
                            }
                        }
                    }
                }
            })
        }
    });
}
import { prisma } from "../../db/prisma.js";

async function listRecipes({ category, cuisine, ingredients }){
    return prisma.recipe.findMany({
        where: {
            ...(category && { category }),
            ...(cuisine && { cuisine }),
            ...(ingredients && ingredients.length > 0 && {
                AND: ingredients.map((i) => ({
                    recipeIngredients: {
                        some: {
                            ingredient: {
                                name: {
                                    contains: i,
                                    mode: "insensitive",
                                }
                            }
                        }
                    }
                }))
            })
        }
    });
}

export {listRecipes}
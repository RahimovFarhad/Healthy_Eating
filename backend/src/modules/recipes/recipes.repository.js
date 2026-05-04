import { prisma } from "../../db/prisma.js";

const RECIPE_SELECT = {
    recipeId: true,
    title: true,
    category: true,
    cuisine: true,
    servings: true,
    cookTime: true,
    image: true,
    instructions: true,
    kcal: true,
    protein: true,
    carbs: true,
    sugars: true,
    fat: true,
    saturatedFat: true,
    salt: true,
    fibre: true,
    recipeIngredients: {
        select: {
            quantity: true,
            ingredient: {
                select: {
                    name: true
                }
            }
        }
    },
    reviews: {
        select: {
            reviewId: true,
            subscriberId: true,
            rating: true,
            comment: true,
            createdAt: true,
        }
    },
    favorites: {
        select: {
            subscriberId: true,
        }
    },
}

async function listRecipes({ category, cuisine, ingredients, favoritedBySubscriberId }) {
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
            }),
            ...(favoritedBySubscriberId && {
                favorites: {
                    some: {
                        subscriberId: favoritedBySubscriberId,
                    }
                }
            })
        },
        select: RECIPE_SELECT
    });
}

async function findRecipeById({ recipeId }){
    return prisma.recipe.findFirst({
        where: {
            recipeId
        },
        select: RECIPE_SELECT
    })
}

async function createRecipeReview({ recipeId, subscriberId, rating, comment }) {
    return prisma.recipeReview.create({
        data: {
            recipeId,
            subscriberId,
            rating,
            comment,
        },
        select: {
            reviewId: true,
            recipeId: true,
            subscriberId: true,
            rating: true,
            comment: true,
            createdAt: true,
        },
    });
}

async function toggleRecipeFavorite({ recipeId, subscriberId }) {
  const existingFavorite = await favoriteExists({ recipeId, subscriberId });

  if (existingFavorite) {
    await prisma.recipeFavorite.delete({
      where: { id: existingFavorite.id },
    });
    return { favorited: false };
  }

  await prisma.recipeFavorite.create({
    data: {
      subscriberId,
      recipeId,
    },
  });
  return { favorited: true };
}

async function favoriteExists({ recipeId, subscriberId }) {
    return prisma.recipeFavorite.findUnique({
        where: {
            subscriberId_recipeId: { subscriberId, recipeId },
        },
        select: {
            id: true,
        },
    });

}



export {listRecipes, findRecipeById, createRecipeReview, toggleRecipeFavorite}
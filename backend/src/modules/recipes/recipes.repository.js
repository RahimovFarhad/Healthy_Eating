import { prisma } from "../../db/prisma.js";

const RECIPE_SELECT = {
    recipeId: true,    
    title: true,        
    instructions: true, 
    kcal: true,         
    protein: true,     
    carbs: true,     
    sugars: true,     
    fat: true,       
    saturatedFat: true, 
    salt: true,
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
    reviews: true 
}

async function listRecipes({ category, cuisine, ingredients, favouritedBySubscriberId }) {
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
            ...(favouritedBySubscriberId && {
                recipeFavorites: {
                    some: {
                        subscriberId: favouritedBySubscriberId,
                    }
                }
            })
        },
        select: { RECIPE_SELECT }
    });
}

async function findRecipeById({ recipeId }){
    return prisma.recipe.findFirst({
        where: {
            recipeId
        },
        select: { RECIPE_SELECT }
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

async function toggleRecipeFavourite({ recipeId, subscriberId }) {
  const existingFavorite = await favouriteExists({ recipeId, subscriberId });

  if (existingFavorite) {
    await prisma.recipeFavorite.delete({
      where: { favouriteId: existingFavorite.favouriteId },
    });
    return { favourited: false };
  }

  await prisma.recipeFavorite.create({
    data: {
      subscriberId,
      recipeId,
    },
  });
  return { favourited: true };
}

async function favouriteExists({ recipeId, subscriberId }) {
  const existingFavorite = await prisma.recipeFavorite.findUnique({
    where: {
      subscriberId_recipeId: {
        subscriberId,
        recipeId,
      },
    },
  });
  return !!existingFavorite;
}



export {listRecipes, findRecipeById, createRecipeReview, toggleRecipeFavourite}
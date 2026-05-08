import { jest, expect } from "@jest/globals";
import { RecipeError } from "../../src/modules/recipes/recipes.validator.js";

const listRecipes = jest.fn();
const findRecipeById = jest.fn();
const createRecipeReview = jest.fn();
const toggleRecipeFavorite = jest.fn();
const toggleRecipeUsage = jest.fn();

jest.unstable_mockModule("../../src/modules/recipes/recipes.repository.js", () => ({
  listRecipes,
  findRecipeById,
  createRecipeReview,
  toggleRecipeFavorite,
  toggleRecipeUsage,
}));

const {
  listRecipesService,
  getRecipeByIdService,
  submitRecipeReviewService,
  toggleRecipeFavoriteService,
  getFavoriteRecipesService,
} = await import("../../src/modules/recipes/recipes.service.js");

function buildRecipe(overrides = {}) {
  return {
    recipeId: 1,
    title: "Tomato Pasta",
    instructions: "Cook pasta and add tomato sauce.",
    kcal: 500,
    protein: 20,
    carbs: 70,
    sugars: 8,
    fat: 12,
    saturatedFat: 3,
    salt: 1,
    recipeIngredients: [
      {
        quantity: "100g",
        ingredient: {
          name: "pasta",
        },
      },
      {
        quantity: "50g",
        ingredient: {
          name: "tomato",
        },
      },
    ],
    reviews: [
      {
        rating: 4,
      },
      {
        rating: 5,
      },
    ],
    ...overrides,
  };
}

describe("Recipes Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listRecipesService", () => {
    test("returns processed recipes when input is valid", async () => {
      const recipe = buildRecipe();
      listRecipes.mockResolvedValue([recipe]);

      const result = await listRecipesService({
        category: " Dinner ",
        cuisine: " Italian ",
        ingredients: [" tomato ", "pasta"],
      });

      expect(listRecipes).toHaveBeenCalledWith({
        category: "Dinner",
        cuisine: "Italian",
        ingredients: ["tomato", "pasta"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].recipeId).toBe(1);
      expect(result[0].title).toBe("Tomato Pasta");
      expect(result[0].ingredients).toEqual(["pasta", "tomato"]);
      expect(result[0].ingredientDetails).toEqual([
        {
          name: "pasta",
          quantity: "100g",
        },
        {
          name: "tomato",
          quantity: "50g",
        },
      ]);
      expect(result[0].averageRating).toBe(4.5);
      expect(result[0].reviewCount).toBe(2);
      expect(result[0].isFavorited).toBe(false);
    });

    test("returns averageRating null when recipe has no reviews", async () => {
      const recipe = buildRecipe({
        reviews: [],
      });
      listRecipes.mockResolvedValue([recipe]);

      const result = await listRecipesService({});

      expect(result[0].averageRating).toBeNull();
    });

    test("throws RecipeError when ingredients is not an array", async () => {
      await expect(
        listRecipesService({
          ingredients: "tomato",
        })
      ).rejects.toThrow(RecipeError);

      expect(listRecipes).not.toHaveBeenCalled();
    });
  });

  describe("getRecipeByIdService", () => {
    test("returns processed recipe when recipe exists", async () => {
      const recipe = buildRecipe({
        recipeId: 2,
        title: "Chicken Rice",
      });

      findRecipeById.mockResolvedValue(recipe);

      const result = await getRecipeByIdService({
        recipeId: "2",
      });

      expect(findRecipeById).toHaveBeenCalledWith({
        recipeId: 2,
      });
      expect(result.recipeId).toBe(2);
      expect(result.title).toBe("Chicken Rice");
      expect(result.ingredients).toEqual(["pasta", "tomato"]);
      expect(result.averageRating).toBe(4.5);
    });

    test("returns null when recipe does not exist", async () => {
      findRecipeById.mockResolvedValue(null);

      const result = await getRecipeByIdService({
        recipeId: 999,
      });

      expect(result).toBeNull();
    });

    test("throws RecipeError when recipeId is invalid", async () => {
      await expect(
        getRecipeByIdService({
          recipeId: "invalid",
        })
      ).rejects.toThrow(RecipeError);

      expect(findRecipeById).not.toHaveBeenCalled();
    });
  });

  describe("submitRecipeReviewService", () => {
    test("creates recipe review when input is valid", async () => {
      const review = {
        reviewId: 1,
        recipeId: 2,
        subscriberId: 3,
        rating: 5,
        comment: "Great recipe",
      };

      createRecipeReview.mockResolvedValue(review);

      const result = await submitRecipeReviewService({
        recipeId: "2",
        subscriberId: "3",
        rating: "5",
        comment: " Great recipe ",
      });

      expect(createRecipeReview).toHaveBeenCalledWith({
        recipeId: 2,
        subscriberId: 3,
        rating: 5,
        comment: "Great recipe",
      });
      expect(result).toEqual(review);
    });

    test("throws RecipeError when recipeId is invalid", async () => {
      await expect(
        submitRecipeReviewService({
          recipeId: "invalid",
          subscriberId: 3,
          rating: 5,
          comment: "Good",
        })
      ).rejects.toThrow(RecipeError);

      expect(createRecipeReview).not.toHaveBeenCalled();
    });

    test("throws RecipeError when subscriberId is invalid", async () => {
      await expect(
        submitRecipeReviewService({
          recipeId: 2,
          subscriberId: null,
          rating: 5,
          comment: "Good",
        })
      ).rejects.toThrow(RecipeError);

      expect(createRecipeReview).not.toHaveBeenCalled();
    });

    test("throws RecipeError when rating is invalid", async () => {
      await expect(
        submitRecipeReviewService({
          recipeId: 2,
          subscriberId: 3,
          rating: 6,
          comment: "Too high",
        })
      ).rejects.toThrow(RecipeError);

      expect(createRecipeReview).not.toHaveBeenCalled();
    });
  });

  describe("toggleRecipeFavoriteService", () => {
    test("toggles recipe favorite when input is valid", async () => {
      const favorite = {
        favorited: true,
      };

      toggleRecipeFavorite.mockResolvedValue(favorite);

      const result = await toggleRecipeFavoriteService({
        recipeId: "2",
        subscriberId: "3",
      });

      expect(toggleRecipeFavorite).toHaveBeenCalledWith({
        recipeId: 2,
        subscriberId: 3,
      });
      expect(result).toEqual(favorite);
    });

    test("throws RecipeError when recipeId is invalid", async () => {
      await expect(
        toggleRecipeFavoriteService({
          recipeId: "invalid",
          subscriberId: 3,
        })
      ).rejects.toThrow(RecipeError);

      expect(toggleRecipeFavorite).not.toHaveBeenCalled();
    });

    test("throws RecipeError when subscriberId is invalid", async () => {
      await expect(
        toggleRecipeFavoriteService({
          recipeId: 2,
          subscriberId: 0,
        })
      ).rejects.toThrow(RecipeError);

      expect(toggleRecipeFavorite).not.toHaveBeenCalled();
    });
  });

  describe("getFavoriteRecipesService", () => {
    test("returns processed favorite recipes when input is valid", async () => {
      const recipe = buildRecipe({
        recipeId: 3,
        title: "Favorite Pasta",
      });

      listRecipes.mockResolvedValue([recipe]);

      const result = await getFavoriteRecipesService({
        subscriberId: "4",
        category: " Dinner ",
        cuisine: " Italian ",
        ingredients: [" tomato "],
      });

      expect(listRecipes).toHaveBeenCalledWith({
        category: "Dinner",
        cuisine: "Italian",
        ingredients: ["tomato"],
        favoritedBySubscriberId: 4,
      });
      expect(result[0].recipeId).toBe(3);
      expect(result[0].title).toBe("Favorite Pasta");
      expect(result[0].ingredients).toEqual(["pasta", "tomato"]);
      expect(result[0].averageRating).toBe(4.5);
    });

    test("throws RecipeError when subscriberId is invalid", async () => {
      await expect(
        getFavoriteRecipesService({
          subscriberId: null,
        })
      ).rejects.toThrow(RecipeError);

      expect(listRecipes).not.toHaveBeenCalled();
    });
  });
});

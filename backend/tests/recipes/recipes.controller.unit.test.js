import { jest, expect } from "@jest/globals";
import { RecipeError } from "../../src/modules/recipes/recipes.validator.js";

const listRecipesService = jest.fn();
const getRecipeByIdService = jest.fn();
const submitRecipeReviewService = jest.fn();
const toggleRecipeFavoriteService = jest.fn();
const toggleRecipeUsageService = jest.fn();
const getFavoriteRecipesService = jest.fn();
const getUsedRecipesService = jest.fn();

jest.unstable_mockModule("../../src/modules/recipes/recipes.service.js", () => ({
  listRecipesService,
  getRecipeByIdService,
  submitRecipeReviewService,
  toggleRecipeFavoriteService,
  toggleRecipeUsageService,
  getFavoriteRecipesService,
  getUsedRecipesService,
}));

const {
  listRecipes,
  getRecipeById,
  submitRecipeReview,
  toggleRecipeFavorite,
  getFavoriteRecipes,
} = await import("../../src/modules/recipes/recipes.controller.js");

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Recipes Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listRecipes", () => {
    test("returns 200 and recipes when service succeeds", async () => {
      const recipes = [
        {
          id: 1,
          title: "Pasta",
          category: "Dinner",
          cuisine: "Italian",
        },
      ];

      listRecipesService.mockResolvedValue(recipes);

      const req = {
        query: {
          category: "Dinner",
          cuisine: "Italian",
          ingredients: "tomato,pasta",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await listRecipes(req, res, next);

      expect(listRecipesService).toHaveBeenCalledWith({
        category: "Dinner",
        cuisine: "Italian",
        ingredients: ["tomato", "pasta"],
        subscriberId: null,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ recipes });
      expect(next).not.toHaveBeenCalled();
    });

    test("uses empty ingredients array when ingredients query is missing", async () => {
      listRecipesService.mockResolvedValue([]);

      const req = {
        query: {},
      };
      const res = mockResponse();
      const next = jest.fn();

      await listRecipes(req, res, next);

      expect(listRecipesService).toHaveBeenCalledWith({
        category: undefined,
        cuisine: undefined,
        ingredients: [],
        subscriberId: null,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ recipes: [] });
    });

    test("returns 400 when service throws RecipeError", async () => {
      listRecipesService.mockRejectedValue(new RecipeError("Ingredients must be an array"));

      const req = {
        query: {},
      };
      const res = mockResponse();
      const next = jest.fn();

      await listRecipes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Ingredients must be an array",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unexpected error", async () => {
      const error = new Error("Database error");
      listRecipesService.mockRejectedValue(error);

      const req = {
        query: {},
      };
      const res = mockResponse();
      const next = jest.fn();

      await listRecipes(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getRecipeById", () => {
    test("returns 200 and recipe when service succeeds", async () => {
      const recipe = {
        id: 1,
        title: "Pasta",
      };

      getRecipeByIdService.mockResolvedValue(recipe);

      const req = {
        params: {
          id: "1",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await getRecipeById(req, res, next);

      expect(getRecipeByIdService).toHaveBeenCalledWith({
        recipeId: "1",
        subscriberId: null,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ recipe });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when service throws RecipeError", async () => {
      getRecipeByIdService.mockRejectedValue(new RecipeError("Value must be a positive integer"));

      const req = {
        params: {
          id: "invalid",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await getRecipeById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Value must be a positive integer",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unexpected error", async () => {
      const error = new Error("Unexpected error");
      getRecipeByIdService.mockRejectedValue(error);

      const req = {
        params: {
          id: "1",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await getRecipeById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("submitRecipeReview", () => {
    test("returns 201 and review when service succeeds", async () => {
      const review = {
        id: 1,
        recipeId: 2,
        subscriberId: 3,
        rating: 5,
        comment: "Great",
      };

      submitRecipeReviewService.mockResolvedValue(review);

      const req = {
        params: {
          id: "2",
        },
        user: {
          userId: 3,
        },
        body: {
          rating: 5,
          comment: "Great",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await submitRecipeReview(req, res, next);

      expect(submitRecipeReviewService).toHaveBeenCalledWith({
        recipeId: "2",
        subscriberId: 3,
        rating: 5,
        comment: "Great",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ review });
      expect(next).not.toHaveBeenCalled();
    });

    test("uses null subscriberId when user is missing", async () => {
      const review = {
        id: 1,
        rating: 4,
      };

      submitRecipeReviewService.mockResolvedValue(review);

      const req = {
        params: {
          id: "2",
        },
        body: {
          rating: 4,
          comment: "Nice",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await submitRecipeReview(req, res, next);

      expect(submitRecipeReviewService).toHaveBeenCalledWith({
        recipeId: "2",
        subscriberId: null,
        rating: 4,
        comment: "Nice",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ review });
    });

    test("returns 400 when service throws RecipeError", async () => {
      submitRecipeReviewService.mockRejectedValue(
        new RecipeError("Rating must be an integer between 1 and 5")
      );

      const req = {
        params: {
          id: "2",
        },
        user: {
          userId: 3,
        },
        body: {
          rating: 6,
          comment: "Too high",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await submitRecipeReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Rating must be an integer between 1 and 5",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unexpected error", async () => {
      const error = new Error("Unexpected error");
      submitRecipeReviewService.mockRejectedValue(error);

      const req = {
        params: {
          id: "2",
        },
        user: {
          userId: 3,
        },
        body: {
          rating: 5,
          comment: "Good",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await submitRecipeReview(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("toggleRecipeFavorite", () => {
    test("returns 200 and favorite when service succeeds", async () => {
      const favorite = {
        recipeId: 1,
        subscriberId: 2,
        favorited: true,
      };

      toggleRecipeFavoriteService.mockResolvedValue(favorite);

      const req = {
        params: {
          id: "1",
        },
        user: {
          userId: 2,
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await toggleRecipeFavorite(req, res, next);

      expect(toggleRecipeFavoriteService).toHaveBeenCalledWith({
        recipeId: "1",
        subscriberId: 2,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ favorite });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when service throws RecipeError", async () => {
      toggleRecipeFavoriteService.mockRejectedValue(
        new RecipeError("Value must be a positive integer")
      );

      const req = {
        params: {
          id: "invalid",
        },
        user: {
          userId: 2,
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await toggleRecipeFavorite(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Value must be a positive integer",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unexpected error", async () => {
      const error = new Error("Unexpected error");
      toggleRecipeFavoriteService.mockRejectedValue(error);

      const req = {
        params: {
          id: "1",
        },
        user: {
          userId: 2,
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await toggleRecipeFavorite(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getFavoriteRecipes", () => {
    test("returns 200 and favorite recipes when service succeeds", async () => {
      const favRecipes = [
        {
          id: 1,
          title: "Pasta",
        },
      ];

      getFavoriteRecipesService.mockResolvedValue(favRecipes);

      const req = {
        user: {
          userId: 2,
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await getFavoriteRecipes(req, res, next);

      expect(getFavoriteRecipesService).toHaveBeenCalledWith({
        subscriberId: 2,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ recipes: favRecipes });
      expect(next).not.toHaveBeenCalled();
    });

    test("uses null subscriberId when user is missing", async () => {
      getFavoriteRecipesService.mockResolvedValue([]);

      const req = {};
      const res = mockResponse();
      const next = jest.fn();

      await getFavoriteRecipes(req, res, next);

      expect(getFavoriteRecipesService).toHaveBeenCalledWith({
        subscriberId: null,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ recipes: [] });
    });

    test("returns 400 when service throws RecipeError", async () => {
      getFavoriteRecipesService.mockRejectedValue(
        new RecipeError("Value must be a positive integer")
      );

      const req = {};
      const res = mockResponse();
      const next = jest.fn();

      await getFavoriteRecipes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Value must be a positive integer",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unexpected error", async () => {
      const error = new Error("Unexpected error");
      getFavoriteRecipesService.mockRejectedValue(error);

      const req = {
        user: {
          userId: 2,
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await getFavoriteRecipes(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

import { expect } from "@jest/globals";
import {
  RecipeError,
  validateListRecipesInput,
  validatePositiveInteger,
  validateReviewInput,
} from "../../src/modules/recipes/recipes.validator.js";

describe("Recipes Validator", () => {
  describe("validateListRecipesInput", () => {
    test("returns normalised values when input is valid", () => {
      const input = {
        category: " Breakfast ",
        cuisine: " Italian ",
        ingredients: [" garlic ", " chicken "],
      };

      const result = validateListRecipesInput(input);

      expect(result).toEqual({
        category: "Breakfast",
        cuisine: "Italian",
        ingredients: ["garlic", "chicken"],
      });
    });

    test("returns null category and cuisine when they are missing", () => {
      const input = {};

      const result = validateListRecipesInput(input);

      expect(result).toEqual({
        category: null,
        cuisine: null,
        ingredients: [],
      });
    });

    test("filters out empty ingredient strings after trimming", () => {
      const input = {
        ingredients: [" garlic ", " ", "chicken", ""],
      };

      const result = validateListRecipesInput(input);

      expect(result.ingredients).toEqual(["garlic", "chicken"]);
    });

    test("throws RecipeError when ingredients is not an array", () => {
      const input = {
        ingredients: "garlic",
      };

      expect(() => validateListRecipesInput(input)).toThrow(RecipeError);
    });

    test("throws RecipeError when an ingredient is not a string", () => {
      const input = {
        ingredients: ["garlic", 123],
      };

      expect(() => validateListRecipesInput(input)).toThrow(RecipeError);
    });
  });

  describe("validatePositiveInteger", () => {
    test("returns number when value is a positive integer", () => {
      const result = validatePositiveInteger({ value: 1 });

      expect(result).toBe(1);
    });

    test("returns number when value is a numeric string", () => {
      const result = validatePositiveInteger({ value: "2" });

      expect(result).toBe(2);
    });

    test("throws RecipeError when value is missing", () => {
      expect(() => validatePositiveInteger({})).toThrow(RecipeError);
    });

    test("throws RecipeError when value is null", () => {
      expect(() => validatePositiveInteger({ value: null })).toThrow(RecipeError);
    });

    test("throws RecipeError when value is zero", () => {
      expect(() => validatePositiveInteger({ value: 0 })).toThrow(RecipeError);
    });

    test("throws RecipeError when value is negative", () => {
      expect(() => validatePositiveInteger({ value: -1 })).toThrow(RecipeError);
    });

    test("throws RecipeError when value is not an integer", () => {
      expect(() => validatePositiveInteger({ value: 1.5 })).toThrow(RecipeError);
    });

    test("throws RecipeError when value is a non-numeric string", () => {
      expect(() => validatePositiveInteger({ value: "recipe-id" })).toThrow(RecipeError);
    });
  });

  describe("validateReviewInput", () => {
    test("returns normalised values when rating and comment are valid", () => {
      const input = {
        rating: 5,
        comment: " Very good recipe ",
      };

      const result = validateReviewInput(input);

      expect(result).toEqual({
        rating: 5,
        comment: "Very good recipe",
      });
    });

    test("returns null comment when comment is missing", () => {
      const input = {
        rating: 4,
      };

      const result = validateReviewInput(input);

      expect(result).toEqual({
        rating: 4,
        comment: null,
      });
    });

    test("returns null comment when comment is empty string", () => {
      const input = {
        rating: 4,
        comment: " ",
      };

      const result = validateReviewInput(input);

      expect(result).toEqual({
        rating: 4,
        comment: null,
      });
    });

    test("returns number when rating is a numeric string", () => {
      const input = {
        rating: "3",
        comment: "nice",
      };

      const result = validateReviewInput(input);

      expect(result).toEqual({
        rating: 3,
        comment: "nice",
      });
    });

    test("throws RecipeError when rating is missing", () => {
      const input = {
        comment: "nice",
      };

      expect(() => validateReviewInput(input)).toThrow(RecipeError);
    });

    test("throws RecipeError when rating is zero", () => {
      const input = {
        rating: 0,
        comment: "bad",
      };

      expect(() => validateReviewInput(input)).toThrow(RecipeError);
    });

    test("throws RecipeError when rating is greater than 5", () => {
      const input = {
        rating: 6,
        comment: "too high",
      };

      expect(() => validateReviewInput(input)).toThrow(RecipeError);
    });

    test("throws RecipeError when rating is negative", () => {
      const input = {
        rating: -1,
        comment: "bad",
      };

      expect(() => validateReviewInput(input)).toThrow(RecipeError);
    });

    test("throws RecipeError when rating is not an integer", () => {
      const input = {
        rating: 4.5,
        comment: "almost",
      };

      expect(() => validateReviewInput(input)).toThrow(RecipeError);
    });

    test("throws RecipeError when rating is a non-numeric string", () => {
      const input = {
        rating: "good",
        comment: "nice",
      };

      expect(() => validateReviewInput(input)).toThrow(RecipeError);
    });
  });
});
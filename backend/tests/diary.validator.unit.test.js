// tests/diary.validator.unit.test.js
import { expect } from "@jest/globals";
import {
  DiaryEntryError,
  getDiaryErrorStatus,
  validateCreateDiaryEntryInput,
  validateSummaryInput,
  validateListDisplay,
  validateEntryDetails,
  validateNewEntryDetails,
  validateUpdatedEntryItem,
  validateDeletedDiaryEntry,
  validateDeletedDiaryEntryItem,
  validateCreateFoodItemInput,
  validateCreateFoodPortionInput,
  validateUserIdForDashboard,
} from "../src/modules/diary/diary.validator.js";

describe("Diary Validator", () => {
  describe("getDiaryErrorStatus", () => {
  });

  describe("validateCreateDiaryEntryInput", () => {
  });

  describe("validateSummaryInput", () => {
  });

  describe("validateListDisplay", () => {
  });

  describe("validateEntryDetails", () => {
  });

  describe("validateNewEntryDetails", () => {
  });

  describe("validateUpdatedEntryItem", () => {
    // "happy" test paths
    test("returns normalised diaryEntryItemId and userId if both attributes are valid", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: 1,
      };

      const expected = {
        diaryEntryItemId: 1,
        userId: 1,
        portionId: undefined,
        quantity: undefined,
      };

      const result = validateUpdatedEntryItem(input);

      expect(result).toEqual(expected);
    });
    test("returns normalised attributes if all attributes are valid and only portionId was provided as an optional attribute", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: 1,
        portionId: 1,
      };

      const expected = {
        diaryEntryItemId: 1,
        userId: 1,
        portionId: 1,
        quantity: undefined,
      };

      const result = validateUpdatedEntryItem(input);

      expect(result).toEqual(expected);
    });
    test("returns normalised attributes if all attributes are valid and only quantity was provided as an optional attribute", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: 1,
        quantity: 1,
      };

      const expected = {
        diaryEntryItemId: 1,
        userId: 1,
        portionId: undefined,
        quantity: 1,
      };

      const result = validateUpdatedEntryItem(input);

      expect(result).toEqual(expected);
    });
    // diaryEntryItemId error tests
    test("throws DiaryEntryError if diaryEntryItemId is missing", () => {
      const input = {
        userId: 1,
      };

      expect(() => validateUpdatedEntryItem(input)).toThrow(DiaryEntryError);
    }); 
    test("throws DiaryEntryError if diaryEntryItemId is a negative integer", () => {
      const input = {
        diaryEntryItemId: -1,
        userId: 1,
      };

      expect(() => validateUpdatedEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if diaryEntryItemId is zero", () => {
      const input = {
        diaryEntryItemId: 0,
        userId: 1,
      };

      expect(() => validateUpdatedEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if diaryEntryItemId is a string", () => {
      const input = {
        diaryEntryItemId: "diary-item-id",
        userId: 1,
      };

      expect(() => validateUpdatedEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if diaryEntryItemId is null", () => {
      const input = {
        diaryEntryItemId: null,
        userId: 1,
      };

      expect(() => validateUpdatedEntryItem(input)).toThrow(DiaryEntryError);
    });
    // userId tests
    test("throws DiaryEntryError if userId is missing", () => {
      const input = {
        diaryEntryItemId: 1,
      };

      expect(() => validateUpdatedEntryItem(input)).toThrow(DiaryEntryError);
    }); 
    test("throws DiaryEntryError if userId is a negative integer", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: -1,
      };

      expect(() => validateUpdatedEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if userId is zero", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: 0,
      };

      expect(() => validateUpdatedEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if userId is a string", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: "user-id",
      };

      expect(() => validateUpdatedEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if userId is null", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: null,
      };

      expect(() => validateUpdatedEntryItem(input)).toThrow(DiaryEntryError);
    });
  });

  describe("validateDeletedDiaryEntry", () => {
    // "happy" path tests
    test("returns normalised attributes if all are valid", () => {
      const input = {
        diaryEntryId: 1,
        userId: 1,
      };

      const expected = {
        diaryEntryId: 1,
        userId: 1,
      };

      const result = validateDeletedDiaryEntry(input);

      expect(result).toEqual(expected);
    });
    // userId error tests
    test("throws DiaryEntryError if userId is missing", () => {
      const input = {
        diaryEntryId: 1,
      };

      expect(() => validateDeletedDiaryEntry(input)).toThrow(DiaryEntryError);
    }); 
    test("throws DiaryEntryError if userId is a negative integer", () => {
      const input = {
        diaryEntryId: 1,
        userId: -1,
      };

      expect(() => validateDeletedDiaryEntry(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if userId is zero", () => {
      const input = {
        diaryEntryId: 1,
        userId: 0,
      };

      expect(() => validateDeletedDiaryEntry(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if userId is a string", () => {
      const input = {
        diaryEntryId: 1,
        userId: "user-id",
      };

      expect(() => validateDeletedDiaryEntry(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if userId is null", () => {
      const input = {
        diaryEntryId: 1,
        userId: null,
      };

      expect(() => validateDeletedDiaryEntry(input)).toThrow(DiaryEntryError);
    });
    // diaryEntryId error tests
    test("throws DiaryEntryError if diaryEntryId is missing", () => {
      const input = {
        userId: 1,
      };

      expect(() => validateDeletedDiaryEntry(input)).toThrow(DiaryEntryError);
    }); 
    test("throws DiaryEntryError if diaryEntryId is a negative integer", () => {
      const input = {
        diaryEntryId: -1,
        userId: 1,
      };

      expect(() => validateDeletedDiaryEntry(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if diaryEntryId is zero", () => {
      const input = {
        diaryEntryId: 0,
        userId: 1,
      };

      expect(() => validateDeletedDiaryEntry(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if diaryEntryId is a string", () => {
      const input = {
        diaryEntryId: "diary-id",
        userId: 1,
      };

      expect(() => validateDeletedDiaryEntry(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if diaryEntryId is null", () => {
      const input = {
        diaryEntryId: null,
        userId: 1,
      };

      expect(() => validateDeletedDiaryEntry(input)).toThrow(DiaryEntryError);
    });
  });

  describe("validateDeletedDiaryEntryItem", () => {
    // "happy" path tests
    test("returns normalised attributes if all are valid", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: 1,
      };

      const expected = {
        diaryEntryItemId: 1,
        userId: 1,
      };

      const result = validateDeletedDiaryEntryItem(input);

      expect(result).toEqual(expected);
    });
    // userId error tests
    test("throws DiaryEntryError if userId is missing", () => {
      const input = {
        diaryEntryItemId: 1,
      };

      expect(() => validateDeletedDiaryEntryItem(input)).toThrow(DiaryEntryError);
    }); 
    test("throws DiaryEntryError if userId is a negative integer", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: -1,
      };

      expect(() => validateDeletedDiaryEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if userId is zero", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: 0,
      };

      expect(() => validateDeletedDiaryEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if userId is a string", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: "user-id",
      };

      expect(() => validateDeletedDiaryEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if userId is null", () => {
      const input = {
        diaryEntryItemId: 1,
        userId: null,
      };

      expect(() => validateDeletedDiaryEntryItem(input)).toThrow(DiaryEntryError);
    });
    // diaryEntryItemId error tests
    test("throws DiaryEntryError if diaryEntryItemId is missing", () => {
      const input = {
        userId: 1,
      };

      expect(() => validateDeletedDiaryEntryItem(input)).toThrow(DiaryEntryError);
    }); 
    test("throws DiaryEntryError if diaryEntryItemId is a negative integer", () => {
      const input = {
        diaryEntryItemId: -1,
        userId: 1,
      };

      expect(() => validateDeletedDiaryEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if diaryEntryItemId is zero", () => {
      const input = {
        diaryEntryItemId: 0,
        userId: 1,
      };

      expect(() => validateDeletedDiaryEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if diaryEntryItemId is a string", () => {
      const input = {
        diaryEntryItemId: "diary-item-id",
        userId: 1,
      };

      expect(() => validateDeletedDiaryEntryItem(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if diaryEntryItemId is null", () => {
      const input = {
        diaryEntryItemId: null,
        userId: 1,
      };

      expect(() => validateDeletedDiaryEntryItem(input)).toThrow(DiaryEntryError);
    });
  });

  describe("validateCreateFoodItemInput", () => {
    // "happy" paths tests
    test("returns normalised arguments if all attributes are valid and source is fatsecret", () => {
      const input = {
        name: "pizza",
        source: "fatsecret",
        externalId: 1,
      };

      const expected = {
        name: "pizza",
        brand: null,
        source: "fatsecret",
        externalId: 1,
        createdByUserId: null,
      }

      const result = validateCreateFoodItemInput(input);

      expect(result).toEqual(expected);
    });
    test("returns normalised arguments if all attributes are valid and source is user", () => {
      const input = {
        name: "tomato pasta",
        source: "user",
        createdByUserId: 1,
      };

      const expected = {
        name: "tomato pasta",
        brand: null,
        source: "user",
        externalId: null,
        createdByUserId: 1,
      }

      const result = validateCreateFoodItemInput(input);

      expect(result).toEqual(expected);
    });
    test("returns normalised arguments if all attributes are valid and source is system", () => {
      const input = {
        name: "lettuce",
        source: "system",
      };

      const expected = {
        name: "lettuce",
        brand: null,
        source: "system",
        externalId: null,
        createdByUserId: null,
      }

      const result = validateCreateFoodItemInput(input);

      expect(result).toEqual(expected);
    });
    // name error tests
    test("throws DiaryEntryError if name is missing", () => {
      const input = {
        source: "user",
        createdByUser: 1,
      };

      expect(() => validateCreateFoodItemInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if name is an integer", () => {
      const input = {
        name: 122,
        source: "user",
        createdByUser: 1,
      };

      expect(() => validateCreateFoodItemInput(input)).toThrow(DiaryEntryError);
    });
    // source error test
    test("throws DiaryEntryError if source is missing", () => {
      const input = {
        name: "pizza",
      };

      expect(() => validateCreateFoodItemInput(input)).toThrow(DiaryEntryError);
    });
    // externalId error test
    test("throws DiaryEntryError if source is fatsecret and externalId is missing", () => {
      const input = {
        name: "pizza",
        source: "fatsecret",
      };

      expect(() => validateCreateFoodItemInput(input)).toThrow(DiaryEntryError);
    });
    // createdByUserId error tests
    test("throws DiaryEntryError if source is user and createdByUserId is missing", () => {
      const input = {
        name: "pizza",
        source: "user",
      };

      expect(() => validateCreateFoodItemInput(input)).toThrow(DiaryEntryError);
    }); 
    test("throws DiaryEntryError if source is user and createdByUserId is a negative integer", () => {
      const input = {
        name: "pizza",
        source: "user",
        externalId: null, // since source = user
        createdByUserId: -1,
      };

      expect(() => validateCreateFoodItemInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if source is user and createdByUserId is zero", () => {
      const input = {
        name: "pizza",
        source: "user",
        createdByUserId: 0,
      };

      expect(() => validateCreateFoodItemInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if source is user and createdByUserId is a string", () => {
      const input = {
        name: "pizza",
        source: "user",
        createdByUserId: "my-id",
      };

      expect(() => validateCreateFoodItemInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if source is user and createdByUserId is null", () => {
      const input = {
        name: "pizza",
        source: "user",
        createdByUserId: null,
      };

      expect(() => validateCreateFoodItemInput(input)).toThrow(DiaryEntryError);
    });
  });

  describe("validateCreateFoodPortionInput", () => {
    // "happy" paths tests
    test("returns normalised arguments if all attributes are valid", () => {
      const input = {
        foodItemId: 1,
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount)
      };

      const expected = {
        foodItemId: 1,
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount), // (nutrientId, amount) 
      };

      const result = validateCreateFoodPortionInput(input);

      expect(result).toEqual(expected);
    });
    test("returns normalised arguments if all attributes are valid and weightG is one", () => {
      const input = {
        foodItemId: 1,
        description: "protein intake",
        weightG: 1,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount), // (nutrientId, amount) 
      };

      const expected = {
        foodItemId: 1,
        description: "protein intake",
        weightG: 1,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount), // // (nutrientId, amount) 
      };

      const result = validateCreateFoodPortionInput(input);

      expect(result).toEqual(expected);
    }); // boundary test for weightG = 1, should still pass
    test("returns normalised arguments if all attributes are valid and amount in nutrients array is one", () => {
      const input = {
        foodItemId: 1,
        description: "fibre intake",
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: 1 }], // (nutrientId, amount), // (nutrientId, amount) 
      };

      const expected = {
        foodItemId: 1,
        description: "fibre intake",
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: 1 }], // (nutrientId, amount)
      };

      const result = validateCreateFoodPortionInput(input);

      expect(result).toEqual(expected);
    }) // boundary test for nutrients = , should still pass
    // foodItemId error tests
    test("throws DiaryEntryError if foodItemId is missing", () => {
      const input = {
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount)
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    }); 
    test("throws DiaryEntryError if foodItemId is a negative integer", () => {
      const input = {
        foodItemId: -1,
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount) 
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if foodItemId is zero", () => {
      const input = {
        foodItemId: 0,
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount) 
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if foodItemId is a string", () => {
      const input = {
        foodItemId: "food-item-id",
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount)
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if foodItemId is null", () => {
      const input = {
        foodItemId: null,
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount) 
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    // description error tests
    test("throws DiaryEntryError if description is missing", () => {
      const input = {
        foodItemId: 1,
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount) 
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if description is a number", () => {
      const input = {
        foodItemId: 1,
        description: 12345,
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount)
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    // weightG error tests
    test("throws DiaryEntryError if weightG is a negative integer", () => {
      const input = {
        foodItemId: 1,
        description: "protein intake",
        weightG: -1,
        nutrients: [{ nutrientId: 1, amount: 10 }], // (nutrientId, amount)
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    // nutrients array error tests
    test("throws DiaryEntryError if nutrients array contains a negative nutrientId value", () => {
      const input = {
        foodItemId: 1,
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: -10, amount: 10 }], // (nutrientId, amount)
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if nutrients array contains a zero nutrientId value", () => {
      const input = {
        foodItemId: 1,
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: 0, amount: 10 }], // (nutrientId, amount)
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if nutrients array contains a string nutrientId value", () => {
      const input = {
        foodItemId: 1,
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: "protein-id", amount: 10  }], // (nutrientId, amount)
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if nutrients array contains a null nutrientId value", () => {
      const input = {
        foodItemId: 1,
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: null, amount: 10 }], // (nutrientId, amount)
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if nutrients array contains a negative amount value", () => {
      const input = {
        foodItemId: 1,
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: -10 }], // (nutrientId, amount)
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if nutrients array contains a string amount value", () => {
      const input = {
        foodItemId: 1,
        description: "protein intake",
        weightG: 30,
        nutrients: [{ nutrientId: 1, amount: "30g protein" }], // (nutrientId, amount)
      };

      expect(() => validateCreateFoodPortionInput(input)).toThrow(DiaryEntryError);
    });
  });

  describe("validateUserIdForDashboard", () => {
    // "happy" path test
    test("returns normalised subscriberId for valid input", () => {
      const input = {
        subscriberId: 1,
      };

      const expected = {
        subscriberId: 1,
      };

      const result = validateUserIdForDashboard(input);

      expect(result).toEqual(expected);
    });
    // subscriberId error tests
    test("throws DiaryEntryError if subscriberId is missing", () => {
      const input = {};

      expect(() => validateUserIdForDashboard(input)).toThrow(DiaryEntryError);
    }); 
    test("throws DiaryEntryError if subscriberId is a negative integer", () => {
      const input = {
        subscriberId: -1,
      };

      expect(() => validateUserIdForDashboard(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if subscriberId is zero", () => {
      const input = {
        subscriberId: 0,
      };

      expect(() => validateUserIdForDashboard(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if subscriberId is a string", () => {
      const input = {
        subscriberId: "hello",
      };

      expect(() => validateUserIdForDashboard(input)).toThrow(DiaryEntryError);
    });
    test("throws DiaryEntryError if subscriberId is null", () => {
      const input = {
        subscriberId: null,
      };

      expect(() => validateUserIdForDashboard(input)).toThrow(DiaryEntryError);
    });
  });
});


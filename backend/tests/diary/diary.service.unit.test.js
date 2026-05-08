// tests/diary.service.unit.test.js
import { expect, jest } from "@jest/globals";
import { DiaryEntryError } from "../../src/modules/diary/diary.validator.js";

// Mock the module(s) that the diary service depends on
// const TEST_ID = 1;
const TEST_USERID = 2;
const TEST_ENTRYID = 3;
const TEST_ENTRYITEMID = 4;

const mockCheckDiaryEntryItemOwnership = jest.fn();
const mockValidateUpdatedEntryItem = jest.fn();
const mockUpdateDiaryEntryItem = jest.fn();
const mockValidateDeletedDiaryEntry = jest.fn();
const mockDeleteDiaryEntry = jest.fn();
const mockValidateDeletedDiaryEntryItem = jest.fn();
const mockDeleteDiaryEntryItem = jest.fn();
const mockValidateCreateDiaryEntryInput = jest.fn();
const mockValidateSummaryInput = jest.fn();
const mockValidateListDisplay = jest.fn();
const mockValidateNewEntryDetails = jest.fn();
const mockValidateEntryDetails = jest.fn();
const mockValidateUserIdForDashboard = jest.fn();
const mockValidateCreateFoodItemInput = jest.fn();
const mockValidateCreateFoodPortionInput = jest.fn();
const mockValidateCreateRecipeAsDiaryEntryItemInput = jest.fn();

const mockFetchSummaryData = jest.fn();
const mockInsertDiaryEntry = jest.fn();
const mockListDiaryEntries = jest.fn();
const mockFindDiaryEntryById = jest.fn();
const mockCreateDiaryEntryItem = jest.fn();
const mockCheckDiaryEntryOwnership = jest.fn();
const mockGetDaysLogged = jest.fn();
const mockInsertFoodItem = jest.fn();
const mockInsertFoodPortion = jest.fn();
const mockFetchWeeklyCalorieTrend = jest.fn();
const mockCheckExistingFoodItemByExternalId = jest.fn();
const mockFindRecipePortionForDiary = jest.fn();
const mockSearchFoodById = jest.fn();
const mockParseFoodResponse = jest.fn();
const mockEvaluateGoalsForToday = jest.fn();
const mockFetchGoals = jest.fn();
const mockListRecipesFromRepo = jest.fn();

jest.unstable_mockModule("../../src/modules/diary/diary.validator.js", () => ({
  DiaryEntryError: DiaryEntryError,
  validateCreateDiaryEntryInput: mockValidateCreateDiaryEntryInput,
  validateSummaryInput: mockValidateSummaryInput,
  validateListDisplay: mockValidateListDisplay,
  validateNewEntryDetails: mockValidateNewEntryDetails,
  validateUpdatedEntryItem: mockValidateUpdatedEntryItem,
  validateDeletedDiaryEntry: mockValidateDeletedDiaryEntry,
  validateEntryDetails: mockValidateEntryDetails,
  validateDeletedDiaryEntryItem: mockValidateDeletedDiaryEntryItem,
  validateUserIdForDashboard: mockValidateUserIdForDashboard,
  validateCreateFoodItemInput: mockValidateCreateFoodItemInput,
  validateCreateFoodPortionInput: mockValidateCreateFoodPortionInput,
  validateCreateRecipeAsDiaryEntryItemInput: mockValidateCreateRecipeAsDiaryEntryItemInput,
}));

jest.unstable_mockModule("../../src/modules/diary/diary.repository.js", () => ({
  fetchSummaryData: mockFetchSummaryData,
  insertDiaryEntry: mockInsertDiaryEntry,
  listDiaryEntries: mockListDiaryEntries,
  findDiaryEntryById: mockFindDiaryEntryById,
  createDiaryEntryItem: mockCreateDiaryEntryItem,
  checkDiaryEntryOwnership: mockCheckDiaryEntryOwnership,
  checkDiaryEntryItemOwnership: mockCheckDiaryEntryItemOwnership,
  updateDiaryEntryItem: mockUpdateDiaryEntryItem,
  deleteDiaryEntry: mockDeleteDiaryEntry,
  deleteDiaryEntryItem: mockDeleteDiaryEntryItem,
  getDaysLogged: mockGetDaysLogged,
  insertFoodItem: mockInsertFoodItem,
  insertFoodPortion: mockInsertFoodPortion,
  fetchWeeklyCalorieTrend: mockFetchWeeklyCalorieTrend,
  checkExistingFoodItemByExternalId: mockCheckExistingFoodItemByExternalId,
  findRecipePortionForDiary: mockFindRecipePortionForDiary,
}));

jest.unstable_mockModule("../../src/utils/searchFood.js", () => ({
  searchFoodById: mockSearchFoodById,
  parseFoodResponse: mockParseFoodResponse,
}));

jest.unstable_mockModule("../../src/modules/goals/goals.service.js", () => ({
  evaluateGoalsForToday: mockEvaluateGoalsForToday,
}));

jest.unstable_mockModule("../../src/modules/goals/goals.repository.js", () => ({
  fetchGoals: mockFetchGoals,
}));

jest.unstable_mockModule("../../src/modules/recipes/recipes.repository.js", () => ({
  listRecipes: mockListRecipesFromRepo,
}));

const {
  createDiaryEntry,
  getNutritionSummary,
  listDiaryEntries,
  getDiaryEntryById,
  createDiaryEntryItem,
  createRecipeAsDiaryEntryItemService,
  updateDiaryEntryItem,
  deleteExistingDiaryEntry,
  deleteExistingDiaryEntryItem,
  getDashboardDataForSubscriber,
} = await import("../../src/modules/diary/diary.service.js");

describe("Diary Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateSummaryInput.mockImplementation((input) => input);
    mockFetchSummaryData.mockResolvedValue([]);
  });

  describe("createDiaryEntry (unit)", () => {
    test("creates a diary entry when input is valid", async () => {
      const validatedInput = {
        subscriberId: TEST_USERID,
        consumedAt: new Date("2026-04-18"),
        mealType: "breakfast",
        notes: "test",
        items: [],
      };

      mockValidateCreateDiaryEntryInput.mockReturnValue(validatedInput);
      mockInsertDiaryEntry.mockResolvedValue({
        diaryEntryId: TEST_ENTRYID,
      });

      await createDiaryEntry({
        subscriberId: TEST_USERID,
        consumedAt: "2026-04-18",
        mealType: "breakfast",
        notes: "test",
        items: [],
      });

      expect(mockValidateCreateDiaryEntryInput).toHaveBeenCalled();
      expect(mockInsertDiaryEntry).toHaveBeenCalledWith(validatedInput);
      });
    test("creates a diary entry with items and returns the full entry from findDiaryEntryById", async () => {
      const validatedInput = {
        subscriberId: TEST_USERID,
        consumedAt: new Date("2026-04-18"),
        mealType: "lunch",
        notes: "entry with items",
        items: [
          { portionId: 11, quantity: 1.5, customFood: null, fatSecret: null },
          { portionId: 12, quantity: 2, customFood: null, fatSecret: null },
        ],
      };

      const fullEntry = {
        diaryEntryId: TEST_ENTRYID,
        subscriberId: TEST_USERID,
        items: [
          { diaryEntryItemId: 1001, portionId: 11, quantity: 1.5 },
          { diaryEntryItemId: 1002, portionId: 12, quantity: 2 },
        ],
      };

      mockValidateCreateDiaryEntryInput.mockReturnValue(validatedInput);
      mockInsertDiaryEntry.mockResolvedValue({
        diaryEntryId: TEST_ENTRYID,
      });
      mockValidateNewEntryDetails.mockImplementation((data) => data);
      mockCheckDiaryEntryOwnership.mockResolvedValue(true);
      mockCreateDiaryEntryItem
        .mockResolvedValueOnce({ diaryEntryItemId: 1001 })
        .mockResolvedValueOnce({ diaryEntryItemId: 1002 });
      mockFindDiaryEntryById.mockResolvedValue(fullEntry);

      const result = await createDiaryEntry({
        subscriberId: TEST_USERID,
        consumedAt: "2026-04-18",
        mealType: "lunch",
        notes: "entry with items",
        items: [
          { portionId: 11, quantity: 1.5, customFood: null, fatSecret: null },
          { portionId: 12, quantity: 2, customFood: null, fatSecret: null },
        ],
      });

      expect(mockInsertDiaryEntry).toHaveBeenCalledWith(validatedInput);
      expect(mockCreateDiaryEntryItem).toHaveBeenCalledTimes(2);
      expect(mockCreateDiaryEntryItem).toHaveBeenNthCalledWith(1, expect.objectContaining({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 11,
        quantity: 1.5,
      }));
      expect(mockCreateDiaryEntryItem).toHaveBeenNthCalledWith(2, expect.objectContaining({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 12,
        quantity: 2,
      }));
      expect(mockFindDiaryEntryById).toHaveBeenCalledWith({ diaryEntryId: TEST_ENTRYID, subscriberId: TEST_USERID });
      expect(result).toEqual(fullEntry);
    });
    test("throws DiaryEntryError when subscriberId is missing or invalid", async () => {
      mockValidateCreateDiaryEntryInput.mockImplementation(() => {
        throw new DiaryEntryError("Subscriber ID is required");
      });

      await expect(createDiaryEntry({
        subscriberId: null,
        consumedAt: "2026-04-18",
        mealType: "breakfast",
        notes: "test",
        items: [],
      })).rejects.toEqual(expect.objectContaining({
        message: "Subscriber ID is required",
      }));
    });
    test("throws DiaryEntryError when mealType is missing or invalid", async () => {
      mockValidateCreateDiaryEntryInput.mockImplementation(() => {
        throw new DiaryEntryError("Meal type is required");
      });

      await expect(createDiaryEntry({
        subscriberId: TEST_USERID,
        consumedAt: "2026-04-18",
        mealType: null,
        notes: "test",
        items: [],
      })).rejects.toEqual(expect.objectContaining({
        message: "Meal type is required",
      }));
    });
  });

  describe("getNutritionSummary (unit)", () => {
    test("returns summary when valid", async () => {
      const validatedInput = {
        subscriberId: TEST_USERID,
        period: "weekly",
        endDate: "2026-04-18",
      };

      mockValidateSummaryInput.mockReturnValue(validatedInput);
      mockFetchSummaryData.mockResolvedValue([]);

      const result = await getNutritionSummary({
        subscriberId: TEST_USERID,
        period: "weekly",
        endDate: "2026-04-18",
      });

      expect(mockValidateSummaryInput).toHaveBeenCalled();
      expect(mockFetchSummaryData).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
    test("returns aggregated and sorted nutrients for daily period with mixed quantity types", async () => {
      const validatedInput = {
        subscriberId: TEST_USERID,
        period: "daily",
        endDate: "2026-04-18",
      };

      mockValidateSummaryInput.mockReturnValue(validatedInput);
      mockFetchSummaryData.mockResolvedValue([{
        items: [
          {
            quantity: 2,
            portion: { portionNutrients: [{ nutrient: { nutrientId: 1, code: "protein" }, amount: 10 }] },
          },
          {
            quantity: "1.5",
            portion: { portionNutrients: [{ nutrient: { nutrientId: 2, code: "fat" }, amount: 5 }] },
          },
          {
            quantity: { toNumber: () => 3 },
            portion: { portionNutrients: [{ nutrient: { nutrientId: 3, code: "fibre" }, amount: 2 }] },
          },
        ],
      }]);


      const result = await getNutritionSummary({
        subscriberId: TEST_USERID,
        period: "daily",
        endDate: "2026-04-18",
      });

      expect(result.period).toBe("daily");
      expect(result.nutrients).toEqual([
        expect.objectContaining({ code: "protein", totalAmount: 20 }),
        expect.objectContaining({ code: "fat", totalAmount: 7.5 }),
        expect.objectContaining({ code: "fibre", totalAmount: 6 }),
      ]);
    });
    test("returns summary for monthly period", async () => {
      const validatedInput = {
        subscriberId: TEST_USERID,
        period: "monthly",
        endDate: "2026-04-18",
      };

      mockValidateSummaryInput.mockReturnValue(validatedInput);
      mockFetchSummaryData.mockResolvedValue([]);

      const result = await getNutritionSummary({
        subscriberId: TEST_USERID,
        period: "monthly",
        endDate: "2026-04-18",
      });

      expect(result.period).toBe("monthly");
      expect(result).toBeDefined();
    });
    test("throws error when period is unsupported", async () => {
      mockValidateSummaryInput.mockReturnValue({
        subscriberId: TEST_USERID,
        period: "yearly",
        endDate: "2026-04-18",
      });

      await expect(getNutritionSummary({
        subscriberId: TEST_USERID,
        period: "yearly",
        endDate: "2026-04-18",
      })).rejects.toEqual(expect.objectContaining({
        message: "Unsupported period: yearly",
      }));
    });
  });

  describe("listDiaryEntries (unit)", () => {
    test("returns a list of diary entries when input is valid", async () => {
      const validatedInput = {
        subscriberId: TEST_USERID,
      };

      const entries = [
        { diaryEntryId: 1 },
        { diaryEntryId: 2 },
      ];

      mockValidateListDisplay.mockReturnValue(validatedInput);
      mockListDiaryEntries.mockResolvedValue(entries);

      const result = await listDiaryEntries({
        subscriberId: TEST_USERID,
      });

      expect(mockValidateListDisplay).toHaveBeenCalled();
      expect(mockListDiaryEntries).toHaveBeenCalledWith(validatedInput);
      expect(result).toEqual(entries);
    });
    test("throws DiaryEntryError when subscriberId is missing or invalid", async () => {
      mockValidateListDisplay.mockImplementationOnce(() => { throw new Error("Invalid subscriberId"); });

      await expect(listDiaryEntries({
        subscriberId: null,
      })).rejects.toEqual(expect.objectContaining({
        message: "Invalid subscriberId",
      }));
    });
  });

  describe("getDiaryEntryById (unit)", () => {
    test("returns diary entry when it exists", async () => {
      const validatedInput = {
        subscriberId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
      };

      const entry = {
        diaryEntryId: TEST_ENTRYID,
      };

      mockValidateEntryDetails.mockReturnValue(validatedInput);
      mockFindDiaryEntryById.mockResolvedValue(entry);

      const result = await getDiaryEntryById({
        subscriberId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
      });

      expect(mockValidateEntryDetails).toHaveBeenCalled();
      expect(mockFindDiaryEntryById).toHaveBeenCalledWith(validatedInput);
      expect(result).toEqual(entry);
    });
    test("throws DiaryEntryError when subscriberId is missing or invalid", async () => {
      mockValidateEntryDetails.mockImplementationOnce(() => { throw new Error("Invalid subscriberId"); });

      await expect(getDiaryEntryById({
        subscriberId: null,
        diaryEntryId: TEST_ENTRYID,
      })).rejects.toEqual(expect.objectContaining({
        message: "Invalid subscriberId",
        }));
      });
    });

  describe("createDiaryEntryItem (unit)", () => {
    test("creates entry item when valid", async () => {
      const validatedInput = {
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        quantity: 10,
        portionId: 1,
      };

      mockValidateNewEntryDetails.mockReturnValue(validatedInput);
      mockCheckDiaryEntryOwnership.mockResolvedValue(true);
      mockCreateDiaryEntryItem.mockResolvedValue({
        diaryEntryItemId: TEST_ENTRYITEMID,
      });

      const result = await createDiaryEntryItem(validatedInput);

      expect(mockValidateNewEntryDetails).toHaveBeenCalled();
      expect(mockCreateDiaryEntryItem).toHaveBeenCalled();
      expect(result).toEqual({
        diaryEntryItemId: TEST_ENTRYITEMID,
      });
    });
    test("throws DiaryEntryError when portionId is missing and neither customFood nor fatSecret was provided", async () => {
      mockValidateNewEntryDetails.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        quantity: 1,
        portionId: null,
      });

      mockCheckDiaryEntryOwnership.mockResolvedValue(true);

      await expect(createDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        quantity: 1,
        portionId: null,
        customFood: null,
        fatSecret: null,
      })).rejects.toEqual(expect.objectContaining({
        message: "Must provide either portionId, customFood, or fatSecret",
      }));
    });
    test("creates entry item when portionId is missing but customFood was provided", async () => {
      const customFoodInput = {
        name: "Greek yoghurt",
        brand: "Test Brand",
        portions: [{
          description: "100g",
          weight_g: 100,
          nutrients: [{ nutrientId: 1, amount: 10 }],
        }],
      };

      mockValidateNewEntryDetails.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        quantity: 2,
        portionId: null,
      });
      mockCheckDiaryEntryOwnership.mockResolvedValue(true);
      mockValidateCreateFoodItemInput.mockImplementation((data) => data);
      mockInsertFoodItem.mockResolvedValue({ foodItemId: 101 });
      mockValidateCreateFoodPortionInput.mockImplementation((data) => data);
      mockInsertFoodPortion.mockResolvedValue({ portionId: 202 });
      mockCreateDiaryEntryItem.mockResolvedValue({ diaryEntryItemId: TEST_ENTRYITEMID });

      const result = await createDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        quantity: 2,
        portionId: null,
        customFood: customFoodInput,
        fatSecret: null,
      });

      expect(mockValidateCreateFoodItemInput).toHaveBeenCalled();
      expect(mockInsertFoodItem).toHaveBeenCalledWith(expect.objectContaining({
        name: "Greek yoghurt",
        source: "user",
      }));
      expect(mockInsertFoodPortion).toHaveBeenCalledWith(expect.objectContaining({
        foodItemId: 101,
        description: "100g",
      }));
      expect(mockCreateDiaryEntryItem).toHaveBeenCalledWith(expect.objectContaining({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        quantity: 2,
        portionId: 202,
      }));
      expect(result).toEqual({ diaryEntryItemId: TEST_ENTRYITEMID });
    });
    test("creates entry item when portionId is missing but fatSecret was provided and external food already exists", async () => {
      const fatSecretInput = { externalId: "fs_123" };
      const parsedFood = {
        name: "Apple",
        brand: "Generic",
        portions: [{
          description: "1 medium",
          weight_g: 182,
          nutrients: [{ nutrientId: 2, amount: 95 }],
        }],
      };

      mockValidateNewEntryDetails.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        quantity: 1,
        portionId: null,
      });
      mockCheckDiaryEntryOwnership.mockResolvedValue(true);
      mockSearchFoodById.mockResolvedValue({ ok: true });
      mockParseFoodResponse.mockReturnValue(parsedFood);
      mockValidateCreateFoodItemInput.mockImplementation((data) => data);
      mockCheckExistingFoodItemByExternalId.mockResolvedValue({ foodItemId: 303 });
      mockValidateCreateFoodPortionInput.mockImplementation((data) => data);
      mockInsertFoodPortion.mockResolvedValue({ portionId: 404 });
      mockCreateDiaryEntryItem.mockResolvedValue({ diaryEntryItemId: TEST_ENTRYITEMID });

      const result = await createDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        quantity: 1,
        portionId: null,
        customFood: null,
        fatSecret: fatSecretInput,
      });

      expect(mockSearchFoodById).toHaveBeenCalledWith("fs_123");
      expect(mockParseFoodResponse).toHaveBeenCalled();
      expect(mockCheckExistingFoodItemByExternalId).toHaveBeenCalledWith("fs_123");
      expect(mockInsertFoodItem).not.toHaveBeenCalled();
      expect(mockInsertFoodPortion).toHaveBeenCalledWith(expect.objectContaining({
        foodItemId: 303,
        description: "1 medium",
      }));
      expect(mockCreateDiaryEntryItem).toHaveBeenCalledWith(expect.objectContaining({
        portionId: 404,
      }));
      expect(result).toEqual({ diaryEntryItemId: TEST_ENTRYITEMID });
    });
    test("creates entry item when portionId is missing but fatSecret was provided and external food does not exist", async () => {
      const fatSecretInput = { externalId: "fs_999" };
      const parsedFood = {
        name: "Banana",
        brand: "Generic",
        portions: [{
          description: "1 banana",
          weight_g: 118,
          nutrients: [{ nutrientId: 3, amount: 105 }],
        }],
      };

      mockValidateNewEntryDetails.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        quantity: 3,
        portionId: null,
      });
      mockCheckDiaryEntryOwnership.mockResolvedValue(true);
      mockSearchFoodById.mockResolvedValue({ ok: true });
      mockParseFoodResponse.mockReturnValue(parsedFood);
      mockValidateCreateFoodItemInput.mockImplementation((data) => data);
      mockCheckExistingFoodItemByExternalId.mockResolvedValue(null);
      mockInsertFoodItem.mockResolvedValue({ foodItemId: 505 });
      mockValidateCreateFoodPortionInput.mockImplementation((data) => data);
      mockInsertFoodPortion.mockResolvedValue({ portionId: 606 });
      mockCreateDiaryEntryItem.mockResolvedValue({ diaryEntryItemId: TEST_ENTRYITEMID });

      const result = await createDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
        quantity: 3,
        portionId: null,
        customFood: null,
        fatSecret: fatSecretInput,
      });

      expect(mockCheckExistingFoodItemByExternalId).toHaveBeenCalledWith("fs_999");
      expect(mockInsertFoodItem).toHaveBeenCalledWith(expect.objectContaining({
        name: "Banana",
        source: "fatsecret",
        externalId: "fs_999",
      }));
      expect(mockInsertFoodPortion).toHaveBeenCalledWith(expect.objectContaining({
        foodItemId: 505,
        description: "1 banana",
      }));
      expect(mockCreateDiaryEntryItem).toHaveBeenCalledWith(expect.objectContaining({
        portionId: 606,
      }));
      expect(result).toEqual({ diaryEntryItemId: TEST_ENTRYITEMID });
    });
  });

  describe("Recipe to Diary Entry Item (unit)", () => {
    test("creates diary entry item from recipe portion when valid", async () => {
        const validatedInput = {
          userId: TEST_USERID,
          diaryEntryId: TEST_ENTRYID,
          recipeId: 123,
          servings: 2,
        };

        mockValidateCreateRecipeAsDiaryEntryItemInput.mockReturnValue(validatedInput);
        mockValidateNewEntryDetails.mockImplementation((data) => data);
        mockCheckDiaryEntryOwnership.mockResolvedValue(true);
        mockFindRecipePortionForDiary.mockResolvedValue({
          portions: [{ portionId: 1 }],
        });
        mockCreateDiaryEntryItem.mockResolvedValue({ diaryEntryItemId: TEST_ENTRYITEMID });

        const result = await createRecipeAsDiaryEntryItemService({
          userId: TEST_USERID,
          diaryEntryId: TEST_ENTRYID,
          recipeId: 123,
          servings: 2,
        });

        expect(mockValidateCreateRecipeAsDiaryEntryItemInput).toHaveBeenCalled();
        expect(mockFindRecipePortionForDiary).toHaveBeenCalledWith({ recipeId: 123 });
        expect(mockCreateDiaryEntryItem).toHaveBeenCalledWith(expect.objectContaining({
          userId: TEST_USERID,
          diaryEntryId: TEST_ENTRYID,
          portionId: 1,
          quantity: 2,
        }));
        expect(result).toEqual({ diaryEntryItemId: TEST_ENTRYITEMID });
    });
    test("throws DiaryEntryError when recipe portion is not found for the diary entry", async () => {
        mockValidateCreateRecipeAsDiaryEntryItemInput.mockReturnValue({
          userId: TEST_USERID,
          diaryEntryId: TEST_ENTRYID,
          recipeId: 999,
          servings: 2,
        });
        mockCheckDiaryEntryOwnership.mockResolvedValue(true);
        mockFindRecipePortionForDiary.mockResolvedValue(null);
        
        await expect(createRecipeAsDiaryEntryItemService({
          userId: TEST_USERID,
          diaryEntryId: TEST_ENTRYID,
          recipeId: 999,
          servings: 2,
        })).rejects.toEqual(expect.objectContaining({
          message: "Recipe portion not found for diary entry item"
        }));
    });
  });

  describe("updateDiaryEntryItem (unit)", () => {
    test("returns updated diary entry item when inputs are valid and diary entry item exists", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: undefined,
        quantity: undefined,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      // calls from diary repo. mock function
      mockUpdateDiaryEntryItem.mockResolvedValue({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: undefined,
        quantity: undefined,
      });

      // calls from the diary.service function
      const result = await updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
      });

      expect(result).toEqual({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: undefined,
        quantity: undefined,
      });
    });
    test("returns updated diary entry item when diary entry item exists, portionId was provided and all inputs are valid", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: 1,
        quantity: undefined,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockUpdateDiaryEntryItem.mockResolvedValue({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 1,
        quantity: undefined,
      });

      const result = await updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: 1,
      });

      expect(result).toEqual({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 1,
        quantity: undefined,
      });
    });
    test("returns updated diary entry item when diary entry item exists, quantity was provided and all inputs are valid", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: undefined,
        quantity: 30,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockUpdateDiaryEntryItem.mockResolvedValue({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: undefined,
        quantity: 30,
      });

      const result = await updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        quantity: 30,
      });

      expect(result).toEqual({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: undefined,
        quantity: 30,
      });
    });
    test("returns updated diary entry item when diary entry item exists, portionId and quantity was provided and all inputs are valid", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: 1,
        quantity: 30,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockUpdateDiaryEntryItem.mockResolvedValue({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 1,
        quantity: 30,
      });

      const result = await updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: 1,
        quantity: 30,
      });

      expect(result).toEqual({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 1,
        quantity: 30,
      });
    });
    test("throws DiaryEntryError when userId is missing or invalid", async () => {
      mockValidateUpdatedEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("User ID is required");
      });

      await expect(updateDiaryEntryItem({
        userId: null,
        diaryEntryItemId: TEST_ENTRYITEMID,
      })).rejects.toEqual(expect.objectContaining({
          message: "User ID is required"
      }));
    }); // test case covers both missing or invalid (i.e., invalid => userId might be entered as a string), which raises a DiaryEntryError. invalid counts under as missing userId
    test("throws DiaryEntryError when diaryEntryItemId is missing or invalid", async () => {
      mockValidateUpdatedEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("Diary Entry ID is required");
      });

      await expect(updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: null 
      })).rejects.toEqual(expect.objectContaining({
          message: "Diary Entry ID is required"
      }));
    }); // same logic as userId, but for diaryEntryItemId
    test("throws DiaryEntryError when portionId was provided, but value is invalid", async () => {
      mockValidateUpdatedEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("Portion ID is required");
      });

      await expect(updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: -1 
      })).rejects.toEqual(expect.objectContaining({
          message: "Portion ID is required"
      }));
    });
    test("throws DiaryEntryError when quantity was provided, but value is invalid", async () => {
      mockValidateUpdatedEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("Quantity is required and must be a positive number");
      });

      await expect(updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        quantity: -30, 
      })).rejects.toEqual(expect.objectContaining({
          message: "Quantity is required and must be a positive number"
      }));
    });
    test("throws DiaryEntryError when diary entry item does not belong to the user", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 5,
        portionId: undefined,
        quantity: undefined,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(false); // set to false, indicating that diary entry item does not belong to user

      await expect(updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: 5,
        portionId: undefined,
        quantity: undefined,
      })).rejects.toEqual(expect.objectContaining({
        message: "Unauthorised access"
      }));
    });
    test("throws DiaryEntryError when diary entry item does not exist", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
        portionId: undefined,
        quantity: undefined,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockUpdateDiaryEntryItem.mockResolvedValue(null); // null value due to P2025 error

      await expect(updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
        portionId: undefined,
        quantity: undefined,
      })).rejects.toEqual(expect.objectContaining({
        message: "Diary entry item is not found"
      }));
    });
  });

  describe("deleteExistingDiaryEntry (unit)", () => {
    test("returns deleted diary error object when inputs are valid and diary entry exists", async () => {
      mockValidateDeletedDiaryEntry.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
      });

      mockCheckDiaryEntryOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockDeleteDiaryEntry.mockResolvedValue({
        diaryEntryId: TEST_ENTRYID,
      });

      const result = await deleteExistingDiaryEntry({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
      });

      expect(result).toEqual({
        diaryEntryId: TEST_ENTRYID,
      });
    });
    test("throws DiaryEntryError when userId is missing or invalid", async () => {
      mockValidateDeletedDiaryEntry.mockImplementation(() => {
        throw new DiaryEntryError("User ID is required");
      });

      await expect(deleteExistingDiaryEntry({
        userId: null,
        diaryEntryId: TEST_ENTRYID,
      })).rejects.toEqual(expect.objectContaining({
          message: "User ID is required"
      }));
    });
    test("throws DiaryEntryError when diaryEntryId is missing or invalid", async () => {
      mockValidateDeletedDiaryEntry.mockImplementation(() => {
        throw new DiaryEntryError("Diary Entry ID is required");
      });

      await expect(deleteExistingDiaryEntry({
        userId: TEST_USERID,
        diaryEntryId: null 
      })).rejects.toEqual(expect.objectContaining({
          message: "Diary Entry ID is required"
      }));
    });
    test("throws DiaryEntryError when diary entry does not belong to the user", async () => {
      // validate entries
      mockValidateDeletedDiaryEntry.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: 5,
      });

      mockCheckDiaryEntryOwnership.mockResolvedValue(false); // set to false, indicating that diary entry item does not belong to user

      await expect(deleteExistingDiaryEntry({
        userId: TEST_USERID,
        diaryEntryId: 5,
      })).rejects.toEqual(expect.objectContaining({
        message: "Unauthorised access"
      }));
    });
    test("throws DiaryEntryError when diary entry does not exist", async () => {
      mockValidateDeletedDiaryEntry.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: 10, // using 10 as diaryEntryId not existing
      });

      mockCheckDiaryEntryOwnership.mockResolvedValue(true);
      mockDeleteDiaryEntry.mockResolvedValue(null); // null value due to P2025 error

      await expect(deleteExistingDiaryEntry({
        userId: TEST_USERID,
        diaryEntryId: 10,
      })).rejects.toEqual(expect.objectContaining({
        message: "Diary entry is not found"
      }));
    });
  });

  describe("deleteExistingDiaryEntryItem (unit)", () => {
    test("deletes an existing diary entry item when inputs are valid and diary entry item exists", async () => {
      mockValidateDeletedDiaryEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockDeleteDiaryEntryItem.mockResolvedValue({
        diaryEntryItemId: TEST_ENTRYITEMID,
      });

      const result = await deleteExistingDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
      });

      expect(result).toEqual({
        diaryEntryItemId: TEST_ENTRYITEMID,
      });
    });
    test("throws DiaryEntryError when userId is missing or invalid", async () => {
      mockValidateDeletedDiaryEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("User ID is required");
      });

      await expect(deleteExistingDiaryEntryItem({
        userId: null,
        diaryEntryItemId: TEST_ENTRYITEMID
      })).rejects.toEqual(expect.objectContaining({
          message: "User ID is required"
      }));
    });
    test("throws DiaryEntryError when diaryEntryId is missing or invalid", async () => {
      mockValidateDeletedDiaryEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("Diary Entry Item ID is required");
      });

      await expect(deleteExistingDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: null 
      })).rejects.toEqual(expect.objectContaining({
          message: "Diary Entry Item ID is required"
      }));
    });
    test("throws DiaryEntryError when diary entry item does not belong to the user", async () => {
      mockValidateDeletedDiaryEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 5,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(false); // set to false, indicating that diary entry item does not belong to user

      await expect(deleteExistingDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: 5,
      })).rejects.toEqual(expect.objectContaining({
        message: "Unauthorised access"
      }));
    });
    test("throws DiaryEntryError when diary entry item does not exist", async () => {
      mockValidateDeletedDiaryEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockDeleteDiaryEntryItem.mockResolvedValue(null); // null value due to P2025 error

      await expect(deleteExistingDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
      })).rejects.toEqual(expect.objectContaining({
        message: "Diary entry item is not found"
      }));
    });
  });

  describe("getDashboardDataForSubscriber (unit)", () => {
    const nutrient = (code, amount, nutrientId) => ({
      items: [{
        quantity: 1,
        portion: {
          portionNutrients: [{
            amount,
            nutrient: { nutrientId, code, name: code, unit: "g", type: "macro" },
          }],
        },
      }],
    });

    test("returns dashboard data when valid", async () => {
      const validatedInput = {
        subscriberId: TEST_USERID,
        period: "weekly",
        endDate: "2026-04-18",
      };

      mockValidateUserIdForDashboard.mockReturnValue(validatedInput);
      mockValidateSummaryInput.mockReturnValue({
        subscriberId: TEST_USERID,
        period: "daily",
        endDate: "2026-04-18",
      });
      mockGetDaysLogged.mockResolvedValue(5);
      mockFetchWeeklyCalorieTrend.mockResolvedValue([
        { date: "2026-04-13", calories: 100 },
        { date: "2026-04-14", calories: 200 },
      ]);
      mockFetchSummaryData.mockResolvedValue([]);

      const result = await getDashboardDataForSubscriber({
        subscriberId: TEST_USERID,
        period: "weekly",
        endDate: "2026-04-18",
      });

      expect(mockValidateUserIdForDashboard).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
    test("returns weekly trend with seven days and fills missing days with zero calories", async () => {
      const validatedInput = {
        subscriberId: TEST_USERID,
      };

      mockValidateUserIdForDashboard.mockReturnValue(validatedInput);
      mockValidateSummaryInput.mockReturnValue({
        subscriberId: TEST_USERID,
        period: "daily",
        endDate: "2026-04-18",
      });
      mockGetDaysLogged.mockResolvedValue(2);
      mockFetchSummaryData.mockResolvedValue([
        { items: [] },
      ]);
      mockListDiaryEntries.mockResolvedValue([{ diaryEntryId: 1 }]);
      mockFetchWeeklyCalorieTrend.mockResolvedValue([
        { date: "2026-04-14T00:00:00.000Z", calories: 200 },
        { date: "2026-04-16T00:00:00.000Z", calories: 350 },
      ]);

      const result = await getDashboardDataForSubscriber({
        subscriberId: TEST_USERID,
      });

      expect(result.weeklyCaloryTrend).toHaveLength(7);
      expect(result.weeklyCaloryTrend.some((d) => d.calories === 0)).toBe(true);
    });
    test("throws error when weekly calorie trend contains invalid date values", async () => {
      const validatedInput = {
        subscriberId: TEST_USERID,
      };

      mockValidateUserIdForDashboard.mockReturnValue(validatedInput);
      mockValidateSummaryInput.mockReturnValue({
        subscriberId: TEST_USERID,
        period: "daily",
        endDate: "2026-04-18",
      });
      mockGetDaysLogged.mockResolvedValue(0);
      mockFetchSummaryData.mockResolvedValue([
        { items: [] },
      ]);
      mockListDiaryEntries.mockResolvedValue([]);
      mockFetchWeeklyCalorieTrend.mockResolvedValue([
        { date: 12345, calories: 150 },
      ]);

      await expect(getDashboardDataForSubscriber({
        subscriberId: TEST_USERID,
      })).rejects.toEqual(expect.objectContaining({
        message: "Invalid date value: 12345",
      }));
    });

    test("scores recipes using protein, carbohydrates and fat together", async () => {
      mockValidateUserIdForDashboard.mockReturnValue({ subscriberId: TEST_USERID });
      mockValidateSummaryInput.mockImplementation((input) => input);
      mockGetDaysLogged.mockResolvedValue(1);
      mockFetchWeeklyCalorieTrend.mockResolvedValue([]);
      mockListDiaryEntries.mockResolvedValue([]);
      mockFetchSummaryData.mockResolvedValue([]);
      mockFetchGoals.mockResolvedValue([
        { nutrient: { code: "calories" }, targetMax: 2000, targetMin: null },
        { nutrient: { code: "protein" }, targetMin: 30, targetMax: null },
        { nutrient: { code: "carbohydrates" }, targetMin: 40, targetMax: null },
        { nutrient: { code: "fat" }, targetMin: 20, targetMax: null },
      ]);
      mockListRecipesFromRepo
        .mockResolvedValueOnce([]) 
        .mockResolvedValueOnce([
          { recipeId: 1, title: "High Protein Only", kcal: 450, protein: 30, carbs: 5, fat: 5, fibre: 0, sugars: 0, salt: 0, cuisine: "A", category: "A" },
          { recipeId: 2, title: "Balanced Macros", kcal: 450, protein: 20, carbs: 30, fat: 15, fibre: 0, sugars: 0, salt: 0, cuisine: "B", category: "B" },
        ]);

      const result = await getDashboardDataForSubscriber({ subscriberId: TEST_USERID });
      expect(result.recommendedRecipes[0].recipeId).toBe(2);
    });

    test("does not award protein score when no protein is needed", async () => {
      mockValidateUserIdForDashboard.mockReturnValue({ subscriberId: TEST_USERID });
      mockValidateSummaryInput.mockImplementation((input) => input);
      mockGetDaysLogged.mockResolvedValue(1);
      mockFetchWeeklyCalorieTrend.mockResolvedValue([]);
      mockListDiaryEntries.mockResolvedValue([]);
      mockFetchSummaryData.mockResolvedValue([
        nutrient("protein", 50, 1), // already reached goal
        nutrient("calories", 300, 2),
      ]);
      mockFetchGoals.mockResolvedValue([
        { nutrient: { code: "calories" }, targetMax: 2000, targetMin: null },
        { nutrient: { code: "protein" }, targetMin: 50, targetMax: null },
      ]);
      mockListRecipesFromRepo
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { recipeId: 10, title: "Very High Protein", kcal: 400, protein: 60, carbs: 20, fat: 10, fibre: 0, sugars: 0, salt: 0, cuisine: "X", category: "X" },
          { recipeId: 11, title: "Low Protein", kcal: 400, protein: 5, carbs: 20, fat: 10, fibre: 0, sugars: 0, salt: 0, cuisine: "Y", category: "Y" },
        ]);

      const result = await getDashboardDataForSubscriber({ subscriberId: TEST_USERID });
      const highProtein = result.recommendedRecipes.find((r) => r.recipeId === 10);
      const lowProtein = result.recommendedRecipes.find((r) => r.recipeId === 11);
      expect(highProtein.score).toBe(lowProtein.score);
    });
  });
});

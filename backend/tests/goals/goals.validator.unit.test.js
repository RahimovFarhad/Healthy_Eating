import {
  GoalError,
  getGoalErrorStatus,
  normalizeSubscriberId,
  normalizeGoalId,
  normalizeBooleanQuery,
  normalizeGoalIncludeQuery,
  validateUpdateGoalInput,
  validateCreateGoalInput,
} from "../../src/modules/goals/goals.validator.js";

describe("Goals Validator (unit)", () => {
  describe("getGoalErrorStatus", () => {
    test("returns 403 for unauthorized messages", () => {
      expect(getGoalErrorStatus("Unauthorized access")).toBe(403);
    });

    test("returns 404 for not found messages", () => {
      expect(getGoalErrorStatus("Goal not found")).toBe(404);
    });

    test("returns 409 for archived conflict messages", () => {
      expect(getGoalErrorStatus("Goal is already archived")).toBe(409);
      expect(getGoalErrorStatus("Goal is archived")).toBe(409);
    });

    test("returns 400 for other messages", () => {
      expect(getGoalErrorStatus("Bad payload")).toBe(400);
    });
  });

  describe("validateUpdateGoalInput", () => {
    test("throws when payload is not a single object", () => {
      expect(() => validateUpdateGoalInput(null)).toThrow("goal must be a single goal object");
      expect(() => validateUpdateGoalInput([])).toThrow("goal must be a single goal object");
    });

    test("throws when goalId is invalid", () => {
      expect(() => validateUpdateGoalInput({ goalId: "abc", notes: "x" })).toThrow(
        "goalId is required and must be a positive integer"
      );
    });

    test("throws for invalid numeric bounds and ordering", () => {
      expect(() => validateUpdateGoalInput({ goalId: 1, targetMin: -1 })).toThrow(
        "targetMin must be a non-negative number"
      );
      expect(() => validateUpdateGoalInput({ goalId: 1, targetMax: "x" })).toThrow(
        "targetMax must be a non-negative number"
      );
      expect(() => validateUpdateGoalInput({ goalId: 1, targetMin: 20, targetMax: 10 })).toThrow(
        "targetMin must be less than or equal to targetMax"
      );
    });

    test("throws for invalid status/source/setByProfessionalId/date combinations", () => {
      expect(() => validateUpdateGoalInput({ goalId: 1, status: "paused" })).toThrow(
        "status must be one of: active, archived"
      );
      expect(() => validateUpdateGoalInput({ goalId: 1, source: "manual" })).toThrow(
        "source must be one of: system_default, user_defined, professional_defined"
      );
      expect(() => validateUpdateGoalInput({ goalId: 1, setByProfessionalId: "NaN" })).toThrow(
        "setByProfessionalId must be a positive integer"
      );
      expect(
        () => validateUpdateGoalInput({ goalId: 1, startDate: "2026-05-10", endDate: "2026-05-01" })
      ).toThrow("endDate must be on or after startDate");
    });

    test("throws when no updatable fields are provided", () => {
      expect(() => validateUpdateGoalInput({ goalId: 1 })).toThrow(
        "At least one field must be provided to update"
      );
    });

    test("returns normalized update payload when all fields are valid", () => {
      const result = validateUpdateGoalInput({
        goalId: "3",
        targetMin: "10.5",
        targetMax: 20,
        status: "active",
        startDate: "2026-05-01T12:45:00.000Z",
        endDate: "2026-05-20",
        notes: 123,
        source: "user_defined",
        setByProfessionalId: "9",
      });

      expect(result.goalId).toBe(3);
      expect(result.data.targetMin).toBe(10.5);
      expect(result.data.targetMax).toBe(20);
      expect(result.data.status).toBe("active");
      expect(result.data.source).toBe("user_defined");
      expect(result.data.setByProfessionalId).toBe(9);
      expect(result.data.notes).toBe("123");
      expect(result.data.startDate).toBeInstanceOf(Date);
      expect(result.data.endDate).toBeInstanceOf(Date);
    });
  });

  describe("validateCreateGoalInput", () => {
    test("throws for missing goal or blank notes", () => {
      expect(() => validateCreateGoalInput(null)).toThrow("goal is required");
      expect(() => validateCreateGoalInput({ notes: "   " })).toThrow("goal.notes is required");
    });

    test("throws for invalid create input numeric/date/source/status branches", () => {
      expect(() => validateCreateGoalInput({ notes: "x", startDate: "2026-05-10", endDate: "2026-05-01" })).toThrow(
        "endDate must be on or after startDate"
      );
      expect(() => validateCreateGoalInput({ notes: "x", nutrientId: "bad" })).toThrow(
        "nutrientId must be a positive integer"
      );
      expect(() => validateCreateGoalInput({ notes: "x", targetMin: -1 })).toThrow(
        "targetMin must be a non-negative number"
      );
      expect(() => validateCreateGoalInput({ notes: "x", targetMax: -1 })).toThrow(
        "targetMax must be a non-negative number"
      );
      expect(() => validateCreateGoalInput({ notes: "x", targetMin: 10, targetMax: 2 })).toThrow(
        "targetMin must be less than or equal to targetMax"
      );
      expect(() => validateCreateGoalInput({ notes: "x" }, { forcedSource: "manual" })).toThrow(
        "forcedSource must be one of: system_default, user_defined, professional_defined"
      );
      expect(() => validateCreateGoalInput({ notes: "x", source: "manual" })).toThrow(
        "source must be one of: system_default, user_defined, professional_defined"
      );
      expect(() => validateCreateGoalInput({ notes: "x" }, { forcedStatus: "paused" })).toThrow(
        "forcedStatus must be one of: active, archived"
      );
      expect(() => validateCreateGoalInput({ notes: "x" }, { forcedSetByProfessionalId: "non-numeric" })).toThrow(
        "setByProfessionalId must be a positive integer"
      );
      expect(() =>
        validateCreateGoalInput({ notes: "x", source: "professional_defined" })
      ).toThrow("setByProfessionalId is required for professional_defined goals");
      expect(() =>
        validateCreateGoalInput({ notes: "x", setByProfessionalId: "invalid" })
      ).toThrow("setByProfessionalId must be a positive integer");
    });

    test("returns normalized payload with professional source and setter when all fields are valid", () => {
      const result = validateCreateGoalInput(
        {
          notes: "  lower sugar  ",
          nutrientId: "4",
          targetMin: "1",
          targetMax: "5",
          source: "professional_defined",
          setByProfessionalId: "11",
          startDate: "2026-05-02",
          endDate: "2026-06-02",
        },
        { forcedStatus: "archived" }
      );

      expect(result).toMatchObject({
        nutrientCode: null,
        nutrientId: 4,
        targetMin: 1,
        targetMax: 5,
        source: "professional_defined",
        status: "active",
        setByProfessionalId: 11,
        notes: "lower sugar",
      });
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });
  });
});

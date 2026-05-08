import { expect, jest } from "@jest/globals";
import { GoalError } from "../../src/modules/goals/goals.validator.js";

// Mocks
const TEST_USERID = 1;
const TEST_USERID_FAIL = "bad_userId";
const TEST_OTHER_USERID = 4;
const TEST_GOALID = 2;
const TEST_GOALID_FAIL = "bad_goalId";
const TEST_CHECKINID = 10;
const TEST_SETBYPROFESSIONALID = 3;

// goals.validation
const mockNormalizeSubscriberId = jest.fn();
const mockNormalizeGoalId = jest.fn();
const mockNormalizeBooleanQuery = jest.fn();
const mockNormalizeGoalIncludeQuery = jest.fn();
const mockValidateUpdateGoalInput = jest.fn();
const mockValidateCreateGoalInput = jest.fn();

// goals.repository
const mockFetchGoals = jest.fn();
const mockFindNutrientById = jest.fn();
const mockFindNutrientByCode = jest.fn();
const mockFindGoalByIdForSubscriber = jest.fn();
const mockArchiveGoal = jest.fn();
const mockUpdateGoal = jest.fn();
const mockInsertGoal = jest.fn();
const mockFindGuidelinesByDemographic = jest.fn();
const mockCreateManyGoals = jest.fn();
const mockFindGoalCheckInByDate = jest.fn();
const mockCreateGoalCheckIn = jest.fn();
const mockUpdateGoalCheckIn = jest.fn();
const mockUpsertGoalCheckIn = jest.fn();
const mockArchiveGoalsForNutrient = jest.fn();
const mockListNutrients = jest.fn();

jest.unstable_mockModule("../../src/modules/goals/goals.validator.js", () => ({
    GoalError: GoalError,
    normalizeSubscriberId: mockNormalizeSubscriberId,
    normalizeGoalId: mockNormalizeGoalId,
    normalizeBooleanQuery: mockNormalizeBooleanQuery,
    normalizeGoalIncludeQuery: mockNormalizeGoalIncludeQuery,
    validateUpdateGoalInput: mockValidateUpdateGoalInput,
    validateCreateGoalInput: mockValidateCreateGoalInput,
}));

jest.unstable_mockModule("../../src/modules/goals/goals.repository.js", () => ({
    fetchGoals: mockFetchGoals,
    findNutrientById: mockFindNutrientById,
    findNutrientByCode: mockFindNutrientByCode,
    findGoalByIdForSubscriber: mockFindGoalByIdForSubscriber,
    archiveGoal: mockArchiveGoal,
    updateGoal: mockUpdateGoal,
    insertGoal: mockInsertGoal,
    findGuidelinesByDemographic: mockFindGuidelinesByDemographic,
    createManyGoals: mockCreateManyGoals,
    findGoalCheckInByDate: mockFindGoalCheckInByDate,
    createGoalCheckIn: mockCreateGoalCheckIn,
    updateGoalCheckIn: mockUpdateGoalCheckIn,
    upsertGoalCheckIn: mockUpsertGoalCheckIn,
    archiveGoalsForNutrient: mockArchiveGoalsForNutrient,
    listNutrients: mockListNutrients,
}));

const {
    getGoalsService,
    updateUserGoal,
    archiveUserGoal,
    createUserGoal,
    createGoalForSubscriber,
    ensureDefaultGoalsForUser,
    toggleGoalDoneForToday,
    evaluateGoalsForToday,
} = await import("../../src/modules/goals/goals.service.js");

describe("Goals service", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockNormalizeSubscriberId.mockImplementation((id) => id);
        mockNormalizeGoalId.mockImplementation((id) => Number(id));
        mockNormalizeBooleanQuery.mockImplementation((value, defaultValue) => value === undefined ? defaultValue : value);
        mockNormalizeGoalIncludeQuery.mockImplementation((value, defaultValue) => value === undefined ? defaultValue : value);
    });

    describe("getGoalsService (unit)", () => {
        test("gets goals when input is valid", async() => {
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockNormalizeBooleanQuery.mockReturnValue(true);
            mockNormalizeGoalIncludeQuery.mockReturnValue("today");
            const goals = [{
                goalId: TEST_GOALID
            }];
            mockFetchGoals.mockResolvedValue(goals);

            const result = await getGoalsService({
                subscriberId: TEST_USERID,
                effective: "true",
                include: "today"
            });

            expect(mockNormalizeSubscriberId).toHaveBeenCalledWith(TEST_USERID);
            expect(mockNormalizeBooleanQuery).toHaveBeenCalledWith("true", true);
            expect(mockNormalizeGoalIncludeQuery).toHaveBeenCalledWith("today", "none");
            expect(mockFetchGoals).toHaveBeenCalledWith({
                subscriberId: TEST_USERID,
                effective: true,
                include: "today",
            });
            expect(result).toEqual(goals);
        });
        test("throws GoalError when subscriberId is missing or invalid", async () => {
            mockNormalizeSubscriberId.mockImplementation(() => {
                throw new GoalError("Subscriber ID is required");
            });

            await expect(getGoalsService({ 
                subscriberId: TEST_USERID_FAIL,
                effective: true,
                include: "none"
            })).rejects.toThrow("Subscriber ID is required");
        });
        test("throws GoalError when effective is invalid", async () => {
            mockNormalizeSubscriberId.mockImplementation(() => {
                throw new GoalError("effective must be a boolean");
            });

            await expect(getGoalsService({ 
                subscriberId: TEST_USERID,
                effective: 123,
                include: "none"
            })).rejects.toThrow("effective must be a boolean");
        });
        test("throws GoalError when include is invalid", async () => {
            mockNormalizeSubscriberId.mockImplementation(() => {
                throw new GoalError("include must be one of: today, all");
            });

            await expect(getGoalsService({ 
                subscriberId: TEST_USERID,
                effective: true,
                include: "next year"
            })).rejects.toThrow("include must be one of: today, all");
        });
    });
    describe("updateUserGoal (unit)", () => {
        test("updates goal when goal exists", async () => {
            const validatedUpdate = {
                goalId: TEST_GOALID,
                data: {
                    notes: "updated"
                },
            };
            const existingGoal = {
                goalId: TEST_GOALID,
                status: "active",
                subscriber: {
                    userId: TEST_USERID
                }
            };
            const updatedGoal = {
                goalId: TEST_GOALID, 
                notes: "updated"
            };

            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockValidateUpdateGoalInput.mockReturnValue(validatedUpdate);
            mockFindGoalByIdForSubscriber.mockResolvedValue(existingGoal);
            mockUpdateGoal.mockResolvedValue(updatedGoal);

            const result = await updateUserGoal({
                subscriberId: TEST_USERID,
                goal: {
                    goalId: TEST_GOALID,
                    notes: "updated"
                },
            });

            expect(mockFindGoalByIdForSubscriber).toHaveBeenCalledWith({
                subscriberId: TEST_USERID,
                goalId: TEST_GOALID,
            });
            expect(mockUpdateGoal).toHaveBeenCalledWith({
                goalId: TEST_GOALID,
                data: { notes: "updated" },
            });
            expect(result).toEqual(updatedGoal);
        });
        test("throws GoalError when subscriberId is missing or invalid", async () => {
            mockNormalizeSubscriberId.mockImplementation(() => {
                throw new GoalError("Subscriber ID is required");
            });

            await expect(updateUserGoal({ 
                subscriberId: TEST_USERID_FAIL,
                goal: {}
            })).rejects.toThrow("Subscriber ID is required");
        });
        test("throws GoalError when goal doesn't exist", async () => {
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockValidateUpdateGoalInput.mockReturnValue({
                goalId: TEST_GOALID_FAIL,
                data: {
                    notes: "updated"
                }
            });
            mockFindGoalByIdForSubscriber.mockResolvedValue(null);

            await expect(updateUserGoal({ 
                subscriberId: TEST_USERID,
                goal: {
                    goalId: TEST_GOALID_FAIL,
                    notes: "updated"
                }
            })).rejects.toThrow("Goal not found");
        });
        test("throws GoalError when goal is archived", async () => {
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockValidateUpdateGoalInput.mockReturnValue({
                goalId: TEST_GOALID,
                data: {
                    notes: "updated"
                }
            });
            mockFindGoalByIdForSubscriber.mockResolvedValue({
                goalId: TEST_GOALID,
                status: "archived",
                subscriber: {
                    userId: TEST_USERID
                }
            });

            await expect(updateUserGoal({ 
                subscriberId: TEST_USERID,
                goal: {
                    goalId: TEST_GOALID,
                    notes: "updated"
                }
            })).rejects.toThrow("Goal is archived");
        });
        test("throws GoalError when goal doesn't belong to user", async () => {
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockValidateUpdateGoalInput.mockReturnValue({
                goalId: TEST_GOALID,
                data: {
                    notes: "updated"
                }
            });
            mockFindGoalByIdForSubscriber.mockResolvedValue({
                goalId: TEST_GOALID,
                status: "active",
                subscriber: {
                    userId: TEST_OTHER_USERID
                }
            });

            await expect(updateUserGoal({ 
                subscriberId: TEST_USERID,
                goal: {
                    goalId: TEST_GOALID,
                    notes: "updated"
                }
            })).rejects.toThrow("Unauthorized to archive this goal");
        });
    });
    describe("archiveUserGoal (unit)", () => {
        test("archives goal when goal is valid and active", async () => {
            const existingGoal = {
                goalId: TEST_GOALID,
                status: "active",
                subscriber: {
                    userId: TEST_USERID
                },
            };
            const archived = {
                goalId: TEST_GOALID,
                status: "archived"
            };

            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockNormalizeGoalId.mockReturnValue(TEST_GOALID);
            mockFindGoalByIdForSubscriber.mockResolvedValue(existingGoal);
            mockArchiveGoal.mockResolvedValue(archived);

            const result = await archiveUserGoal({
                subscriberId: TEST_USERID,
                goalId: TEST_GOALID,
            });

            expect(mockFindGoalByIdForSubscriber).toHaveBeenCalledWith({
                subscriberId: TEST_USERID,
                goalId: TEST_GOALID,
            });
            expect(mockArchiveGoal).toHaveBeenCalled();
            expect(result).toEqual(archived);
        });
        test("throws GoalError when subscriberId is missing or invalid", async () => {
            mockNormalizeSubscriberId.mockImplementation(() => {
                throw new GoalError("Subscriber ID is required");
            });

            await expect(archiveUserGoal({ 
                subscriberId: TEST_USERID_FAIL,
                goalId: TEST_GOALID
            })).rejects.toThrow("Subscriber ID is required");
        });
        test("throws GoalError when goal doesn't exist", async () => {
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockNormalizeGoalId.mockReturnValue(TEST_GOALID_FAIL)
            mockFindGoalByIdForSubscriber.mockResolvedValue(null);

            await expect(archiveUserGoal({ 
                subscriberId: TEST_USERID,
                goalId: TEST_GOALID_FAIL
            })).rejects.toThrow("Goal not found");
        });
        test("throws GoalError when goal is already archived", async () => {
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockNormalizeGoalId.mockReturnValue(TEST_GOALID)
            mockFindGoalByIdForSubscriber.mockResolvedValue({
                goalId: TEST_GOALID,
                status: "archived",
                subscriber: {
                    userId: TEST_USERID
                }
            });

            await expect(archiveUserGoal({ 
                subscriberId: TEST_USERID,
                goalId: TEST_GOALID
            })).rejects.toThrow("Goal is already archived");
        });
        test("throws GoalError when goal doesn't belong to user", async () => {
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockNormalizeGoalId.mockReturnValue(TEST_GOALID)
            mockFindGoalByIdForSubscriber.mockResolvedValue({
                goalId: TEST_GOALID,
                status: "active",
                subscriber: {
                    userId: TEST_OTHER_USERID
                }
            });

            await expect(archiveUserGoal({ 
                subscriberId: TEST_USERID,
                goalId: TEST_GOALID
            })).rejects.toThrow("Unauthorized to archive this goal");
        });
    });
    describe("createUserGoal (unit)", () => {
        test("creates forced user-defined goal options", async () => {
            const validatedGoal = {
                source: "user_defined",
                setByProfessionalId: null,
                startDate: "2026-04-18",
                endDate: null,
                notes: "eat more fiber"
            };
            const created = {
                goalId: TEST_GOALID,
                ...validatedGoal
            };

            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockValidateCreateGoalInput.mockReturnValue(validatedGoal);
            mockInsertGoal.mockResolvedValue(created);

            const result = await createUserGoal({
                subscriberId: TEST_USERID,
                goal: {
                    notes: "eat more fiber",
                    source: "professional_defined"
                }
            });

            expect(mockValidateCreateGoalInput).toHaveBeenCalledWith({ 
                notes: "eat more fiber",
                source: "professional_defined" 
            },
            {
                forcedSource: "user_defined",
                forcedStatus: "active",
                forcedSetByProfessionalId: null,
            }
            );
            expect(mockInsertGoal).toHaveBeenCalledWith(
                expect.objectContaining({
                subscriberId: TEST_USERID,
                source: "user_defined",
                status: "active",
                })
            );
            expect(result).toEqual(created);
        });
    });
    describe("createGoalForSubscriber (unit)", () => {
        test("validates inputs and inserts the new goal", async () => {
            const startDate = "2026-04-18";
            const validatedGoal = {
                source: "professional_defined",
                setByProfessionalId: TEST_SETBYPROFESSIONALID,
                startDate,
                endDate: null,
                notes: "30g protein target" 
            };
            const created = {
                goalId: TEST_GOALID,
                notes: "30g protein target"
            };

            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockValidateCreateGoalInput.mockReturnValue(validatedGoal);
            mockInsertGoal.mockResolvedValue(created);

            const result = await createGoalForSubscriber({
                subscriberId: TEST_USERID,
                goal: {
                    notes: "30g protein target"
                },
                options: {
                    forcedSource: "professional_defined", forcedSetByProfessionalId: TEST_SETBYPROFESSIONALID
                },
            });

            expect(mockValidateCreateGoalInput).toHaveBeenCalled();
            expect(mockInsertGoal).toHaveBeenCalledWith({
                subscriberId: TEST_USERID,
                nutrientId: undefined,
                source: "professional_defined",
                status: "active",
                targetMin: undefined,
                targetMax: undefined,
                setByProfessionalId: TEST_SETBYPROFESSIONALID,
                startDate,
                endDate: null,
                notes: "30g protein target",
            });
            expect(result).toEqual(created)
        });
        test("throws GoalError when subscriberId is missing or invalid", async () => {
            const startDate = "2026-04-18";
            const validatedGoal = {
                source: "professional_defined",
                setByProfessionalId: TEST_SETBYPROFESSIONALID,
                startDate,
                endDate: null,
                notes: "30g protein target" 
            };
            mockNormalizeSubscriberId.mockImplementation(() => {
                throw new GoalError("Subscriber ID is required");
            });
            mockValidateCreateGoalInput.mockImplementation(() => {
                throw new GoalError("goal.notes is required");
            });
            mockInsertGoal.mockResolvedValue(null);

            await expect(createGoalForSubscriber({ 
                subscriberId: TEST_USERID_FAIL,
                nutrientId: null,
                source: "professional_defined",
                status: "active",
                targetMin: null,
                targetMax: null,
                setByProfessionalId: TEST_SETBYPROFESSIONALID,
                startDate,
                endDate: null,
                notes: "Protein target",
            })).rejects.toThrow("Subscriber ID is required");
        });
        test("throws GoalError when any goal input is invalid", async () => {
            const startDate = "2026-04-18";
            const validatedGoal = {
                source: "professional_defined",
                setByProfessionalId: TEST_SETBYPROFESSIONALID,
                startDate,
                endDate: null,
                notes: 1 // chosen error for this test
            }; // GoalError is thrown when any of the values in validatedGoal are not valid 
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockValidateCreateGoalInput.mockImplementation(() => {
                throw new GoalError("goal.notes is required");
            });
            mockInsertGoal.mockResolvedValue(null);

            await expect(createGoalForSubscriber({ 
                subscriberId: TEST_USERID,
                nutrientId: null,
                source: "professional_defined",
                status: "active",
                targetMin: null,
                targetMax: null,
                setByProfessionalId: TEST_SETBYPROFESSIONALID,
                startDate,
                endDate: null,
                notes: 1,
            })).rejects.toThrow("goal.notes is required");
        });
    });
    describe("ensureDefaultGoalsForUser (unit)", () => {
        test("creates default goals for user from guidelines", async () => {
            const guidelines = [
                { nutrientId: 1, minValue: 10, maxValue: 20},
                { nutrientId: 2, minValue: 5, maxValue: 15}
            ];

            mockFindGuidelinesByDemographic.mockResolvedValue(guidelines);
            mockCreateManyGoals.mockResolvedValue({ count: 2 });

            const tx = {
                id: "tx"
            };
            const result = await ensureDefaultGoalsForUser({
                userId: TEST_USERID,
                demographic: "adult",
                tx,
            });

            expect(mockFindGuidelinesByDemographic).toHaveBeenCalledWith("adult",tx);
            expect(mockCreateManyGoals).toHaveBeenCalledWith(
                expect.arrayContaining([
                expect.objectContaining({
                    subscriberId: TEST_USERID,
                    nutrientId: 1,
                    source: "system_default",
                    status: "active",
                    targetMin: 10,
                    targetMax: 20,
                    }),
                ]),
                tx
            );
            expect(result).toEqual({ count: 2 });
        });
        test("returns early when no guidelines found", async () => {
            mockFindGuidelinesByDemographic.mockResolvedValue([]);

            const result = await ensureDefaultGoalsForUser({
                userId: TEST_USERID,
                demographic: "adult",
                tx: undefined,
            });

            expect(mockCreateManyGoals).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });
    describe("toggleGoalDoneToday (unit)", () => {
        test("creates toggle check when none exists for today", async () => {
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockNormalizeGoalId.mockReturnValue(TEST_GOALID);
            mockFindGoalByIdForSubscriber.mockResolvedValue({
                goalId: TEST_GOALID,
                status: "active",
                startDate: null,
                endDate: null,
            });
            mockFindGoalCheckInByDate.mockResolvedValue(null);
            mockCreateGoalCheckIn.mockResolvedValue({
                checkInId: TEST_CHECKINID,
                goalId: TEST_GOALID,
                isDone: true,
            });

            const result = await toggleGoalDoneForToday({
                subscriberId: TEST_USERID,
                goalId: TEST_GOALID,
            });

            expect(mockFindGoalCheckInByDate).toHaveBeenCalledWith({
                goalId: TEST_GOALID,
                date: expect.any(Date),
            });
            expect(mockCreateGoalCheckIn).toHaveBeenCalledWith({
                goalId: TEST_GOALID,
                date: expect.any(Date),
                isDone: true,
            });
            expect(result).toEqual({
                checkInId: TEST_CHECKINID,
                goalId: TEST_GOALID,
                isDone: true,
            });
        });
        test("toggles check for existing goals", async () => {
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockNormalizeGoalId.mockReturnValue(TEST_GOALID);
            mockFindGoalByIdForSubscriber.mockResolvedValue({
                goalId: TEST_GOALID,
                status: "active",
                startDate: null,
                endDate: null,
            });
            mockFindGoalCheckInByDate.mockResolvedValue({
                checkInId: TEST_CHECKINID,
                isDone: true,
            });
            mockUpdateGoalCheckIn.mockResolvedValue({
                checkInId: TEST_CHECKINID,
                goalId: TEST_GOALID,
                isDone: false,
            });

            const result = await toggleGoalDoneForToday({
                subscriberId: TEST_USERID,
                goalId: TEST_GOALID,
            });

            expect(mockUpdateGoalCheckIn).toHaveBeenCalledWith({
                checkInId: TEST_CHECKINID,
                isDone: false,
            });
            expect(result).toEqual({
                checkInId: TEST_CHECKINID,
                goalId: TEST_GOALID,
                isDone: false,
            });
        });
        test("throws GoalError when goal is not found", async () => {
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockNormalizeGoalId.mockReturnValue(TEST_GOALID_FAIL);
            mockFindGoalByIdForSubscriber.mockResolvedValue(null);

            await expect(toggleGoalDoneForToday({
                subscriberId: TEST_USERID,
                goalId: TEST_GOALID_FAIL
            })).rejects.toThrow("Goal not found");
        });
        test("throws GoalError when goal is archived", async () => {
            mockNormalizeSubscriberId.mockReturnValue(TEST_USERID);
            mockNormalizeGoalId.mockReturnValue(TEST_GOALID);
            mockFindGoalByIdForSubscriber.mockResolvedValue({
                goalId: TEST_GOALID,
                status: "archived",
                startDate: null,
                endDate: null,
            });

            await expect(toggleGoalDoneForToday({
                subscriberId: TEST_USERID,
                goalId: TEST_GOALID
            })).rejects.toThrow("Goal is archived");
        });
    });
    describe("evaluateGoalsForToday (unit)", () => {
        test("upserts check-ins using min/max goal rules", async () => {
            mockFetchGoals.mockResolvedValue([
                { goalId: 1, nutrientId: 101, targetMin: 30, targetMax: null }, // met
                { goalId: 2, nutrientId: 102, targetMin: null, targetMax: 10 }, // not met
                { goalId: 3, nutrientId: 103, targetMin: 5, targetMax: 15 }, // met
            ]);

            await evaluateGoalsForToday({
                subscriberId: TEST_USERID,
                nutritionSummary: [
                    { nutrientId: 101, totalAmount: 35 },
                    { nutrientId: 102, totalAmount: 12 },
                    { nutrientId: 103, totalAmount: 10 },
                ],
            });

            expect(mockFetchGoals).toHaveBeenCalledWith({ subscriberId: TEST_USERID, effective: true });
            expect(mockUpsertGoalCheckIn).toHaveBeenCalledTimes(3);
            expect(mockUpsertGoalCheckIn).toHaveBeenNthCalledWith(1, expect.objectContaining({ goalId: 1, isDone: true }));
            expect(mockUpsertGoalCheckIn).toHaveBeenNthCalledWith(2, expect.objectContaining({ goalId: 2, isDone: false }));
            expect(mockUpsertGoalCheckIn).toHaveBeenNthCalledWith(3, expect.objectContaining({ goalId: 3, isDone: true }));
        });

        test("ignores goals without nutrientId", async () => {
            mockFetchGoals.mockResolvedValue([
                { goalId: 10, nutrientId: null, targetMin: null, targetMax: null },
            ]);

            await evaluateGoalsForToday({
                subscriberId: TEST_USERID,
                nutritionSummary: [{ nutrientId: 1, totalAmount: 100 }],
            });

            expect(mockUpsertGoalCheckIn).not.toHaveBeenCalled();
        });
    });
});

import { expect, jest } from "@jest/globals";
import { GoalError } from "../../src/modules/goals/goals.validator.js";

// mocks
const TEST_USERID = 1;
const TEST_USERID_FAIL = "bad_userId";
const TEST_GOALID = 2;
const TEST_GOALID_FAIL = "bad_goalId";
const TEST_CHECKINID = 10;

// client.service mock functions
const mockGetGoalsService = jest.fn();
const mockUpdateUserGoal = jest.fn();
const mockArchiveUserGoal = jest.fn();
const mockCreateUserGoal = jest.fn();
const mockToggleGoalDoneForToday = jest.fn();

jest.unstable_mockModule("../../src/modules/goals/goals.service.js", () => ({
    getGoalsService: mockGetGoalsService,
    updateUserGoal: mockUpdateUserGoal,
    archiveUserGoal: mockArchiveUserGoal,
    createUserGoal: mockCreateUserGoal, 
    toggleGoalDoneForToday: mockToggleGoalDoneForToday,
}));

const {
    getGoals,
    updateGoal,
    deleteGoal,
    createGoal,
    toggleGoalDone
} = await import ("../../src/modules/goals/goals.controller.js");

function createRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    
    return res;
}

describe("Goals Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getGoals", () => {
    test("Returns status code 200 and gets goals when successful", async () => {
      const req = {
        user: { 
          userId: TEST_USERID,
        },
        query: {
          effective: "true",
          include: "today"
        }
      };
      const res = createRes();
      const next = jest.fn();
      const goals = {
        goalId: TEST_GOALID
      };

      mockGetGoalsService.mockResolvedValue(goals);

      await getGoals(req,res,next);

      expect(mockGetGoalsService).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
        effective: req.query.effective,
        include: req.query.include
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ goals });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when subscriberId is missing", async () => {
      const req = {
        user: {
        },
        query: {
          effective: true,
          include: "none"
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockGetGoalsService.mockRejectedValue(new GoalError("Subscriber ID is required"));

      await getGoals(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Subscriber ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateGoal", () => {
    test("Returns status code 200 and updates goal when successful", async () => {
      const req = {
        user: { 
          userId: TEST_USERID,
        },
        body: {
          goal: {
            goalId: TEST_GOALID,
            notes: "updated"
          }
        }
      };
      const res = createRes();
      const next = jest.fn();
      const updateGoal = {
        goalId: TEST_GOALID,
        notes: "updated"
      };

      mockUpdateUserGoal.mockResolvedValue(updateGoal);

      await updateGoal(req,res,next);

      expect(mockUpdateUserGoal).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
        goal: req.body.goal
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ updateGoal });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when subscriberId is missing", async () => {
      const req = {
        user: { 
        },
        body: {
          goal: {
            goalId: TEST_GOALID,
            notes: "updated"
          }
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockUpdateUserGoal.mockRejectedValue(new GoalError("Subscriber ID is required"));

      await updateGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Subscriber ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when goal is missing", async () => {
      const req = {
        user: { 
          userId: TEST_USERID
        },
        body: {
          goal: {
          }
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockUpdateUserGoal.mockRejectedValue(new GoalError("goal is required"));

      await updateGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "goal is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 403 when goal doesn't belong to user", async () => {
      const req = {
        user: { 
          userId: TEST_USERID_FAIL
        },
        body: {
          goal: {
            goalId: TEST_GOALID,
            notes: "updated"
          }
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockUpdateUserGoal.mockRejectedValue(new GoalError("Unauthorized to archive this goal"));

      await updateGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized to archive this goal" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 404 when goal is not found", async () => {
      const req = {
        user: { 
          userId: TEST_USERID
        },
        body: {
          goal: {
            goalId: TEST_GOALID_FAIL,
            notes: "updated"
          }
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockUpdateUserGoal.mockRejectedValue(new GoalError("Goal not found"));

      await updateGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Goal not found" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 409 when goal is archived", async () => {
      const req = {
        user: { 
          userId: TEST_USERID
        },
        body: {
          goal: {
            goalId: TEST_GOALID_FAIL,
            notes: "updated"
          }
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockUpdateUserGoal.mockRejectedValue(new GoalError("Goal is archived"));

      await updateGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "Goal is archived" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("deleteGoal", () => {
    test("Returns status code 200 and deletes goal when successful", async () => {
      const req = {
        user: { 
          userId: TEST_USERID,
        },
        params: {
          goalId: TEST_GOALID,
          status: "active"
        }
      };
      const res = createRes();
      const next = jest.fn();
      const deleteGoal = {
        goalId: TEST_GOALID
      };

      mockArchiveUserGoal.mockResolvedValue(deleteGoal);

      await deleteGoal(req,res,next);

      expect(mockArchiveUserGoal).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
        goalId: TEST_GOALID
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ deleteGoal });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when subscriberId is missing", async () => {
      const req = {
        user: { 
        },
        params: {
          goalId: TEST_GOALID,
          status: "active"
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockArchiveUserGoal.mockRejectedValue(new GoalError("Subscriber ID is required"));

      await deleteGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Subscriber ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when goal is missing", async () => {
      const req = {
        user: { 
          userId: TEST_USERID
        },
        params: {
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockArchiveUserGoal.mockRejectedValue(new GoalError("goal is required"));

      await deleteGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "goal is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 403 when goal doesn't belong to user", async () => {
      const req = {
        user: { 
          userId: TEST_USERID_FAIL
        },
        params: {
          goalId: TEST_GOALID,
          status: "active"
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockArchiveUserGoal.mockRejectedValue(new GoalError("Unauthorized to archive this goal"));

      await deleteGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized to archive this goal" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 404 when goal is not found", async () => {
      const req = {
        user: { 
          userId: TEST_USERID
        },
        params: {
          goalId: TEST_GOALID_FAIL,
          status: "active"
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockArchiveUserGoal.mockRejectedValue(new GoalError("Goal not found"));

      await deleteGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Goal not found" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 409 when goal is already archived", async () => {
      const req = {
        user: { 
          userId: TEST_USERID
        },
        params: {
          goalId: TEST_GOALID,
          status: "archived"
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockArchiveUserGoal.mockRejectedValue(new GoalError("Goal is already archived"));

      await deleteGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "Goal is already archived" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("createGoal", () => {
    test("Returns status code 201 and creates a new goal when successful", async () => {
      const req = {
        user: { 
          userId: TEST_USERID,
        },
        body: {
          goal: {
            notes: "eat at least 10g of fiber",
            source: "user_defined"
          }
        }
      };
      const res = createRes();
      const next = jest.fn();
      const createGoal = {
        subscriberId: TEST_USERID,
        goal: req.body.goal
      };

      mockCreateUserGoal.mockResolvedValue(createGoal);

      await createGoal(req,res,next);

      expect(mockCreateUserGoal).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
        goal: req.body.goal
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ createGoal });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when subscriberId is missing", async () => {
      const req = {
        user: { 
        },
        body: {
          goal: {
            notes: "eat at least 10g of fiber",
            source: "user_defined"
          }
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateUserGoal.mockRejectedValue(new GoalError("Subscriber ID is required"));

      await createGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Subscriber ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when goal is missing", async () => {
      const req = {
        user: { 
          userId: TEST_USERID
        },
        body: {
          goal: {
          }
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateUserGoal.mockRejectedValue(new GoalError("goal.notes is required"));

      await createGoal(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "goal.notes is required" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("toggleGoalDone", () => {
    test("Returns status code 200 and checks off goal when successful", async () => {
      const req = {
        user: { 
          userId: TEST_USERID,
        },
        params: {
          goalId: TEST_USERID
        }
      };
      const res = createRes();
      const next = jest.fn();
      const checkOffGoal = {
        checkInId: TEST_CHECKINID,
        goalId: TEST_GOALID,
        isDone: true
      };

      mockToggleGoalDoneForToday.mockResolvedValue(checkOffGoal);

      await toggleGoalDone(req,res,next);

      expect(mockToggleGoalDoneForToday).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
        goalId: TEST_GOALID
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ checkOffGoal });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when subscriberId is missing", async () => {
      const req = {
        user: { 
        },
        params: {
          goalId: TEST_USERID
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockToggleGoalDoneForToday.mockRejectedValue(new GoalError("Subscriber ID is required"));

      await toggleGoalDone(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Subscriber ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when goalId not valid", async () => {
      const req = {
        user: { 
          userId: TEST_USERID
        },
        params: {
          goalId: TEST_GOALID_FAIL
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockToggleGoalDoneForToday.mockRejectedValue(new GoalError("Goal ID must be a positive integer"));

      await toggleGoalDone(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Goal ID must be a positive integer" });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

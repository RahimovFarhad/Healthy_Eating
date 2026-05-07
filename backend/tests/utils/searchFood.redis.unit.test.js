import { expect, jest } from "@jest/globals";

const mockAxiosGet = jest.fn();
const mockGetToken = jest.fn();

let redisClient;
const mockCreateClient = jest.fn(() => redisClient);

jest.unstable_mockModule("axios", () => ({
  default: {
    get: mockAxiosGet,
  },
}));

jest.unstable_mockModule("redis", () => ({
  createClient: mockCreateClient,
}));

jest.unstable_mockModule("../../src/utils/apiTokenManager.js", () => ({
  getToken: mockGetToken,
}));

describe("searchFood redis/cache behavior", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    redisClient = {
      isOpen: false,
      connect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(null), // default to cache miss
      setEx: jest.fn().mockResolvedValue(undefined), 
    };

    mockGetToken.mockResolvedValue("token-123");
  });

  test("searchFood connects to redis, and if redis returns the food does not call fatsecret api", async () => {
    const cached = { foods: [{ id: 1, name: "Cached Food" }] };
    redisClient.get.mockResolvedValueOnce(JSON.stringify(cached));

    const { searchFood } = await import("../../src/utils/searchFood.js");
    const result = await searchFood("apple");

    expect(redisClient.connect).toHaveBeenCalledTimes(1);
    expect(redisClient.get).toHaveBeenCalledWith("search:apple");
    expect(mockAxiosGet).not.toHaveBeenCalled();
    expect(result).toEqual(cached);
  });

  test("searchFood fetches from API and caches if cache miss", async () => {
    const apiData = { foods: [{ id: 2, name: "API Food" }] };
    mockAxiosGet.mockResolvedValueOnce({ data: apiData });

    const { searchFood } = await import("../../src/utils/searchFood.js");
    const result = await searchFood("banana");

    expect(redisClient.connect).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockAxiosGet).toHaveBeenCalledTimes(1);
    expect(redisClient.setEx).toHaveBeenCalledWith(
      "search:banana",
      60 * 60 * 24 * 7,
      JSON.stringify(apiData)
    );
    expect(result).toEqual(apiData);
  });

  test("searchFoodById fetches xml, parses it and then caches on the cache miss", async () => {
    const xml = `
      <food>
        <food_name>Apple</food_name>
        <servings>
          <serving>
            <serving_description>1 medium</serving_description>
            <metric_serving_amount>182</metric_serving_amount>
            <calories>95</calories>
            <protein>0.5</protein>
            <carbohydrate>25</carbohydrate>
            <fat>0.3</fat>
            <fiber>4.4</fiber>
            <sugar>19</sugar>
            <sodium>2</sodium>
          </serving>
        </servings>
      </food>
    `;

    mockAxiosGet.mockResolvedValueOnce({ data: xml });

    const { searchFoodById } = await import("../../src/utils/searchFood.js");
    const result = await searchFoodById("123");

    expect(redisClient.get).toHaveBeenCalledWith("food:123");
    expect(mockAxiosGet).toHaveBeenCalledTimes(1);
    expect(redisClient.setEx).toHaveBeenCalledWith(
      "food:123",
      60 * 60 * 24 * 7,
      JSON.stringify(result)
    );
    expect(result).toHaveProperty("name", "Apple");
    expect(Array.isArray(result.portions)).toBe(true);
  });

  test("searchFoodById returns cached result without API call", async () => {
    const cached = { name: "Cached Food", portions: [] };
    redisClient.get.mockResolvedValueOnce(JSON.stringify(cached));

    const { searchFoodById } = await import("../../src/utils/searchFood.js");
    const result = await searchFoodById("456");

    expect(redisClient.get).toHaveBeenCalledWith("food:456");
    expect(mockAxiosGet).not.toHaveBeenCalled();
    expect(result).toEqual(cached);
  });

  test("concurrent calls share same single redis connect", async () => {
    let resolveConnect;
    redisClient.connect.mockImplementation( // we simulate delay (and thus concurrency) in connecting to redis
      () => new Promise((resolve) => {
        resolveConnect = resolve;
      })
    );
    redisClient.get.mockResolvedValue(JSON.stringify({ foods: [] }));

    const { searchFood } = await import("../../src/utils/searchFood.js");

    const p1 = searchFood("one");
    const p2 = searchFood("two");

    resolveConnect();
    await Promise.all([p1, p2]);

    expect(redisClient.connect).toHaveBeenCalledTimes(1);
  });
});

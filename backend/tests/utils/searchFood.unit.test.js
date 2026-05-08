import { expect } from "@jest/globals";

let parseFoodResponse;

describe("searchFood utils", () => {
  beforeAll(async () => {
    process.env.FATSECRET_CLIENT_ID = "client";
    process.env.FATSECRET_CLIENT_SECRET = "secret";
    ({ parseFoodResponse } = await import("../../src/utils/searchFood.js"));
  });

  test("parseFoodResponse parses valid xml into normalized object", () => { // I took this data using AI (it is allowed as test data) - but the structure is based on actual responses from FatSecret API
    const xml = `
      <food>
        <food_name>Apple</food_name>
        <brand_name>Generic</brand_name>
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

    const result = parseFoodResponse(xml);

    expect(result.name).toBe("Apple");
    expect(result.brand).toBe("Generic");
    expect(Array.isArray(result.portions)).toBe(true);
    expect(result.portions[0].description).toBe("1 medium");
    expect(result.portions[0].weight_g).toBe(182);
  });

  test("parseFoodResponse throws when servings are missing", () => {
    const xml = `<food><food_name>Apple</food_name></food>`;
    expect(() => parseFoodResponse(xml)).toThrow("no servings found");
  });

  test("parseFoodResponse throws when food object is missing", () => {
    const xml = `<response><not_food>data</not_food></response>`;
    expect(() => parseFoodResponse(xml)).toThrow("no food object found");
  });    

  test("parseFoodResponse throws when invalid XML", () => {
    const xml = `<food><food_name>Apple</food_name>`; 
    expect(() => parseFoodResponse(xml)).toThrow();
  });
});

import { describe, expect, test } from "vitest";

import {
  foodImageInputSchema,
  isSupportedFoodImage,
  MAX_FOOD_IMAGE_BYTES,
  MAX_FOOD_IMAGE_DATA_URL_CHARS,
} from "../src/lib/food-image.schema.ts";

describe("food photo upload validation", () => {
  test("accepts supported camera photos within the 15 MB limit", () => {
    expect(isSupportedFoodImage("image/jpeg", MAX_FOOD_IMAGE_BYTES)).toBe(true);
    expect(isSupportedFoodImage("image/heic", 1024)).toBe(true);
    expect(isSupportedFoodImage("", 1024, "camera.heic")).toBe(true);
  });

  test("rejects unsupported formats and files over 15 MB", () => {
    expect(isSupportedFoodImage("image/gif", 1024)).toBe(false);
    expect(isSupportedFoodImage("image/jpeg", MAX_FOOD_IMAGE_BYTES + 1)).toBe(false);
  });

  test("accepts only bounded JPEG data URLs for server analysis", () => {
    expect(foodImageInputSchema.safeParse({ imageDataUrl: "data:image/jpeg;base64,aGVsbG8=" }).success).toBe(true);
    expect(foodImageInputSchema.safeParse({ imageDataUrl: "data:image/svg+xml;base64,PHN2Zz4=" }).success).toBe(false);
    expect(foodImageInputSchema.safeParse({
      imageDataUrl: `data:image/jpeg;base64,${"a".repeat(MAX_FOOD_IMAGE_DATA_URL_CHARS)}`,
    }).success).toBe(false);
  });
});
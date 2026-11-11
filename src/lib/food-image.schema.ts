import { z } from "zod";

export const MAX_FOOD_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_FOOD_IMAGE_DATA_URL_CHARS = 2_000_000;

const acceptedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function isSupportedFoodImage(type: string, size: number) {
  return acceptedImageTypes.has(type.toLowerCase()) && size > 0 && size <= MAX_FOOD_IMAGE_BYTES;
}

export const foodImageInputSchema = z.object({
  imageDataUrl: z
    .string()
    .min(1)
    .max(MAX_FOOD_IMAGE_DATA_URL_CHARS)
    .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/),
});

export const foodImageResultSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(100),
        quantity: z.string().trim().max(60),
      }),
    )
    .min(1)
    .max(20),
});

export type FoodImageItem = z.infer<typeof foodImageResultSchema>["items"][number];
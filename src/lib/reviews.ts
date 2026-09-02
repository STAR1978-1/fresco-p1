export type RecipeReview = {
  id: string;
  recipeKey: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO
};

const STORAGE_KEY = "fresco.reviews.v1";

export function recipeKey(title: string): string {
  return title.trim().toLowerCase();
}

export function loadReviews(): RecipeReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecipeReview[]) : seedReviews;
  } catch {
    return [];
  }
}

export function saveReviews(reviews: RecipeReview[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function reviewsFor(reviews: RecipeReview[], title: string): RecipeReview[] {
  const key = recipeKey(title);
  return reviews
    .filter((r) => r.recipeKey === key)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function averageRating(reviews: RecipeReview[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function timeLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function effortLabel(minutes: number): string {
  if (minutes <= 20) return "Exprés";
  if (minutes <= 45) return "Tranquila";
  return "Con calma";
}

const seedReviews: RecipeReview[] = [];

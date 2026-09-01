export type PantryItem = {
  id: string;
  name: string;
  quantity: string;
  expiresAt: string; // yyyy-mm-dd
};

export type Urgency = "urgente" | "semana" | "fresco";

const STORAGE_KEY = "fresco.pantry.v1";

export function daysUntil(dateISO: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateISO}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function urgencyOf(dateISO: string): Urgency {
  const d = daysUntil(dateISO);
  if (d <= 1) return "urgente";
  if (d <= 5) return "semana";
  return "fresco";
}

export const urgencyLabel: Record<Urgency, string> = {
  urgente: "Urgente",
  semana: "Esta semana",
  fresco: "En fresco",
};

export function expiryText(dateISO: string): string {
  const d = daysUntil(dateISO);
  if (d < 0) return `vencido ${Math.abs(d)} d`;
  if (d === 0) return "hoy";
  if (d === 1) return "mañana";
  return `${d} días`;
}

export function sortByUrgency(items: PantryItem[]): PantryItem[] {
  return [...items].sort((a, b) => daysUntil(a.expiresAt) - daysUntil(b.expiresAt));
}

export function loadPantry(): PantryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PantryItem[]) : [];
  } catch {
    return [];
  }
}

export function savePantry(items: PantryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const samplePantry: PantryItem[] = [
  { id: "s1", name: "Brócoli", quantity: "1 cabeza", expiresAt: addDays(0) },
  { id: "s2", name: "Champiñones", quantity: "200 g", expiresAt: addDays(1) },
  { id: "s3", name: "Queso mozzarella", quantity: "1 bola", expiresAt: addDays(1) },
  { id: "s4", name: "Albahaca", quantity: "1 ramo", expiresAt: addDays(2) },
  { id: "s5", name: "Huevos", quantity: "12 uds", expiresAt: addDays(5) },
  { id: "s6", name: "Tomates cherry", quantity: "300 g", expiresAt: addDays(9) },
  { id: "s7", name: "Pan de masa madre", quantity: "1 hogaza", expiresAt: addDays(12) },
];

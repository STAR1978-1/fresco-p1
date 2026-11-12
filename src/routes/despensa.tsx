import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PhotoUploader } from "@/components/PhotoUploader";
import { analyzeFoodImage } from "@/lib/food-image.functions";
import { SiteFooter, SiteHeader, UrgencyBadge } from "@/components/site-chrome";
import {
  addDays,
  expiryText,
  loadPantry,
  samplePantry,
  savePantry,
  sortByUrgency,
  urgencyOf,
  type PantryItem,
} from "@/lib/pantry";

export const Route = createFileRoute("/despensa")({
  head: () => ({
    meta: [
      { title: "Mi despensa — FRESCO" },
      {
        name: "description",
        content:
          "Ingresa los alimentos que tienes en casa con cantidad y fecha de vencimiento; FRESCO los ordena por urgencia.",
      },
      { property: "og:title", content: "Mi despensa — FRESCO" },
      {
        property: "og:description",
        content: "Registra tus alimentos y mira qué está por vencer primero.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Despensa,
});

function Despensa() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiresAt, setExpiresAt] = useState(addDays(3));

  useEffect(() => {
    setItems(loadPantry());
  }, []);

  function update(next: PantryItem[]) {
    setItems(next);
    savePantry(next);
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Escribe el nombre del alimento.");
      return;
    }
    update([
      ...items,
      {
        id: `${Date.now()}`,
        name: name.trim(),
        quantity: quantity.trim(),
        expiresAt,
      },
    ]);
    setName("");
    setQuantity("");
  }

  async function analyzePhoto(imageDataUrl: string) {
    const result = await analyzeFoodImage({ data: { imageDataUrl } });
    return result.items;
  }

  function addDetectedFoods(foods: Array<Pick<PantryItem, "name" | "quantity" | "expiresAt">>) {
    const now = Date.now();
    update([
      ...items,
      ...foods.map((food, index) => ({ ...food, id: `${now}-${index}` })),
    ]);
    toast.success(`${foods.length} ${foods.length === 1 ? "alimento añadido" : "alimentos añadidos"}.`);
  }

  const sorted = sortByUrgency(items);
  const urgentCount = sorted.filter((i) => urgencyOf(i.expiresAt) === "urgente").length;

  return (
    <div className="min-h-screen bg-ice text-ink selection:bg-glow/20">
      <SiteHeader />

      <section>
        <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <span className="font-mono text-xs text-mist">(a) · Tu despensa</span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance lg:text-4xl">
                Lo que tienes, en orden de urgencia
              </h1>
            </div>
            <span className="hidden font-mono text-xs text-mist md:inline">
              {sorted.length} productos · {urgentCount} por vencer
            </span>
          </div>

          <div className="mb-6">
            <PhotoUploader onAnalyze={analyzePhoto} onAddFoods={addDetectedFoods} />
          </div>

          <form
            onSubmit={add}
            className="mb-6 grid gap-3 rounded-[18px] bg-card/70 p-4 ring-1 ring-black/5 sm:grid-cols-[1.6fr_1fr_auto_auto] sm:p-5"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: espinaca baby"
              className="rounded-full border border-frostline bg-ice px-4 py-2.5 text-sm outline-none placeholder:text-mist/70 focus:border-glow"
            />
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="200 g"
              className="rounded-full border border-frostline bg-ice px-4 py-2.5 text-sm outline-none placeholder:text-mist/70 focus:border-glow"
            />
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="rounded-full border border-frostline bg-ice px-4 py-2.5 font-mono text-sm outline-none focus:border-glow"
            />
            <button
              type="submit"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ice ring-1 ring-black/5 transition-colors hover:bg-ink/90"
            >
              Añadir
            </button>
          </form>

          <div className="overflow-hidden rounded-[18px] bg-card/60 ring-1 ring-black/5">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-frostline px-4 py-3 font-mono text-[11px] tracking-[0.12em] text-mist uppercase sm:grid-cols-[1.6fr_1fr_auto_auto_auto] sm:px-5">
              <span>Ingrediente</span>
              <span className="hidden sm:block">Cantidad</span>
              <span>Vence</span>
              <span className="text-right">Estado</span>
              <span className="sr-only">Acciones</span>
            </div>

            {sorted.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-mist">
                Aún no hay alimentos.{" "}
                <button
                  onClick={() => update(samplePantry)}
                  className="font-semibold text-cold underline decoration-frostline"
                >
                  Cargar una despensa de ejemplo
                </button>
              </div>
            ) : (
              <div className="divide-y divide-frostline">
                {sorted.map((item, i) => (
                  <div
                    key={item.id}
                    className="grid animate-fr-rise grid-cols-[1fr_auto_auto] items-center gap-x-4 px-4 py-3 sm:grid-cols-[1.6fr_1fr_auto_auto_auto] sm:px-5"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="hidden text-sm text-mist sm:block">
                      {item.quantity || "—"}
                    </span>
                    <span className="font-mono text-xs text-mist">
                      {expiryText(item.expiresAt)}
                    </span>
                    <span className="justify-self-end">
                      <UrgencyBadge urgency={urgencyOf(item.expiresAt)} />
                    </span>
                    <button
                      onClick={() => update(items.filter((x) => x.id !== item.id))}
                      aria-label={`Quitar ${item.name}`}
                      className="justify-self-end font-mono text-xs text-mist transition-colors hover:text-ink"
                    >
                      quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/recetas"
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ice ring-1 ring-black/5 transition-colors hover:bg-ink/90"
            >
              Generar recetas
            </Link>
            {sorted.length > 0 && (
              <button
                onClick={() => update([])}
                className="rounded-full bg-frost px-5 py-3 text-sm font-semibold ring-1 ring-black/5 transition-colors hover:bg-frost/60"
              >
                Vaciar despensa
              </button>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

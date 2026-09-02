import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { RecipeReviews, ReviewSummary } from "@/components/recipe-reviews";
import { SiteFooter, SiteHeader, UrgencyBadge } from "@/components/site-chrome";
import { daysUntil, loadPantry, sortByUrgency, type PantryItem } from "@/lib/pantry";
import { generateRecipes, type GeneratedRecipe } from "@/lib/recipes.functions";
import {
  effortLabel,
  loadReviews,
  saveReviews,
  timeLabel,
  type RecipeReview,
} from "@/lib/reviews";


export const Route = createFileRoute("/recetas")({
  head: () => ({
    meta: [
      { title: "Recetas generadas — FRESCO" },
      {
        name: "description",
        content:
          "Recetas creadas por IA con los alimentos de tu despensa, ordenadas por lo que vence primero.",
      },
      { property: "og:title", content: "Recetas generadas — FRESCO" },
      {
        property: "og:description",
        content: "La IA arma recetas que rescatan primero lo que está por vencer.",
      },
    ],
  }),
  component: Recetas,
});

function Recetas() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
  const [reviews, setReviews] = useState<RecipeReview[]>([]);
  const generate = useServerFn(generateRecipes);

  useEffect(() => {
    setItems(loadPantry());
    setReviews(loadReviews());
  }, []);

  const addReview = (review: RecipeReview) => {
    setReviews((prev) => {
      const next = [review, ...prev];
      saveReviews(next);
      return next;
    });
  };


  const mutation = useMutation({
    mutationFn: async (pantry: PantryItem[]) =>
      generate({
        data: {
          items: pantry.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            expiresInDays: daysUntil(i.expiresAt),
          })),
        },
      }),
    onSuccess: (res) => setRecipes(res.recipes),
    onError: (err: Error) => toast.error(err.message || "No se pudieron generar las recetas."),
  });

  const sorted = sortByUrgency(items);

  return (
    <div className="min-h-screen bg-ice text-ink selection:bg-glow/20">
      <SiteHeader />

      <section className="bg-frost/40">
        <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-xs text-mist">(b) · Recetas generadas</span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance lg:text-4xl">
                Ordenadas por lo que vence primero
              </h1>
            </div>
            {sorted.length > 0 && (
              <button
                onClick={() => mutation.mutate(sorted)}
                disabled={mutation.isPending}
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ice ring-1 ring-black/5 transition-colors hover:bg-ink/90 disabled:opacity-60"
              >
                {mutation.isPending
                  ? "La IA está cocinando…"
                  : recipes.length > 0
                    ? "Generar otras recetas"
                    : `Analizar ${sorted.length} alimentos`}
              </button>
            )}
          </div>

          {sorted.length === 0 ? (
            <div className="rounded-[18px] bg-card/70 px-6 py-12 text-center ring-1 ring-black/5">
              <p className="text-sm text-mist">
                Tu despensa está vacía. Ingresa alimentos para que la IA pueda proponer recetas.
              </p>
              <Link
                to="/despensa"
                className="mt-5 inline-block rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ice ring-1 ring-black/5 transition-colors hover:bg-ink/90"
              >
                Ingresar alimentos
              </Link>
            </div>
          ) : recipes.length === 0 && !mutation.isPending ? (
            <div className="rounded-[18px] bg-card/70 px-6 py-12 text-center ring-1 ring-black/5">
              <p className="font-mono text-xs text-mist">
                {sorted.length} ingredientes listos · lo primero que vence:{" "}
                <span className="text-ink">{sorted[0]?.name}</span>
              </p>
              <p className="mt-3 text-sm text-mist">
                Pulsa «Analizar» y la IA armará recetas priorizando lo más urgente.
              </p>
            </div>
          ) : mutation.isPending ? (
            <div className="grid gap-5 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-52 animate-pulse rounded-[18px] bg-card/60 ring-1 ring-black/5"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {recipes.map((r, i) => (
                <article
                  key={`${r.title}-${i}`}
                  className="flex animate-fr-rise flex-col rounded-[18px] bg-card/70 p-5 ring-1 ring-black/5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-mist">{Math.round(r.match)}% match</span>
                    <UrgencyBadge urgency={r.urgency} />
                  </div>
                  <h2 className="mt-4 text-xl font-bold tracking-tight">{r.title}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cold/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-cold">
                      ⏱ {timeLabel(r.minutes)}
                    </span>
                    <span className="rounded-full bg-frost px-2.5 py-1 font-mono text-[11px] text-mist">
                      {effortLabel(r.minutes)}
                    </span>
                    <ReviewSummary reviews={reviews} title={r.title} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.usedIngredients.map((ing) => (
                      <span
                        key={ing}
                        className="rounded-full bg-frost px-2 py-0.5 text-[11px] text-mist"
                      >
                        {ing}
                      </span>
                    ))}
                    {r.missingIngredients.map((ing) => (
                      <span
                        key={`falta-${ing}`}
                        className="rounded-full bg-warn/15 px-2 py-0.5 text-[11px] font-medium text-warn"
                      >
                        Falta: {ing}
                      </span>
                    ))}
                  </div>
                  {r.steps.length > 0 && (
                    <ol className="mt-4 space-y-1.5 text-sm text-mist">
                      {r.steps.slice(0, 5).map((step, si) => (
                        <li key={si} className="flex gap-2">
                          <span className="font-mono text-xs text-cold">{si + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  <div className="mt-auto pt-4">
                    <div className="mb-1.5 flex items-center justify-between font-mono text-xs text-mist">
                      <span>Match</span>
                      <span>{Math.round(r.match)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-frostline">
                      <div
                        className="h-full rounded-full bg-cold"
                        style={{ width: `${Math.min(100, Math.max(0, r.match))}%` }}
                      />
                    </div>
                  </div>
                  <RecipeReviews title={r.title} reviews={reviews} onAdd={addReview} />
                </article>

          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

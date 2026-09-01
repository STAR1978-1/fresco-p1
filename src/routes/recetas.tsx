import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader, UrgencyBadge } from "@/components/site-chrome";
import { daysUntil, loadPantry, sortByUrgency, type PantryItem } from "@/lib/pantry";
import { generateRecipes, type GeneratedRecipe } from "@/lib/recipes.functions";

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
  component: Recetas;
});

function Recetas() {
  return null;
}

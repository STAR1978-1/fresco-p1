import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.string().default(""),
        expiresInDays: z.number(),
      }),
    )
    .min(1)
    .max(60),
});

export type GeneratedRecipe = {
  title: string;
  minutes: number;
  match: number;
  urgency: "urgente" | "semana" | "fresco";
  usedIngredients: string[];
  missingIngredients: string[];
  steps: string[];
};

const RecipeSchema = z.object({
  recipes: z
    .array(
      z.object({
        title: z.string(),
        minutes: z.number(),
        match: z.number(),
        urgency: z.enum(["urgente", "semana", "fresco"]),
        usedIngredients: z.array(z.string()),
        missingIngredients: z.array(z.string()),
        steps: z.array(z.string()),
      }),
    )
    .min(1),
});

export const generateRecipes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ recipes: GeneratedRecipe[] }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Falta la configuración de la IA (LOVABLE_API_KEY).");

    const pantry = data.items
      .map(
        (i) =>
          `- ${i.name}${i.quantity ? ` (${i.quantity})` : ""}: vence en ${i.expiresInDays} día(s)`,
      )
      .join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          {
            role: "system",
            content:
              "Eres un chef que evita el desperdicio de alimentos. Devuelve SIEMPRE JSON válido, sin markdown. Escribe en español. " +
              'Formato: {"recipes":[{"title":string,"minutes":number,"match":number (0-100),"urgency":"urgente"|"semana"|"fresco","usedIngredients":string[],"missingIngredients":string[],"steps":string[]}]}. ' +
              "Genera entre 3 y 6 recetas, ordenadas de forma que las primeras usen los ingredientes que vencen antes. " +
              "urgency='urgente' si la receta usa algo que vence en 0-1 días, 'semana' si 2-5, 'fresco' si más. " +
              "match = porcentaje de ingredientes de la receta que ya están en la despensa.",
          },
          {
            role: "user",
            content: `Estos son los alimentos que tengo en casa:\n${pantry}\n\nGenera recetas priorizando lo que vence primero.`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429)
        throw new Error("Demasiadas solicitudes a la IA. Inténtalo de nuevo en un momento.");
      if (res.status === 402)
        throw new Error("Se agotaron los créditos de IA del proyecto. Recárgalos en Lovable.");
      throw new Error(`Error de la IA (${res.status}): ${body.slice(0, 300)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/, "");
    const parsed = RecipeSchema.parse(JSON.parse(cleaned));

    const order = { urgente: 0, semana: 1, fresco: 2 } as const;
    const recipes = [...parsed.recipes].sort(
      (a, b) => order[a.urgency] - order[b.urgency] || b.match - a.match,
    );

    return { recipes };
  });

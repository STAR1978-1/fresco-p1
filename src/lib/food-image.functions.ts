import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, Output, streamText } from "ai";
import { createServerFn } from "@tanstack/react-start";

import { createLovableAiGatewayRunIdFetch } from "@/lib/ai-gateway-run-id.server";
import { foodImageInputSchema, foodImageResultSchema } from "@/lib/food-image.schema";

function safeGatewayMessage(error: APICallError) {
  try {
    const body = JSON.parse(error.responseBody ?? "") as {
      message?: unknown;
      error?: { message?: unknown };
    };
    const message = typeof body.message === "string" ? body.message : body.error?.message;
    if (typeof message === "string" && message.trim()) return message;
  } catch {
    // Use the status-specific message below when the provider body is not JSON.
  }

  if (error.statusCode === 401) return "La configuración de análisis no está disponible.";
  if (error.statusCode === 402) return "No hay créditos disponibles para analizar fotos.";
  if (error.statusCode === 403) return "El análisis de fotos no está disponible para esta cuenta.";
  if (error.statusCode === 429) return "Hay muchas solicitudes ahora. Inténtalo de nuevo en un momento.";
  if (error.statusCode === 404) return "El servicio de análisis de fotos no está disponible.";
  if (error.statusCode && error.statusCode >= 500)
    return "El análisis de fotos no está disponible por el momento.";
  return "No se pudo analizar la foto. Prueba con otra imagen.";
}

export const analyzeFoodImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => foodImageInputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("El análisis de fotos no está configurado.");

    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: {
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      fetch: runIdFetch.fetch,
    });

    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions:
          "Identifica alimentos claramente visibles en la foto y responde en español. " +
          "Devuelve el nombre y una cantidad aproximada solo si se puede estimar visualmente; si no, usa una cadena vacía. " +
          "No inventes fechas de vencimiento ni identifiques alimentos que no sean visibles.",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "¿Qué alimentos ves en esta foto?" },
              { type: "image", image: new URL(data.imageDataUrl) },
            ],
          },
        ],
        output: Output.object({ schema: foodImageResultSchema }),
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });

      const output = await result.output;
      if (output.items.length === 0) throw new Error("No encontramos alimentos en esta foto.");
      return output;
    } catch (error) {
      if (APICallError.isInstance(error)) throw new Error(safeGatewayMessage(error));
      if (error instanceof Error && error.message === "No encontramos alimentos en esta foto.")
        throw error;
      throw new Error("No se pudo analizar la foto. Prueba con otra imagen.");
    }
  });
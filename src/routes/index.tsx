import { createFileRoute, Link } from "@tanstack/react-router";

import heroProduce from "@/assets/hero-produce.jpg";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FRESCO — Recetas con IA para lo que vence primero" },
      {
        name: "description",
        content:
          "Ingresa los alimentos que tienes en casa con su fecha de vencimiento y FRESCO genera recetas que rescatan primero lo más urgente.",
      },
      { property: "og:title", content: "FRESCO — Cocina lo que vence antes de tirarlo" },
      {
        property: "og:description",
        content: "Recetas generadas por IA a partir de tu despensa, priorizando lo que vence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-ice text-ink selection:bg-glow/20">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_0%,color-mix(in_oklab,var(--glow)_18%,transparent),transparent)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pt-14 pb-16 lg:grid-cols-12 lg:pt-20 lg:pb-24">
          <div className="lg:col-span-7">
            <div className="inline-flex animate-fr-rise items-center gap-2 rounded-full bg-frost px-3 py-1.5 font-mono text-xs text-mist">
              <span className="h-1.5 w-1.5 rounded-full bg-glow animate-fr-glow" />
              IA de cocina en tiempo real
            </div>
            <h1 className="mt-5 animate-fr-rise text-5xl leading-[1.05] font-bold tracking-tight text-balance [animation-delay:80ms] lg:text-6xl">
              Cocina lo que vence <span className="text-cold">antes</span> de que lo tires.
            </h1>
            <p className="mt-5 max-w-[46ch] animate-fr-rise text-base text-pretty text-mist [animation-delay:160ms] lg:text-lg">
              Escribe lo que tienes en la nevera con su fecha de vencimiento. FRESCO ordena lo que
              está por vencer y arma recetas que lo rescatan, empezando por lo más apurado.
            </p>
            <div className="mt-8 flex animate-fr-rise flex-wrap gap-3 [animation-delay:240ms]">
              <Link
                to="/despensa"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ice ring-1 ring-black/5 transition-colors hover:bg-ink/90"
              >
                Ver mi despensa
              </Link>
              <Link
                to="/recetas"
                className="rounded-full bg-frost px-5 py-3 text-sm font-semibold ring-1 ring-black/5 transition-colors hover:bg-frost/60"
              >
                Ver recetas
              </Link>
            </div>
            <div className="mt-10 flex animate-fr-rise flex-wrap gap-x-8 gap-y-3 border-t border-frostline pt-5 font-mono text-xs text-mist [animation-delay:320ms]">
              <span>
                <span className="font-medium text-ink">3</span> ingredientes por vencer
              </span>
              <span>
                <span className="font-medium text-ink">92%</span> receta media
              </span>
              <span>
                <span className="font-medium text-ink">0</span> compras extra
              </span>
            </div>
          </div>
          <div className="animate-fr-rise [animation-delay:200ms] lg:col-span-5">
            <img
              src={heroProduce}
              alt="Verduras, hierbas y huevos frescos sobre una superficie azul pálido"
              width={1088}
              height={1200}
              className="aspect-4/5 w-full rounded-[18px] object-cover outline-1 -outline-offset-1 outline-black/5"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-frostline">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <span className="font-mono text-xs text-mist">(a) · Cómo funciona</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance lg:text-4xl">
            Tres pasos, cero desperdicio
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Ingresa tus alimentos",
                d: "Nombre, cantidad y fecha de vencimiento. Nada más.",
              },
              {
                n: "02",
                t: "La IA analiza la urgencia",
                d: "Lo que vence primero pesa más en cada receta propuesta.",
              },
              {
                n: "03",
                t: "Cocinas con lo que hay",
                d: "Ves qué ingredientes usas y qué te falta antes de comprar.",
              },
            ].map((s, i) => (
              <div
                key={s.n}
                className="animate-fr-rise rounded-[18px] bg-card/70 p-5 ring-1 ring-black/5"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="font-mono text-xs text-cold">{s.n}</span>
                <h3 className="mt-3 text-lg font-bold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-sm text-mist">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

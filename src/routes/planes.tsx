import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      { title: "Planes y precios — FRESCO" },
      {
        name: "description",
        content:
          "Elige el plan de FRESCO: gratis para empezar, Fresco+ con recetas ilimitadas o Hogar para toda la familia.",
      },
      { property: "og:title", content: "Planes y precios — FRESCO" },
      {
        property: "og:description",
        content: "Desde gratis hasta despensa compartida para 5 miembros.",
      },
    ],
  }),
  component: Planes,
});

const plans = [
  {
    name: "Básico",
    price: "Gratis",
    period: "",
    features: ["10 ingredientes activos", "3 recetas por semana", "Orden por vencimiento"],
    cta: "Empezar",
    featured: false,
  },
  {
    name: "Fresco+",
    price: "6 €",
    period: "/mes",
    features: [
      "Ingredientes ilimitados",
      "Recetas ilimitadas",
      "Lista de compras",
      "Alertas de vencimiento",
    ],
    cta: "Suscribirme",
    featured: true,
  },
  {
    name: "Hogar",
    price: "12 €",
    period: "/mes",
    features: [
      "Todo lo de Fresco+",
      "Hasta 5 miembros",
      "Despensa compartida",
      "Historial de recetas",
    ],
    cta: "Elegir Hogar",
    featured: false,
  },
];

function Planes() {
  return (
    <div className="min-h-screen bg-ice text-ink selection:bg-glow/20">
      <SiteHeader />

      <section>
        <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
          <div className="grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="font-mono text-xs text-mist">(c) · Planes</span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance lg:text-4xl">
                Elige cómo de fresco quieres vivir
              </h1>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
              {plans.map((plan, i) =>
                plan.featured ? (
                  <div
                    key={plan.name}
                    className="flex animate-fr-rise flex-col rounded-[16px] bg-ink p-5 text-ice ring-1 ring-black/5"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="font-mono text-[11px] tracking-[0.12em] text-glow uppercase">
                      Más popular
                    </span>
                    <h2 className="mt-1 font-semibold">{plan.name}</h2>
                    <div className="mt-3 text-3xl font-bold tracking-tight">
                      {plan.price}
                      <span className="text-base font-medium text-ice/60">{plan.period}</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-ice/70">
                      {plan.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => toast.success("Plan Fresco+ reservado. Te avisaremos al abrir pagos.")}
                      className="mt-6 rounded-full bg-glow px-4 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:bg-glow/90"
                    >
                      {plan.cta}
                    </button>
                  </div>
                ) : (
                  <div
                    key={plan.name}
                    className="flex animate-fr-rise flex-col rounded-[16px] bg-card/70 p-5 ring-1 ring-black/5"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <h2 className="font-semibold">{plan.name}</h2>
                    <div className="mt-3 text-3xl font-bold tracking-tight">
                      {plan.price}
                      <span className="text-base font-medium text-mist">{plan.period}</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-mist">
                      {plan.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => toast.success(`Plan ${plan.name} anotado.`)}
                      className="mt-6 rounded-full bg-frost px-4 py-2.5 text-center text-sm font-semibold ring-1 ring-black/5 transition-colors hover:bg-frost/60"
                    >
                      {plan.cta}
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

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
          "Planes de FRESCO en dólares: Básico gratis, Premium $4, Familiar $12, Empresas $10 y el plan Embajador con beneficios por invitar amigos.",
      },
      { property: "og:title", content: "Planes y precios — FRESCO" },
      {
        property: "og:description",
        content:
          "Desde gratis hasta despensa compartida para equipos, más recompensas por invitar personas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planes,
});

type Plan = {
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  cta: string;
  featured?: boolean;
  wide?: boolean;
};

const plans: Plan[] = [
  {
    name: "Básico",
    price: "$0",
    period: "gratis",
    tagline: "Para probar sin compromiso",
    features: [
      "10 ingredientes activos",
      "3 recetas por semana",
      "Orden por vencimiento",
      "Tiempo estimado por receta",
    ],
    cta: "Empezar gratis",
  },
  {
    name: "Premium",
    price: "$4",
    period: "/mes",
    tagline: "Lo más completo para una persona",
    features: [
      "Ingredientes y recetas ilimitadas",
      "Recetas más detalladas paso a paso",
      "Lista de compras automática",
      "Alertas de vencimiento",
      "Publica y guarda reseñas",
    ],
    cta: "Suscribirme",
    featured: true,
  },
  {
    name: "Familiar / Amigos",
    price: "$12",
    period: "/mes",
    tagline: "Una despensa, varias manos",
    features: [
      "Todo lo de Premium",
      "Hasta 6 miembros",
      "Despensa compartida en tiempo real",
      "Planificador semanal del hogar",
      "Historial y reseñas del grupo",
    ],
    cta: "Elegir Familiar",
  },
  {
    name: "Empresas y emprendimientos",
    price: "$10",
    period: "/mes por sede",
    tagline: "Cocinas, cafeterías y food startups",
    features: [
      "Inventario por lotes y mermas",
      "Control de costo por receta",
      "Roles para el equipo",
      "Reportes de desperdicio",
      "Soporte prioritario",
    ],
    cta: "Hablar de Empresas",
  },
];

const referral = {
  name: "Embajador",
  price: "$0",
  tagline: "Invita personas y desbloquea beneficios",
  tiers: [
    { count: "1 invitado", reward: "+5 recetas extra al mes" },
    { count: "3 invitados", reward: "Recetas avanzadas del chef IA" },
    { count: "5 invitados", reward: "1 mes de Premium gratis" },
    { count: "10 invitados", reward: "Premium permanente mientras sigan activos" },
  ],
};

function Planes() {
  return (
    <div className="min-h-screen bg-ice text-ink selection:bg-glow/20">
      <SiteHeader />

      <section>
        <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
          <div className="max-w-2xl">
            <span className="font-mono text-xs text-mist">(c) · Planes</span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance lg:text-4xl">
              Elige cómo de fresco quieres vivir
            </h1>
            <p className="mt-3 text-sm text-mist">
              Precios en dólares (USD). Cancela cuando quieras.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`flex animate-fr-rise flex-col rounded-[16px] p-5 ring-1 ring-black/5 ${
                  plan.featured ? "bg-ink text-ice" : "bg-card/70"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {plan.featured && (
                  <span className="font-mono text-[11px] tracking-[0.12em] text-glow uppercase">
                    Más popular
                  </span>
                )}
                <h2 className="mt-1 font-semibold">{plan.name}</h2>
                <p
                  className={`mt-1 text-xs ${plan.featured ? "text-ice/60" : "text-mist"}`}
                >
                  {plan.tagline}
                </p>
                <div className="mt-3 text-3xl font-bold tracking-tight">
                  {plan.price}
                  <span
                    className={`ml-1 text-sm font-medium ${
                      plan.featured ? "text-ice/60" : "text-mist"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul
                  className={`mt-4 space-y-2 text-sm ${
                    plan.featured ? "text-ice/70" : "text-mist"
                  }`}
                >
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    toast.success(`Plan ${plan.name} anotado. Te avisaremos al abrir pagos.`)
                  }
                  className={`mt-6 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.featured
                      ? "bg-glow text-ink hover:bg-glow/90"
                      : "bg-frost ring-1 ring-black/5 hover:bg-frost/60"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 grid animate-fr-rise gap-6 rounded-[18px] bg-frost/60 p-6 ring-1 ring-black/5 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="font-mono text-[11px] tracking-[0.12em] text-cold uppercase">
                Plan de referidos
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">{referral.name}</h2>
              <p className="mt-2 text-sm text-mist">
                {referral.tagline}. No pagas nada: cada persona que se une con tu enlace te
                suma recetas y funciones del chef IA.
              </p>
              <button
                onClick={() => toast.success("Tu enlace de invitación estará listo muy pronto.")}
                className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ice transition-colors hover:bg-ink/90"
              >
                Conseguir mi enlace
              </button>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
              {referral.tiers.map((t) => (
                <li key={t.count} className="rounded-[12px] bg-card/80 p-4 ring-1 ring-black/5">
                  <span className="font-mono text-xs text-cold">{t.count}</span>
                  <p className="mt-1 text-sm font-medium">{t.reward}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

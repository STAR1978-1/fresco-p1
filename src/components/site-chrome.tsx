import { Link } from "@tanstack/react-router";
import { InstallAppButton } from "./install-app";

const navItems = [
  { to: "/despensa", label: "Despensa" },
  { to: "/recetas", label: "Recetas" },
  { to: "/planes", label: "Planes" },
] as const;

export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-50 border-b border-frostline bg-ice/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-baseline gap-2 animate-fr-rise">
          <span className="text-xl font-bold tracking-tight">FRESCO</span>
          <span className="h-2 w-2 rounded-full bg-glow animate-fr-glow" title="estado activo" />
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-mist md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-ink" }}
              className="transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <InstallAppButton className="hidden sm:inline-flex" />
          <Link
            to="/despensa"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-ice ring-1 ring-black/5 transition-colors hover:bg-ink/90"
          >
            Ingresar alimentos
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-frostline">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <div className="animate-fr-wipe">
          <span className="text-lg font-bold tracking-tight">FRESCO</span>
          <p className="mt-1 font-mono text-xs text-mist">Cocina lo que vence. No lo que sobra.</p>
        </div>
        <div className="flex gap-6 font-mono text-xs text-mist">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
        </div>
        <InstallAppButton />

      </div>
    </footer>
  );
}

export function UrgencyBadge({ urgency }: { urgency: "urgente" | "semana" | "fresco" }) {
  if (urgency === "urgente") {
    return (
      <span className="rounded-full bg-warn/15 px-2.5 py-1 text-[11px] font-semibold text-warn">
        Urgente
      </span>
    );
  }
  if (urgency === "fresco") {
    return (
      <span className="rounded-full bg-fresh/10 px-2.5 py-1 text-[11px] font-semibold text-fresh">
        En fresco
      </span>
    );
  }
  return (
    <span className="rounded-full bg-frost px-2.5 py-1 text-[11px] font-semibold text-mist">
      Esta semana
    </span>
  );
}

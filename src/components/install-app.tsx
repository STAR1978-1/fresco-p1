import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice?: Promise<unknown> };

export function InstallAppButton({ className = "" }: { className?: string }) {
  const [promptEvent, setPromptEvent] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      setPromptEvent(null);
      return;
    }
    setShowHelp(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`rounded-full border border-frostline bg-frost px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-glow/20 ${className}`}
      >
        Descargar app
      </button>

      {showHelp && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-frostline bg-ice p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-bold tracking-tight">Instalar FRESCO en tu teléfono</h2>
            <p className="mt-2 text-sm text-mist">
              FRESCO se instala directo desde el navegador, sin tiendas de aplicaciones.
            </p>
            <ol className="mt-4 space-y-3 text-sm">
              {isIos ? (
                <>
                  <li>1. Abre FRESCO en Safari.</li>
                  <li>2. Toca el botón Compartir (el cuadrado con la flecha hacia arriba).</li>
                  <li>3. Elige “Añadir a pantalla de inicio”.</li>
                </>
              ) : (
                <>
                  <li>1. Abre FRESCO en Chrome.</li>
                  <li>2. Toca el menú de tres puntos, arriba a la derecha.</li>
                  <li>3. Elige “Instalar aplicación” o “Añadir a pantalla de inicio”.</li>
                </>
              )}
            </ol>
            <p className="mt-4 font-mono text-xs text-mist">
              Al abrir el enlace dentro de otra app (Instagram, Facebook) la opción no aparece: ábrelo
              primero en tu navegador.
            </p>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full rounded-full bg-ink px-4 py-2 text-sm font-medium text-ice"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}

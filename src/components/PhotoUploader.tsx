import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, ImageUp, LoaderCircle, ScanLine, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { addDays, type PantryItem } from "@/lib/pantry";
import {
  isSupportedFoodImage,
  MAX_FOOD_IMAGE_BYTES,
  type FoodImageItem,
} from "@/lib/food-image.schema";

type EditableFood = FoodImageItem & {
  selected: boolean;
  expiresAt: string;
};

type PantryFood = Pick<PantryItem, "name" | "quantity" | "expiresAt">;

interface PhotoUploaderProps {
  onAnalyze: (imageDataUrl: string) => Promise<FoodImageItem[]>;
  onAddFoods: (foods: PantryFood[]) => void;
}

function preparePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    createImageBitmap(file)
      .then((bitmap) => {
        const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          bitmap.close();
          reject(new Error("No se pudo preparar la foto."));
          return;
        }
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("No se pudo preparar la foto."));
              return;
            }
            const reader = new FileReader();
            reader.onload = () =>
              typeof reader.result === "string"
                ? resolve(reader.result)
                : reject(new Error("No se pudo leer la foto."));
            reader.onerror = () => reject(new Error("No se pudo leer la foto."));
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          0.82,
        );
      })
      .catch(() => reject(new Error("No se pudo abrir la foto. Prueba con una imagen JPG, PNG o HEIC.")));
  });
}

export function PhotoUploader({ onAnalyze, onAddFoods }: PhotoUploaderProps) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detectedFoods, setDetectedFoods] = useState<EditableFood[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function selectPhoto(file: File | undefined) {
    if (!file) return;
    if (!isSupportedFoodImage(file.type, file.size)) {
      toast.error(`Elige una foto JPG, PNG o HEIC de hasta ${Math.round(MAX_FOOD_IMAGE_BYTES / 1024 / 1024)} MB.`);
      return;
    }
    setDetectedFoods([]);
    setPhoto(file);
  }

  async function analyze() {
    if (!photo) return;
    setIsAnalyzing(true);
    try {
      const imageDataUrl = await preparePhoto(photo);
      const foods = await onAnalyze(imageDataUrl);
      setDetectedFoods(foods.map((food) => ({ ...food, selected: true, expiresAt: addDays(3) })));
      if (foods.length === 0) toast.info("No encontramos alimentos claros en esta foto.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo analizar la foto.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function updateFood(index: number, patch: Partial<EditableFood>) {
    setDetectedFoods((foods) => foods.map((food, foodIndex) =>
      foodIndex === index ? { ...food, ...patch } : food,
    ));
  }

  function addSelectedFoods() {
    const foods = detectedFoods
      .filter((food) => food.selected && food.name.trim())
      .map(({ name, quantity, expiresAt }) => ({ name: name.trim(), quantity: quantity.trim(), expiresAt }));
    if (foods.length === 0) return;
    onAddFoods(foods);
    setDetectedFoods([]);
  }

  function clearPhoto() {
    setPhoto(null);
    setDetectedFoods([]);
  }

  return (
    <section className="rounded-[18px] border border-frostline bg-card/70 p-4 sm:p-5" aria-label="Agregar alimentos con una foto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-semibold text-ink">
            <ScanLine className="size-4 text-cold" aria-hidden="true" />
            Agrega alimentos con una foto
          </div>
          <p className="mt-1 text-sm text-mist">Toma una foto o elige una imagen para identificar varios alimentos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={cameraInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            capture="environment"
            className="sr-only"
            aria-label="Tomar foto de alimentos"
            onChange={(event) => {
              selectPhoto(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
          <input
            ref={galleryInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="sr-only"
            aria-label="Elegir foto de alimentos"
            onChange={(event) => {
              selectPhoto(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
          <Button type="button" variant="outline" className="rounded-full" onClick={() => cameraInput.current?.click()}>
            <Camera aria-hidden="true" />
            Tomar foto
          </Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => galleryInput.current?.click()}>
            <ImageUp aria-hidden="true" />
            Subir foto
          </Button>
        </div>
      </div>

      {preview && (
        <div className="mt-5 grid gap-5 border-t border-frostline pt-5 md:grid-cols-[minmax(180px,260px)_1fr]">
          <div className="relative">
            <img src={preview} alt="Foto seleccionada de alimentos" className="aspect-[4/3] w-full rounded-lg object-cover" />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
              aria-label="Quitar foto"
              onClick={clearPhoto}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          <div className="min-w-0">
            {detectedFoods.length === 0 ? (
              <div className="flex min-h-32 flex-col items-start justify-center gap-3">
                <p className="text-sm text-mist">La cantidad es aproximada. La foto no permite saber la fecha de vencimiento.</p>
                <Button type="button" className="rounded-full" onClick={analyze} disabled={isAnalyzing}>
                  {isAnalyzing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <ScanLine aria-hidden="true" />}
                  {isAnalyzing ? "Analizando foto…" : "Identificar alimentos"}
                </Button>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm font-semibold text-ink">Revisa los alimentos y su vencimiento</p>
                <div className="divide-y divide-frostline border-y border-frostline">
                  {detectedFoods.map((food, index) => (
                    <div key={`${food.name}-${index}`} className="grid gap-2 py-3 sm:grid-cols-[auto_minmax(120px,1fr)_minmax(100px,0.7fr)_auto] sm:items-center">
                      <Checkbox
                        checked={food.selected}
                        onCheckedChange={(checked) => updateFood(index, { selected: checked === true })}
                        aria-label={`Seleccionar ${food.name}`}
                      />
                      <input
                        value={food.name}
                        maxLength={100}
                        aria-label={`Nombre del alimento ${index + 1}`}
                        onChange={(event) => updateFood(index, { name: event.target.value })}
                        className="min-w-0 rounded-md border border-frostline bg-ice px-3 py-2 text-sm outline-none focus:border-glow"
                      />
                      <input
                        value={food.quantity}
                        maxLength={60}
                        aria-label={`Cantidad del alimento ${index + 1}`}
                        placeholder="Cantidad aproximada"
                        onChange={(event) => updateFood(index, { quantity: event.target.value })}
                        className="min-w-0 rounded-md border border-frostline bg-ice px-3 py-2 text-sm outline-none placeholder:text-mist/70 focus:border-glow"
                      />
                      <input
                        type="date"
                        value={food.expiresAt}
                        aria-label={`Vencimiento del alimento ${index + 1}`}
                        onChange={(event) => updateFood(index, { expiresAt: event.target.value })}
                        className="min-w-0 rounded-md border border-frostline bg-ice px-2 py-2 font-mono text-xs outline-none focus:border-glow"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-mist">Confirma la fecha en el envase; las fechas iniciales son solo sugerencias.</p>
                <Button
                  type="button"
                  className="mt-3 rounded-full"
                  onClick={addSelectedFoods}
                  disabled={!detectedFoods.some((food) => food.selected && food.name.trim())}
                >
                  <ScanLine aria-hidden="true" />
                  Agregar seleccionados
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
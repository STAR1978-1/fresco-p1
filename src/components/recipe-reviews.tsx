import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  averageRating,
  recipeKey,
  reviewsFor,
  type RecipeReview,
} from "@/lib/reviews";

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`font-mono text-xs ${className}`} aria-label={`${value} de 5`}>
      {"★".repeat(Math.round(value))}
      {"☆".repeat(Math.max(0, 5 - Math.round(value)))}
    </span>
  );
}

export function ReviewSummary({
  reviews,
  title,
}: {
  reviews: RecipeReview[];
  title: string;
}) {
  const list = reviewsFor(reviews, title);
  if (list.length === 0) {
    return <span className="font-mono text-xs text-mist">Sin reseñas</span>;
  }
  return (
    <span className="flex items-center gap-1.5">
      <Stars value={averageRating(list)} className="text-glow" />
      <span className="font-mono text-xs text-mist">
        {averageRating(list).toFixed(1)} · {list.length}
      </span>
    </span>
  );
}

export function RecipeReviews({
  title,
  reviews,
  onAdd,
}: {
  title: string;
  reviews: RecipeReview[];
  onAdd: (review: RecipeReview) => void;
}) {
  const [open, setOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const list = useMemo(() => reviewsFor(reviews, title), [reviews, title]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Escribe un consejo o comentario.");
      return;
    }
    onAdd({
      id: crypto.randomUUID(),
      recipeKey: recipeKey(title),
      author: author.trim() || "Anónimo",
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    });
    setComment("");
    setAuthor("");
    setRating(5);
    toast.success("Reseña publicada. ¡Gracias por el consejo!");
  };

  return (
    <div className="mt-4 border-t border-frostline pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between font-mono text-xs text-mist transition-colors hover:text-ink"
      >
        <span>
          Reseñas ({list.length})
          {list.length > 0 && ` · ${averageRating(list).toFixed(1)}/5`}
        </span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {list.length === 0 ? (
            <p className="text-sm text-mist">
              Nadie la ha reseñado aún. Sé el primero en dejar tus consejos.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {list.map((r) => (
                <li key={r.id} className="rounded-[12px] bg-frost/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{r.author}</span>
                    <Stars value={r.rating} className="text-glow" />
                  </div>
                  <p className="mt-1 text-sm text-mist">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={submit} className="space-y-2">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-full bg-frost px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-mist focus:ring-cold"
            />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} estrellas`}
                  className={`text-base leading-none transition-colors ${
                    n <= rating ? "text-glow" : "text-mist/50"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Cómo te salió? Deja un consejo…"
              rows={2}
              className="w-full rounded-[12px] bg-frost px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-mist focus:ring-cold"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ice transition-colors hover:bg-ink/90"
            >
              Publicar reseña
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

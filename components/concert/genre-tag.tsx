import { accentTint, type Accent } from "@/lib/accent";
import { cn } from "@/lib/cn";

type GenreTagProps = {
  genre: string;
  /** Décorative, fournie par l'appelant — jamais déduite du genre (D7). */
  accent: Accent;
  className?: string;
};

export function GenreTag({ genre, accent, className }: GenreTagProps) {
  return (
    <span
      className={cn(
        "rounded-[20px] px-2 py-[3px] text-[9px] font-semibold tracking-[0.5px] uppercase",
        accentTint[accent],
        className,
      )}
    >
      {genre}
    </span>
  );
}

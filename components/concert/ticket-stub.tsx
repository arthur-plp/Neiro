import { GenreTag } from "@/components/concert/genre-tag";
import { accentBackground, type Accent } from "@/lib/accent";
import { cn } from "@/lib/cn";

type TicketStubProps = {
  artist: string;
  /** Salle et ville, déjà assemblées par l'appelant. */
  venue: string;
  /** Date déjà formatée — la primitive ne fait pas de mise en forme de date. */
  date: string;
  genre: string;
  /** Décorative, fournie par l'appelant — jamais déduite du genre (D7). */
  accent: Accent;
  /** Note globale de 0 à 5, en étoiles. Omise, aucune étoile n'est affichée. */
  rating?: number;
  className?: string;
};

/**
 * L'élément signature de Neiro : un concert présenté comme une vraie souche
 * de billet.
 *
 * À poser sur un fond `surface` : les encoches latérales sont des
 * pseudo-éléments remplis de cette couleur qui mordent sur les bords pour
 * simuler la perforation (décision D5). Sur un autre fond, elles
 * apparaîtraient comme deux pastilles de la mauvaise couleur.
 *
 * En liste, les souches penchent alternativement d'un côté puis de l'autre
 * via `odd:`/`even:` — une alternance déterministe, et non un tirage
 * aléatoire qui provoquerait un désaccord d'hydratation (décision D4).
 */
export function TicketStub({
  artist,
  venue,
  date,
  genre,
  accent,
  rating,
  className,
}: TicketStubProps) {
  return (
    <article
      className={cn(
        "bg-surface-alt border-border relative flex items-center gap-[14px] rounded-[18px] border px-[18px] py-4",
        "odd:rotate-[-0.6deg] even:rotate-[0.5deg]",
        "before:bg-surface before:absolute before:top-1/2 before:-left-2 before:size-4 before:-translate-y-1/2 before:rounded-full before:content-['']",
        "after:bg-surface after:absolute after:top-1/2 after:-right-2 after:size-4 after:-translate-y-1/2 after:rounded-full after:content-['']",
        className,
      )}
    >
      <div
        className={cn(
          "w-1.5 shrink-0 self-stretch rounded-[4px]",
          accentBackground[accent],
        )}
      />
      {/* Ligne de déchirure. Volontairement très peu contrastée, comme dans
          la maquette : elle suggère la perforation sans capter le regard. */}
      <div
        aria-hidden
        className="border-border absolute top-2 bottom-2 left-16 border-l-2 border-dashed"
      />
      <div className="min-w-0 flex-1 pl-[14px]">
        <h3 className="font-display truncate text-[17px] leading-[1.1] tracking-[0.3px]">
          {artist}
        </h3>
        <p className="text-text-muted mt-[3px] truncate text-xs">{venue}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <GenreTag genre={genre} accent={accent} />
          <span className="text-text-muted font-mono text-[10px]">{date}</span>
        </div>
      </div>
      {rating !== undefined && (
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div
            className="text-accent-amber text-xs tracking-[1px]"
            aria-label={`Note : ${rating} sur 5`}
          >
            {"★".repeat(rating)}
          </div>
        </div>
      )}
    </article>
  );
}

import Link from "next/link";

type ScreenHeaderProps = {
  titre: string;
  sousTitre?: string;
  /** Présent sur les écrans secondaires, absent sur les quatre destinations. */
  retour?: { href: string; label: string };
};

export function ScreenHeader({ titre, sousTitre, retour }: ScreenHeaderProps) {
  return (
    <header className="mb-4">
      {retour && (
        <div className="mb-3.5 flex items-center gap-2.5">
          <Link
            href={retour.href}
            aria-label={retour.label}
            className="bg-surface-alt border-border flex size-8 shrink-0 items-center justify-center rounded-[10px] border"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="size-4"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <span className="text-text-muted text-[12px]">{retour.label}</span>
        </div>
      )}
      <h1 className="font-display text-[30px] tracking-[0.5px]">{titre}</h1>
      {sousTitre && (
        <p className="text-text-muted mt-0.5 text-xs">{sousTitre}</p>
      )}
    </header>
  );
}

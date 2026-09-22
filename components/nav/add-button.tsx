import Link from "next/link";

/**
 * Le bouton d'ajout, au-dessus de la barre de navigation et dans la zone du
 * pouce. Fixe plutôt qu'en fin de page : il doit rester atteignable sans
 * défilement, quelle que soit la longueur de l'écran.
 */
export function AddButton() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[82px] z-20 mx-auto max-w-[390px]">
      <Link
        href="/ajouter"
        aria-label="Ajouter un concert"
        // `bottom-0` sur un conteneur de hauteur nulle : le bouton repose sur
        // la ligne des 82 px au lieu de se déployer vers le bas et de passer
        // sous la barre de navigation, haute de 78 px.
        className="from-accent-hot to-accent-amber pointer-events-auto absolute right-5 bottom-0 flex size-14 -rotate-3 items-center justify-center rounded-2xl bg-linear-to-br/srgb shadow-[0_8px_24px_color-mix(in_srgb,var(--color-accent-hot)_40%,transparent)]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1a1220"
          strokeWidth={2.4}
          strokeLinecap="round"
          className="size-[22px]"
          aria-hidden
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </div>
  );
}

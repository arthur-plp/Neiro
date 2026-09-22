import Link from "next/link";

import { AddButton } from "@/components/nav/add-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getProfile, initiale } from "@/lib/auth";

export default async function AccueilPage() {
  const profil = await getProfile();

  return (
    <>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-display from-accent-hot to-accent-amber bg-linear-to-r/srgb bg-clip-text text-[26px] tracking-[1px] text-transparent">
            NEIRO
          </p>
          <p className="text-text-muted -mt-1 text-[11px]">
            Ton journal de concerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/frise"
            aria-label="Frise chronologique"
            className="bg-surface-alt border-border flex size-9 items-center justify-center rounded-xl border"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4" aria-hidden>
              <path d="M12 3v18M6 8l6-5 6 5M6 16l6 5 6-5" />
            </svg>
          </Link>
          <Link
            href="/amis/recherche"
            aria-label="Rechercher des profils"
            className="bg-surface-alt border-border flex size-9 items-center justify-center rounded-xl border"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </Link>
          <Link
            href="/profil"
            aria-label={`Profil de ${profil?.display_name ?? "l'utilisateur"}`}
            className="font-display from-accent-violet to-accent-hot flex size-9 items-center justify-center rounded-full bg-linear-to-br/srgb text-[13px]"
          >
            {initiale(profil?.display_name)}
          </Link>
        </div>
      </header>

      <EmptyState
        className="mt-6"
        titre="Aucun concert pour l'instant"
        explication="Ton fil se remplira à mesure que tu noteras les concerts que tu vois. Le premier est le plus dur."
        action={{ href: "/ajouter", label: "Ajouter mon premier concert" }}
      />
      <AddButton />
    </>
  );
}

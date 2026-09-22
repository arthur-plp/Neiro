"use client";

/**
 * Chaque pastille affiche la valeur *réellement calculée* par le navigateur
 * pour son token, et non une valeur recopiée : une dérive entre la palette
 * déclarée et celle du cahier des charges se voit ici immédiatement, et
 * aucune valeur de la palette n'est dupliquée hors de `globals.css`.
 *
 * La lecture se fait dans une ref callback plutôt que dans un effet avec
 * état : il n'y a rien à conserver entre deux rendus, seulement une valeur
 * à écrire une fois le nœud monté.
 */

const ROLES = [
  "bg",
  "surface",
  "surface-alt",
  "border",
  "text",
  "text-muted",
  "accent-hot",
  "accent-amber",
  "accent-violet",
  "accent-teal",
] as const;

type Role = (typeof ROLES)[number];

const CLASSES: Record<Role, string> = {
  bg: "bg-bg",
  surface: "bg-surface",
  "surface-alt": "bg-surface-alt",
  border: "bg-border",
  text: "bg-text",
  "text-muted": "bg-text-muted",
  "accent-hot": "bg-accent-hot",
  "accent-amber": "bg-accent-amber",
  "accent-violet": "bg-accent-violet",
  "accent-teal": "bg-accent-teal",
};

function afficherValeur(role: Role) {
  return (noeud: HTMLSpanElement | null) => {
    if (!noeud) return;
    const valeur = getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-${role}`)
      .trim()
      .toUpperCase();
    noeud.textContent = valeur || "non déclarée";
  };
}

export function PalettePreview() {
  return (
    <ul className="space-y-2">
      {ROLES.map((role) => (
        <li key={role} className="flex items-center gap-3">
          <span
            className={`border-border size-9 shrink-0 rounded-xl border ${CLASSES[role]}`}
          />
          <span className="flex-1 text-[13px]">{role}</span>
          <span
            ref={afficherValeur(role)}
            className="text-text-muted font-mono text-[11px]"
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * Les quatre accents de la palette.
 *
 * La couleur d'une souche est décorative : elle est toujours choisie par
 * l'appelant et n'est jamais dérivée d'une donnée du concert, le genre
 * compris (décision D7 — la maquette donne deux couleurs différentes aux
 * deux concerts d'un même artiste). La règle qui attribuera une couleur à
 * un concert réel sera arrêtée à l'étape 4, avec le modèle de données.
 */
export type Accent = "hot" | "amber" | "violet" | "teal";

export const ACCENTS: readonly Accent[] = ["hot", "amber", "violet", "teal"];

/** Aplat plein — bande latérale d'une souche, pastille de frise. */
export const accentBackground: Record<Accent, string> = {
  hot: "bg-accent-hot",
  amber: "bg-accent-amber",
  violet: "bg-accent-violet",
  teal: "bg-accent-teal",
};

/** Texte à pleine couleur sur un fond de la même couleur à 18 % — tags. */
export const accentTint: Record<Accent, string> = {
  hot: "bg-accent-hot/18 text-accent-hot",
  amber: "bg-accent-amber/18 text-accent-amber",
  violet: "bg-accent-violet/18 text-accent-violet",
  teal: "bg-accent-teal/18 text-accent-teal",
};

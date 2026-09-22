# Design

## Context

Dépôt greenfield : il ne contient que `neiro-cahier-des-charges.md`, `neiro-maquette.html`, `CLAUDE.md` et l'outillage OpenSpec. Aucun `package.json`. Voir `proposal.md` — Why pour la motivation.

Trois contraintes cadrent l'approche :

1. **La maquette fait autorité.** `neiro-maquette.html` est un prototype complet et validé ; le travail consiste à en extraire le vocabulaire, pas à le réinterpréter. Toutes les valeurs de ce document proviennent de la lecture directe de son bloc `<style>` (lignes 10–313).
2. **Palier gratuit strict.** Aucune dépendance ou service hors gratuit, et aucune brique hors de la stack actée en section 7 du cahier des charges.
3. **L'exigence hors-ligne remonte jusqu'ici.** L'écran Billets doit fonctionner sans réseau (étape 5). Cela disqualifie dès le socle tout actif chargé depuis un domaine tiers à l'exécution — à commencer par les polices.

Ce change est aussi le premier de la section 10 : tout ce qui suit s'appuie dessus, donc les décisions structurantes (organisation des dossiers, source de vérité des tokens) engagent l'ensemble du projet.

## Goals / Non-Goals

**Goals :**

- Un projet Next.js qui démarre, compile et passe le lint sans erreur.
- Une source de vérité unique pour la palette et les typographies, consommable partout en classes utilitaires.
- Les primitives visuelles récurrentes de la maquette disponibles comme composants, la souche de billet en tête.
- Une page de vérification permettant de constater la fidélité au pixel plutôt que de la supposer.
- Une arborescence de dossiers qui tiendra jusqu'à l'étape 9 sans réorganisation.

**Non-Goals :**

- Aucune donnée, aucun état, aucun appel réseau — pas de Supabase, pas de TanStack Query, pas de Zustand dans ce change. Ces dépendances arrivent quand un écran réel en a besoin.
- Aucune navigation entre écrans de produit : la barre de navigation basse et le squelette d'écrans relèvent de l'étape 3.
- Aucun service worker ni manifest PWA livrés : étapes 5 et 9. La vérification Serwist décrite en R1 est un spike jetable, retiré avant la fin du change — elle valide une décision de cette étape, elle ne livre rien de l'étape 5.
- Aucun composant métier (carte de concert connectée, formulaire d'ajout) : seulement des primitives sans logique.

## Decisions

### D1 — Next.js 16 plutôt que 15

Le cahier des charges fixe Next.js 15, écrit à une époque où c'était la version courante. Next 16 est stable depuis octobre 2025 et en est à sa version 16.3.5 ; Next 15 n'est plus sur la ligne principale.

**Décision : partir sur Next 16**, et amender `neiro-cahier-des-charges.md` (section 7) ainsi que `CLAUDE.md` pour que la documentation cesse de contredire le code.

Rationale : l'App Router, les Server Components et l'ensemble des mécanismes décrits dans le cahier des charges sont inchangés entre 15 et 16 — le cahier reste valable sur le fond. Démarrer sur 15 signifierait planifier une migration à brève échéance pour un projet qui vient de naître.

Alternative écartée : rester sur 15.5.x, strictement conforme au document. Écartée parce que le seul bénéfice réel était l'ancienneté de la combinaison Serwist 9 + Next 15, et que Serwist supporte Next 16 (voir R1).

### D2 — Tokens définis en CSS via `@theme`, pas de `tailwind.config.ts`

Tailwind v4 privilégie une configuration CSS-first : les tokens se déclarent dans un bloc `@theme` au sein de `app/globals.css`, et Tailwind en dérive automatiquement les utilitaires (`bg-surface-alt`, `text-accent-amber`, `border-border`…) ainsi que les variables CSS correspondantes.

**Décision : tout déclarer dans `app/globals.css`, sans fichier de configuration JavaScript.**

Rationale : un seul endroit à ouvrir pour changer une couleur, et les mêmes noms de rôle sont disponibles à la fois en classe Tailwind et en `var(--color-…)` pour les rares cas (dégradés, pseudo-éléments) où une classe utilitaire ne suffit pas. Cela satisfait directement l'exigence « changer un token se propage partout » de la spec.

Alternative écartée : `tailwind.config.ts` à l'ancienne. Écartée car elle duplique la définition des tokens entre JS et CSS et n'est plus la voie recommandée en v4.

### D3 — Polices auto-hébergées via `next/font/google`

**Décision : charger Anton, Space Grotesk et IBM Plex Mono via `next/font/google`**, exposées en variables CSS (`--font-display`, `--font-body`, `--font-mono`) et branchées sur les familles du bloc `@theme`.

Rationale : `next/font` télécharge les fichiers au build et les sert depuis l'origine de l'application. Cela répond à trois besoins d'un coup — l'exigence hors-ligne, l'absence de requête vers un tiers à l'exécution, et la suppression du décalage de mise en page au chargement. La maquette utilise un `<link>` vers Google Fonts, ce qui convient à un prototype mais pas à une PWA censée fonctionner en mode avion.

Nuance à connaître : Anton ne possède qu'une seule graisse (400). Les titres de la maquette tirent leur présence de la taille et du condensé, pas d'une graisse élevée — il ne faut donc pas chercher à lui appliquer `font-bold`.

### D4 — Rotation des souches déterministe, pas aléatoire

Le cahier des charges parle d'une « légère rotation aléatoire ». La maquette, elle, implémente en réalité une alternance fixe : `nth-child(odd)` penche de `-0.6deg`, `nth-child(even)` de `0.5deg`.

**Décision : reprendre l'alternance déterministe de la maquette.**

Rationale : c'est ce que la maquette fait réellement, et une rotation tirée au sort côté client produirait un écart entre le rendu serveur et le rendu client — le désaccord d'hydratation classique des Server Components. Le rendu obtenu est visuellement équivalent et reproductible d'un chargement à l'autre.

### D5 — Les encoches de la souche déclarent la couleur du fond sur lequel elles reposent

Les encoches rondes sont des pseudo-éléments remplis de la couleur du fond, qui « mordent » sur les bords de la carte pour simuler la perforation. Elles ne sont donc correctes que si la souche repose bien sur ce fond.

**Décision : la souche pose ses encoches en `surface` et documente cette contrainte dans son fichier.** Une souche placée sur un fond différent afficherait deux pastilles de la mauvaise couleur.

Alternative envisagée puis écartée pour l'instant : un masque CSS (`mask-image` avec deux gradients radiaux), indépendant du fond mais nettement plus difficile à lire et à ajuster. À reconsidérer seulement si le besoin d'afficher une souche sur un autre fond apparaît.

### D6 — Server Components par défaut, `"use client"` réservé aux primitives interactives

Souche de billet, puce de statistique, tag de genre et bouton principal ne portent aucun état : ils restent des Server Components. Seuls le contrôle segmenté et la chip de filtre, qui gèrent une sélection, sont marqués `"use client"`.

Rationale : conforme à la convention posée dans `CLAUDE.md`, et cela garde le JavaScript envoyé au navigateur minimal — ce qui comptera pour une PWA consultée sur mobile.

### D7 — La couleur d'accent est décorative et reçue en prop, pas dérivée du genre

La maquette a d'abord donné l'impression que la couleur encodait le genre : dans une souche, la bande latérale et le tag de genre s'accordent systématiquement. Le dépouillement complet du fichier dit autre chose.

| Artiste | Dans le fil (`.stub`) | Dans la frise (`.tl-dot`) |
|---|---|---|
| Nova Wave | violet | violet, puis **teal** à sa seconde occurrence |
| Argile | teal | **amber** |
| Volt | amber | **violet** |
| Les Archives | hot | hot |

La couleur n'est donc stable ni par genre, ni par artiste, ni même par concert d'un écran à l'autre. C'est de la variété décorative, posée à la main écran par écran pour que le mur de souches respire. La seule invariance réelle est interne à une carte — la bande et le tag s'accordent — c'est-à-dire la cohérence d'un composant, pas un encodage.

**Décision : la souche reçoit sa couleur d'accent en prop. Ce change n'introduit aucune règle de dérivation, donc pas de table genre → couleur ni de fichier `lib/genre-colors.ts`.** Le tag de genre d'une souche utilise la même couleur que sa bande, ce qui reproduit la seule invariance observée.

Rationale : une table genre → couleur inventerait une sémantique que le design n'a jamais eue, et l'imposerait à tous les écrans suivants. Le vocabulaire visuel de cette étape est « une souche a une couleur d'accent » ; **laquelle** revient à un concert donné est une règle produit qui appartient à l'étape 4, avec le modèle de données. La décision est donc reportée, pas esquivée.

Alternative écartée : hacher sur le nom de l'artiste pour donner à chaque artiste sa couleur d'identité. Séduisant, mais c'est inventer un autre sens tout aussi absent de la maquette — laquelle donne justement deux couleurs différentes aux deux concerts de Nova Wave.

Recommandation pour l'étape 4, à trancher là-bas : un hachage stable sur l'**identifiant du concert**. C'est la règle minimale qui garantit la seule propriété qu'un utilisateur puisse remarquer — un même concert garde sa couleur du fil à la frise — et elle reproduit au passage le cas Nova Wave.

### D8 — Arborescence

```
app/
  layout.tsx            # polices, fond d'ambiance, métadonnées, lang="fr"
  globals.css           # @theme : tokens de couleur et de police, styles de base
  page.tsx              # provisoire, remplacé par l'accueil réel à l'étape 3
  design-system/page.tsx # page de vérification
components/
  ui/                   # primitives sans métier : chip, segmented, stat-chip, button…
  concert/              # primitives orientées domaine : ticket-stub, genre-tag
lib/
  cn.ts                 # concaténation de classes conditionnelles
```

Un composant par fichier, nommé en `kebab-case`, exportant un composant en `PascalCase` — la convention de `CLAUDE.md`.

`components/` est séparé de `app/` pour que la frontière entre routes et composants réutilisables reste nette quand les écrans se multiplieront.

### D9 — Pas de librairie de composants ni d'utilitaire de variantes

Les primitives sont écrites à la main en classes Tailwind. Aucune librairie de composants (shadcn/ui, Radix…) ni gestionnaire de variantes (`cva`, `tailwind-variants`) n'est introduit.

Rationale : `CLAUDE.md` interdit d'ajouter une librairie de composants sans discussion préalable, et le design à reproduire est très typé — une librairie généraliste demanderait plus d'efforts de dé-stylisation que d'écriture directe. Les primitives concernées font quelques dizaines de lignes chacune.

Pour les classes conditionnelles, une fonction `cn` d'une ligne suffit ; `clsx` et `tailwind-merge` ne seront ajoutés que si un vrai besoin de fusion de classes apparaît.

## Risks / Trade-offs

**R1 — L'intégration Serwist sous Next 16 passe par Turbopack et touche le layout racine.** L'exigence hors-ligne n'est pas négociable, et D1 introduit une combinaison que le cahier des charges n'avait pas anticipée. Vérification faite, la question n'est pas « est-ce que ça marche » mais « sous quelle forme » :

- Next 16 utilise Turbopack par défaut en développement **comme en build**, donc le wrapper `withSerwist` webpack décrit par la plupart des tutoriels ne s'applique pas.
- Serwist fournit un chemin Turbopack dédié et **publié en stable** (`@serwist/turbopack@9.5.12`, pas seulement en preview) : un `withSerwist` issu de ce package, `esbuild` en peer, un `app/sw.ts`, un route handler `app/serwist/[path]/route.ts`, et un `SerwistProvider` **dans `app/layout.tsx`**.

Ce dernier point est ce qui rend le risque non orthogonal à ce change : l'intégration s'insère dans le fichier que cette étape crée.

→ Mitigation : **une vérification jetable intercalée juste après l'initialisation du projet** (groupe de tâches 3), avant d'écrire les tokens et les primitives — Serwist minimal câblé, build lancé, service worker émis constaté, puis spike retiré. C'est le seul moment où se tromper ne coûte rien.

Le repli en cas d'échec reste de figer Next sur 15.5.x pour retrouver le chemin webpack éprouvé. **Ce repli n'est bon marché que maintenant** : à l'étape 5, il s'agirait de rétrograder le framework d'une application qui tourne, avec quatre étapes de code par-dessus. C'est précisément pourquoi la vérification est avancée ici plutôt que reportée.

**R2 — Une page de vérification qui se périme.** `/design-system` n'apporte de valeur que si elle est tenue à jour quand une primitive évolue. → Mitigation : elle reste volontairement minimale et vit dans le même dépôt ; toute étape ultérieure qui ajoute une primitive l'y ajoute aussi. Si elle décroche malgré tout, elle sera supprimée plutôt que laissée trompeuse.

**R3 — La maquette est conçue pour un écran de 390 px.** Elle est enfermée dans un cadre de téléphone fixe ; le vrai produit devra tenir de 320 px à un écran de bureau. → Mitigation : ce change ne fige aucune largeur. Les primitives sont fluides et s'adaptent à leur conteneur ; le cadrage de la page appartient au squelette de navigation de l'étape 3, où la question se posera avec les vrais écrans.

**R4 — Fidélité déclarée plutôt que constatée.** Le risque principal de cette étape est de croire le design reproduit alors qu'il ne l'est pas. → Mitigation : la validation passe par une comparaison visuelle côte à côte avec `neiro-maquette.html`, pas par la seule réussite du build.

**Trade-off assumé — pas de tests automatisés dans ce change.** Il ne contient aucune logique non triviale : des tokens, du balisage et des classes. `CLAUDE.md` ne les exige pas à cette échelle, et un test ne dirait rien de la fidélité visuelle, qui est précisément ce qu'il faut vérifier ici.

## Migration Plan

Sans objet : création initiale, aucune donnée ni utilisateur existants. Le rollback consiste à revenir au commit précédent — le dépôt ne contient aujourd'hui que de la documentation.

## Open Questions

- **Icône et nom court de la PWA.** Le manifest doit reprendre le nom Neiro et une icône cohérente avec l'identité visuelle. Ni l'icône ni sa source ne sont définies. Reportable sans risque : le manifest relève de l'étape 9, et la réponse ne change ni les specs ni les tâches de ce change.

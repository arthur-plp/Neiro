# Proposal

## Why

Le projet Neiro n'existe aujourd'hui que sous forme de documentation (`neiro-cahier-des-charges.md`) et de maquette statique (`neiro-maquette.html`). Aucune base de code n'est en place, alors que toutes les étapes suivantes de la section 10 du cahier des charges (Supabase, auth, journal, billets, social, stats) supposent un projet Next.js opérationnel et un vocabulaire visuel déjà outillé.

Poser ce socle en premier évite le piège le plus coûteux du projet : réinterpréter le design au fil de l'eau. La maquette est validée ; ses couleurs, typographies et composants signature (la souche de billet) doivent devenir des tokens et des primitives réutilisables **avant** qu'un seul écran fonctionnel ne soit écrit, sinon chaque écran redéfinira ses propres valeurs.

## What Changes

- Initialisation du projet **Next.js 15 (App Router) + TypeScript strict** à la racine du dépôt, avec ESLint et la configuration de build.
- Mise en place de **Tailwind CSS v4** et traduction de la palette de la section 2 du cahier des charges en tokens de thème (`--color-bg`, `--color-surface`, `--color-accent-hot`, etc.), consommables comme classes utilitaires (`bg-surface-alt`, `text-accent-amber`…).
- Chargement des trois typographies (**Anton**, **Space Grotesk**, **IBM Plex Mono**) via `next/font/google` — auto-hébergées au build, donc disponibles hors-ligne et sans requête vers Google Fonts à l'exécution.
- Layout racine appliquant le fond « backstage » (fond sombre + deux halos radiaux violet/rose), la police de corps par défaut, la locale `fr` et les métadonnées de base.
- Une petite bibliothèque de **primitives visuelles** extraites de la maquette, chacune dans son propre fichier : souche de billet (`TicketStub`), puce de statistique, tag de genre, chip de filtre, bouton segmenté, bouton principal en dégradé.
- Une page de vérification `/design-system` affichant ces primitives côte à côte, permettant de comparer visuellement avec `neiro-maquette.html` et de valider la fidélité avant de construire le moindre écran réel.
- Respect de `prefers-reduced-motion` dès le socle, comme dans la maquette.

Non-goals de ce change : aucune donnée, aucune persistance, aucun Supabase, aucune navigation entre écrans réels, aucun service worker. Ces éléments arrivent aux étapes 2, 3 et 9.

## Capabilities

### New Capabilities

- `design-system`: le vocabulaire visuel partagé de l'application — tokens de couleur, échelle typographique, et primitives de composants reprises fidèlement de `neiro-maquette.html`. Cette capacité définit ce que tout écran ultérieur doit consommer plutôt que redéfinir.

### Modified Capabilities

Aucune — le projet ne contient encore aucune spec.

## Impact

**Code créé** : arborescence Next.js complète (`app/`, `components/`, `lib/`), `package.json`, `tsconfig.json` (mode strict), `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`, `app/globals.css`.

**Dépendances ajoutées** : `next`, `react`, `react-dom`, `typescript`, `tailwindcss` v4 + `@tailwindcss/postcss`, `eslint` + `eslint-config-next`, `@types/*`. Toutes gratuites et déjà actées en section 7 du cahier des charges. Aucune dépendance hors stack validée n'est introduite.

**Systèmes** : aucun service externe n'est sollicité à ce stade — pas de compte Supabase ni de déploiement Vercel requis pour que ce change soit vérifiable en local.

**Conséquence sur la suite** : les étapes 2 à 9 consommeront ces tokens et primitives. Tout écart visuel introduit ici se propagerait à l'ensemble de l'application, d'où la page `/design-system` comme garde-fou de validation.

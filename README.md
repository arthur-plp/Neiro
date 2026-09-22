# Neiro

PWA personnelle de suivi de concerts : journaliser les concerts vus, les noter critère par critère, garder ses billets consultables hors-ligne et se comparer à ses amis.

**Neiro** (音色) est le mot japonais pour le timbre — la couleur propre d'un son, ce qui rend chaque interprétation unique.

Application personnelle et gratuite, pensée pour un utilisateur principal et un cercle d'amis restreint. Aucune brique payante.

## État du projet

En construction. Le socle applicatif est **planifié mais pas encore implémenté** — il n'y a pas encore de code exécutable dans ce dépôt.

| # | Étape | État |
|---|---|---|
| 1 | Socle Next.js, Tailwind, tokens de design | Planifié |
| 2 | Supabase : schéma Drizzle, RLS de base | À venir |
| 3 | Authentification magic link, squelette de navigation | À venir |
| 4 | Journal de concerts : CRUD, notation, setlist, avant/après | À venir |
| 5 | Billets : compte à rebours, cache hors-ligne, rappels | À venir |
| 6 | Social : amis, compagnons, RLS partagée | À venir |
| 7 | Stats : classement, badges, records, récap annuel | À venir |
| 8 | Import de billet par dépôt de PDF | À venir |
| 9 | PWA finale : manifest, icônes, tests hors-ligne | À venir |

## Stack

| Brique | Choix |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| Styles | Tailwind CSS v4 |
| Base de données | Supabase (Postgres) + Row Level Security |
| ORM & migrations | Drizzle |
| Authentification | Supabase Auth (magic link) |
| Données côté client | TanStack Query |
| Formulaires | React Hook Form + Zod |
| État UI local | Zustand |
| PWA | Serwist |
| Hébergement | Vercel |

## Documentation

| Fichier | Contenu |
|---|---|
| [`neiro-cahier-des-charges.md`](./neiro-cahier-des-charges.md) | Concept, écrans, modèle de données, stack, ordre de construction. Fait autorité sur les décisions produit. |
| [`neiro-maquette.html`](./neiro-maquette.html) | Maquette visuelle interactive. Référence exacte du design — à ouvrir dans un navigateur avant tout travail visuel. |
| [`CLAUDE.md`](./CLAUDE.md) | Conventions de code et règles de contribution. |

## Développement spécifié

Le développement est structuré avec [OpenSpec](https://github.com/Fission-AI/OpenSpec) : chaque étape est décrite — pourquoi, quoi, comment, et la liste des tâches — avant d'être implémentée.

```bash
openspec list                                  # les changes en cours
openspec show socle-nextjs-design-tokens       # le détail d'un change
openspec validate socle-nextjs-design-tokens   # vérifier sa cohérence
```

Les changes vivent dans [`openspec/changes/`](./openspec/changes/), les specs consolidées dans `openspec/specs/`.

## Démarrage

Rien à lancer pour l'instant : les commandes d'installation et de développement arriveront avec l'implémentation de l'étape 1.

## Identité visuelle

| Rôle | Couleur |
|---|---|
| Fond | `#0B0B14` |
| Surface | `#17161F` |
| Surface alternative | `#211F2C` |
| Bordure | `#2B293A` |
| Texte | `#F5F3FF` |
| Texte atténué | `#8D89A0` |
| Accent rose | `#FF3D68` |
| Accent ambre | `#FFC857` |
| Accent violet | `#8B7CFA` |
| Accent teal | `#2DD4BF` |

Typographies : **Anton** (titres), **Space Grotesk** (interface), **IBM Plex Mono** (dates et données).

Élément signature : les concerts s'affichent comme de vraies souches de billet — encoches latérales, ligne de déchirure pointillée, légère rotation.

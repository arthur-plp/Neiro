# CLAUDE.md — Neiro

Ce fichier cadre tout travail de développement sur le projet **Neiro**, PWA personnelle de suivi de concerts. Lis-le avant toute action, et relis-le si tu hésites sur une décision de structure, de dépendance ou de convention.

## Avant de commencer

1. Lis en entier `neiro-cahier-des-charges.md` — il contient le concept, les écrans, le modèle de données, la stack retenue et l'ordre de construction (section 10). Ce fichier fait autorité sur les décisions produit et techniques.
2. Ouvre `neiro-maquette.html` dans un navigateur pour voir le design réel avant d'écrire le moindre composant visuel. C'est la référence exacte — pas une inspiration vague. Couleurs, typographies, espacements, forme des composants (souches de billet, cartes, etc.) doivent être repris fidèlement, pas réinterprétés.
3. **Ne saute pas l'ordre de construction de la section 10 du cahier des charges.** Chaque étape dépend de la précédente (l'auth doit exister avant le journal, la RLS de base avant le volet social, etc.). Si une étape semble bloquer, remonte le problème plutôt que de contourner l'ordre.
4. Si une information manque ou qu'une décision produit n'est pas tranchée dans le cahier des charges, pose la question plutôt que de supposer. Ne comble pas les zones grises par des suppositions silencieuses, surtout sur le modèle de données ou les permissions.

## Contexte projet

- Application **personnelle et gratuite**, pas un produit commercial. Toute dépendance, tout service, tout choix technique doit rester sur un palier 100% gratuit (voir section 6 du cahier des charges pour le socle retenu et pourquoi).
- Utilisateur principal + un cercle d'amis restreint. Pas besoin de scalabilité au-delà de quelques centaines d'utilisateurs.
- Priorité : que ça marche bien et simplement, pas que ça impressionne techniquement. En cas de doute entre une solution simple et une solution "propre mais complexe", privilégie la simple, sauf si le cahier des charges dit explicitement le contraire (RLS, par exemple, n'est pas négociable).

## Stack (voir section 7 du cahier des charges pour le détail)

- Next.js 16 (App Router) + TypeScript strict
- Tailwind CSS
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Drizzle ORM
- Serwist (PWA/service worker)
- TanStack Query
- React Hook Form + Zod
- Zustand (état UI local uniquement)

**Ne pas introduire d'autre dépendance majeure sans la mentionner explicitement avant de le faire** (nouveau state manager, nouvel ORM, nouvelle librairie de composants UI, service payant...). Si un besoin réel apparaît en cours de route, propose l'ajout avec une justification courte plutôt que de l'installer directement.

## Conventions de code

- TypeScript strict partout, pas de `any` sans commentaire justifiant pourquoi.
- Composants React en fonctions, Server Components par défaut (App Router), `"use client"` seulement quand c'est nécessaire (interactivité, hooks, state).
- Nommage : `PascalCase` pour les composants, `camelCase` pour les fonctions/variables, `kebab-case` pour les noms de fichiers non-composants.
- Un composant = un fichier. Éviter les fichiers de plus de ~200 lignes ; découper en sous-composants si ça grossit.
- Styles : classes Tailwind directement dans le JSX, pas de CSS-in-JS ni de fichiers `.module.css` séparés sauf cas très spécifique (ex. keyframes complexes).
- Formulaires : toujours via React Hook Form + schéma Zod, jamais de gestion manuelle de state pour un formulaire à plus de 2 champs.
- Requêtes de données : toujours via TanStack Query côté client, jamais de `fetch` brut dans un composant sans passer par un hook dédié.

## Base de données & Supabase

- **Toute table exposée à plusieurs utilisateurs doit avoir une politique RLS avant d'être utilisée en front.** Pas d'exception, pas de "je l'ajouterai après" — une table sans RLS correctement testée ne doit pas être considérée comme terminée.
- Schéma et migrations gérés exclusivement via Drizzle (`drizzle-kit`), jamais de modification manuelle du schéma depuis l'interface Supabase en production une fois le projet lancé.
- Respecter le modèle de données de la section 5 du cahier des charges comme base ; si tu dois t'en écarter (normalisation différente, table supplémentaire...), explique pourquoi dans le commit ou la PR concernée.
- Aucune clé secrète (Supabase service role key, etc.) dans le code ou committée. Tout passe par des variables d'environnement (`.env.local`, jamais suivi par git).

## PWA & hors-ligne

- Les écrans **Billets** doivent rester consultables hors-ligne (c'est un critère fonctionnel, pas une option) : cache via Serwist, pas seulement un fallback réseau.
- Tester explicitement le comportement hors-ligne (mode avion / throttling réseau dans les devtools) avant de considérer l'écran Billets comme terminé.
- Le manifest PWA doit reprendre le nom **Neiro**, les couleurs de la section 2 du cahier des charges, et une icône cohérente avec l'identité visuelle (pas une icône par défaut du framework).

## Qualité & validation

- `tsc --noEmit` et le lint doivent passer sans erreur avant de considérer une étape terminée.
- Pas de tests automatisés exigés en V1 vu l'échelle du projet, mais si tu écris de la logique non triviale (calcul de badges, de records, extraction des champs d'un billet PDF), un test unitaire rapide est bienvenu plutôt qu'une confiance aveugle dans le code.
- Avant de passer à l'étape suivante de la section 10, vérifie que l'étape en cours fonctionne réellement de bout en bout (pas seulement que le code compile) — idéalement en la parcourant comme le ferait l'utilisateur final.

## Git

- Commits courts et descriptifs, en français ou anglais peu importe, mais cohérents sur tout le projet (ne pas mélanger les deux dans le même historique).
- Un commit = un changement logique cohérent, pas un gros commit fourre-tout par session de travail.
- Ne jamais commit `.env`, `.env.local`, ou tout fichier contenant des clés Supabase.

## Ce qu'il ne faut pas faire

- Ne pas ajouter de service payant ou de dépendance qui sortirait des paliers gratuits mentionnés dans le cahier des charges.
- Ne pas réinventer le design vu dans `neiro-maquette.html` "en mieux" — le design est déjà validé, l'objectif est de le reproduire fidèlement en version fonctionnelle.
- Ne pas implémenter la fonctionnalité "suivre des artistes + alertes near me" (explicitement repoussée en section 4 du cahier des charges, hors scope V1).
- Ne pas complexifier l'import de billet au-delà de la lecture de la couche texte d'un PDF pour la V1 (voir section 8 du cahier des charges) — l'OCR, que ce soit sur un PDF image ou sur une photo de billet papier, est une itération future.

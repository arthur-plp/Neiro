# Tasks

## 1. Amendement de la documentation

- [ ] 1.1 Mettre à jour la section 7 de `neiro-cahier-des-charges.md` pour acter Next.js 16 au lieu de 15 (décision D1), en notant la raison en une phrase ; vérifier qu'aucune autre mention de « Next.js 15 » ne subsiste dans le fichier (`grep -n "Next.js 15" neiro-cahier-des-charges.md` ne retourne rien)
- [ ] 1.2 Mettre à jour la ligne correspondante de `CLAUDE.md` ; même vérification par `grep`
- [ ] 1.3 Corriger dans la section 8 du cahier des charges la mention résiduelle de `next-pwa`, contredite par la section 7 qui retient Serwist ; vérifier par `grep -n "next-pwa" neiro-cahier-des-charges.md` que seule subsiste la mention historique expliquant pourquoi il a été écarté

## 2. Initialisation du projet

- [ ] 2.1 Initialiser le projet Next.js 16 à la racine (App Router, TypeScript, Tailwind v4, ESLint, alias d'import `@/`, pas de dossier `src/`) et vérifier que `npm run dev` sert la page par défaut sur `http://localhost:3000`
- [ ] 2.2 Vérifier que le `.gitignore` déjà présent couvre bien `node_modules`, `.next` et `.env*`, et fusionner sans doublon ce que l'initialisation aurait ajouté ; vérifier par `git status` qu'aucun fichier généré n'apparaît en attente
- [ ] 2.3 Activer le mode strict complet dans `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`) et vérifier que `npx tsc --noEmit` passe sans erreur
- [ ] 2.4 Supprimer les gabarits par défaut de `create-next-app` (contenu de `app/page.tsx`, styles d'exemple dans `globals.css`, SVG de démonstration dans `public/`) et vérifier que l'application démarre toujours sans erreur de ressource manquante

## 3. Vérification de l'intégration Serwist (spike jetable)

Lève le risque R1 au seul moment où le repli est gratuit. Rien de ce groupe n'est conservé : il valide une décision de l'étape 1, il ne livre aucune partie de l'étape 5.

- [ ] 3.1 Installer `@serwist/turbopack`, `serwist` et `esbuild`, câbler le minimum documenté (wrapper `withSerwist` dans `next.config.ts`, `app/sw.ts`, route handler `app/serwist/[path]/route.ts`, `SerwistProvider` dans `app/layout.tsx`) et vérifier que `npm run build` se termine sans erreur
- [ ] 3.2 Vérifier qu'un service worker est réellement émis et enregistré : présence du fichier généré après le build, et `navigator.serviceWorker.getRegistrations()` non vide dans la console du navigateur sur l'application lancée en production locale
- [ ] 3.3 Si 3.1 ou 3.2 échoue : ne pas contourner. Figer Next sur 15.5.x, réintégrer par le chemin webpack `@serwist/next`, revérifier 3.2, puis amender D1 et R1 dans `design.md` pour consigner ce qui a été observé
- [ ] 3.4 Retirer entièrement le spike (dépendances, fichiers, modification du layout) et vérifier par `git status` et `npm run build` que le projet est revenu à l'état de fin du groupe 2 ; consigner le résultat en une ligne dans `design.md` sous R1

## 4. Tokens de design

- [ ] 4.1 Déclarer les dix couleurs de la palette en tokens `@theme` dans `app/globals.css` (décision D2) et vérifier qu'une classe utilitaire comme `bg-surface-alt` rend exactement `#211F2C` dans l'inspecteur du navigateur
- [ ] 4.2 Charger Anton, Space Grotesk (400/500/600/700) et IBM Plex Mono via `next/font/google` dans `app/layout.tsx`, exposées en variables CSS et branchées sur les familles `@theme` (décision D3) ; vérifier dans l'onglet réseau des devtools qu'aucune requête ne part vers `fonts.googleapis.com` ni `fonts.gstatic.com`
- [ ] 4.3 Appliquer dans `app/layout.tsx` le fond d'ambiance backstage (fond `bg` plus halo violet en haut à gauche et halo rose en bas à droite) et la police de corps par défaut ; vérifier sur une page au contenu très court que le fond couvre bien toute la fenêtre
- [ ] 4.4 Ajouter les styles de base : `lang="fr"` sur `<html>`, contour de focus `accent-violet` sur les éléments interactifs, et neutralisation des animations sous `prefers-reduced-motion: reduce` ; vérifier au clavier que le focus est visible, et avec l'émulation « reduce » des devtools qu'aucune transition ne se joue

## 5. Primitives d'interface

- [ ] 5.1 Écrire `lib/cn.ts` pour la concaténation de classes conditionnelles ; vérifier qu'une classe passée sous condition fausse n'apparaît pas dans le rendu
- [ ] 5.2 Écrire la puce de statistique et le tag de genre dans `components/ui/` et `components/concert/`, le tag recevant sa couleur d'accent en prop (décision D7) ; vérifier leur rendu sur la page de vérification
- [ ] 5.3 Écrire la chip de filtre et le contrôle segmenté en composants clients (décision D6), état sélectionné remonté au parent ; vérifier que cliquer une option déplace bien l'indicateur actif
- [ ] 5.4 Écrire le bouton principal au dégradé rose vers ambre, libellé en police display ; vérifier que son contour de focus reste visible au clavier
- [ ] 5.5 Écrire la souche de billet dans `components/concert/ticket-stub.tsx` : couleur d'accent reçue en prop et appliquée à la fois à la bande et au tag de genre (décision D7), encoches latérales, ligne pointillée de déchirure, rotation alternée déterministe (décisions D4 et D5), troncature propre des textes longs ; vérifier avec une liste de plusieurs souches que les rotations alternent, que deux souches de même genre affichent bien les couleurs distinctes qu'on leur passe, et qu'un nom d'artiste très long ne déborde pas

## 6. Vérification

- [ ] 6.1 Construire la page `/design-system` présentant tous les tokens de couleur, les trois rôles typographiques et chaque primitive dans ses états, sans lien depuis la navigation ; vérifier qu'elle s'affiche sur `http://localhost:3000/design-system`
- [ ] 6.2 Ouvrir `/design-system` et `neiro-maquette.html` côte à côte et corriger tout écart de couleur, de police, d'espacement ou de forme ; vérifier que chaque primitive est indiscernable de son équivalent dans la maquette
- [ ] 6.3 Vérifier par `grep` qu'aucune des dix valeurs hexadécimales de la palette n'apparaît en dur hors de `app/globals.css`
- [ ] 6.4 Vérifier que `npx tsc --noEmit`, `npm run lint` et `npm run build` passent tous les trois sans erreur
- [ ] 6.5 Committer le socle en commits séparés et cohérents (amendement de la documentation, initialisation du projet, tokens, primitives, page de vérification), messages en français

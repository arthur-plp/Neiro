# Spec Delta

## Purpose

La structure de Neiro : quels écrans existent, comment on circule entre eux depuis un téléphone tenu d'une main, et ce que montre un écran qui n'a encore rien à montrer.

## ADDED Requirements

### Requirement: Barre de navigation à quatre destinations

Le système SHALL présenter une barre de navigation basse, fixe, donnant accès à quatre destinations : Accueil, Classement, Billets et Profil.

La destination courante SHALL être visuellement distincte des autres, en couleur `accent-amber` conformément à la maquette. La barre SHALL rester visible pendant le défilement du contenu.

#### Scenario: Changement de destination

- **WHEN** l'utilisateur touche l'onglet Billets depuis l'accueil
- **THEN** l'écran Billets s'affiche et l'onglet Billets devient l'onglet actif, l'accueil cessant de l'être

#### Scenario: Persistance pendant le défilement

- **WHEN** l'utilisateur fait défiler un écran long
- **THEN** la barre reste à sa place, accessible sans remonter

### Requirement: Le bouton d'ajout est toujours atteignable

Un bouton d'ajout d'un concert SHALL être présent au-dessus de la barre de navigation, à portée du pouce, sur les quatre destinations principales.

Ce bouton SHALL rester atteignable sans défilement, quelle que soit la longueur du contenu de l'écran.

#### Scenario: Ajout depuis n'importe quelle destination

- **WHEN** l'utilisateur se trouve sur l'une des quatre destinations principales
- **THEN** le bouton d'ajout est visible et mène à l'écran d'ajout d'un concert

### Requirement: Les écrans secondaires ne sont pas des destinations

Les écrans atteints depuis un autre écran — fiche concert, profil d'un ami, recherche de profils, frise chronologique, récap annuel, ajout d'un concert — SHALL proposer un retour explicite vers leur écran d'origine et MUST NOT figurer dans la barre de navigation.

#### Scenario: Retour depuis une fiche

- **WHEN** l'utilisateur ouvre une fiche concert depuis l'accueil puis touche le retour
- **THEN** il revient à l'accueil, à l'endroit d'où il venait

### Requirement: Les écrans vides le disent honnêtement

Un écran sans donnée à afficher SHALL présenter un état vide qui explique ce qui manque et propose l'action permettant d'y remédier.

Aucun écran MUST NOT afficher de donnée fictive, d'exemple factice ou de contenu de démonstration présenté comme réel.

#### Scenario: Première ouverture d'un compte neuf

- **WHEN** un utilisateur qui vient de créer son compte ouvre l'accueil
- **THEN** il voit un état vide expliquant qu'aucun concert n'est encore enregistré et proposant d'en ajouter un, et aucun concert inventé

#### Scenario: Classement sans données

- **WHEN** l'écran Classement est ouvert alors qu'aucun concert n'est noté
- **THEN** l'écran explique qu'un classement se construit à partir des concerts notés, sans podium fictif

### Requirement: Mise en page mobile sur une colonne

L'application SHALL se présenter sur une colonne unique, dimensionnée pour un téléphone, et SHALL rester utilisable jusqu'à une largeur de 320 pixels sans défilement horizontal.

Sur un écran large, le contenu SHALL rester dans une colonne centrée plutôt que de s'étaler sur toute la largeur.

#### Scenario: Petit téléphone

- **WHEN** l'application est affichée sur une fenêtre de 320 pixels de large
- **THEN** aucun contenu ne déborde et aucune barre de défilement horizontale n'apparaît

#### Scenario: Écran de bureau

- **WHEN** l'application est ouverte sur un écran large
- **THEN** le contenu reste dans une colonne centrée, lisible, sans s'étirer

### Requirement: L'identité de l'utilisateur connecté est visible

L'application SHALL afficher une marque de l'utilisateur connecté — son nom affiché ou son initiale — accessible depuis l'accueil et depuis le profil.

Cette information SHALL provenir du profil réel de l'utilisateur connecté, jamais d'une valeur codée en dur.

#### Scenario: Deux comptes différents

- **WHEN** deux utilisateurs distincts consultent l'accueil
- **THEN** chacun voit sa propre identité, et jamais celle de l'autre

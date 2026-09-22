# Spec Delta

## Purpose

Le vocabulaire visuel partagé de Neiro : palette, rôles typographiques et primitives de composants repris fidèlement de la maquette validée, que tout écran de l'application consomme au lieu de redéfinir ses propres valeurs.

## ADDED Requirements

### Requirement: Palette de couleurs canonique

Le système SHALL exposer les dix couleurs de l'identité visuelle sous forme de tokens nommés par leur rôle : `bg` (`#0B0B14`), `surface` (`#17161F`), `surface-alt` (`#211F2C`), `border` (`#2B293A`), `text` (`#F5F3FF`), `text-muted` (`#8D89A0`), `accent-hot` (`#FF3D68`), `accent-amber` (`#FFC857`), `accent-violet` (`#8B7CFA`), `accent-teal` (`#2DD4BF`).

Le code applicatif SHALL référencer ces couleurs par leur nom de rôle. Une valeur hexadécimale de la palette MUST NOT apparaître en dur ailleurs que dans la définition des tokens.

#### Scenario: Un composant consomme une couleur de la palette

- **WHEN** un composant a besoin du fond d'une carte
- **THEN** il référence le rôle `surface-alt` et la couleur rendue est exactement `#211F2C`

#### Scenario: Aucune couleur de palette en dur dans les écrans

- **WHEN** on inspecte le code source des composants et des pages
- **THEN** aucune des dix valeurs hexadécimales de la palette n'y apparaît littéralement, hors du fichier qui définit les tokens

#### Scenario: Changer un token se propage partout

- **WHEN** la valeur d'un token de couleur est modifiée à sa source
- **THEN** toutes les surfaces qui utilisent ce rôle reflètent la nouvelle valeur, sans autre édition

### Requirement: Rôles typographiques

Le système SHALL définir trois rôles typographiques distincts et exclusifs :

- **display** — Anton : logo, titres d'écran, grands chiffres, libellés de boutons principaux
- **corps** — Space Grotesk (graisses 400, 500, 600, 700) : texte d'interface par défaut
- **mono** — IBM Plex Mono : dates, compteurs, scores et autres données

Les fichiers de police SHALL être servis depuis l'origine de l'application. L'application MUST NOT dépendre d'une requête vers un domaine tiers au moment de l'exécution pour afficher son texte.

#### Scenario: Un titre d'écran utilise la police display

- **WHEN** un titre de page est rendu
- **THEN** il s'affiche en Anton, et non dans la police de corps

#### Scenario: Une date utilise la police mono

- **WHEN** une date de concert ou un compte à rebours est rendu
- **THEN** il s'affiche en IBM Plex Mono

#### Scenario: Les polices restent disponibles sans accès aux domaines tiers

- **WHEN** l'application est chargée alors que les domaines de polices tiers sont injoignables
- **THEN** les trois familles s'affichent correctement, sans repli sur une police système

### Requirement: Fond d'ambiance backstage

L'arrière-plan de l'application SHALL combiner le fond sombre `bg` avec deux halos radiaux : un halo violet dans le coin supérieur gauche et un halo rose dans le coin inférieur droit, tous deux de faible opacité.

Ce fond SHALL couvrir toute la hauteur de la fenêtre, y compris lorsque le contenu de l'écran est plus court.

#### Scenario: Écran court

- **WHEN** un écran dont le contenu occupe moins d'une hauteur de fenêtre est affiché
- **THEN** le fond d'ambiance couvre quand même la totalité de la zone visible, sans bande de couleur différente en bas

### Requirement: Primitive souche de billet

Le système SHALL fournir une primitive « souche de billet » réutilisable, qui présente un concert avec : une bande de couleur verticale à gauche, une encoche ronde sur chaque bord latéral, une ligne pointillée verticale de déchirure, le nom de l'artiste en police display, la salle et la ville en texte atténué, et une zone de métadonnées (tag de genre, date en mono, note).

La couleur d'accent de la souche SHALL être fournie par l'appelant parmi les quatre accents de la palette. La primitive MUST NOT dériver cette couleur d'une autre donnée du concert, le genre compris. Au sein d'une même souche, la bande latérale et le tag de genre SHALL utiliser cette même couleur.

Les souches présentées en liste SHALL recevoir une légère rotation alternée (environ un demi-degré, dans un sens puis dans l'autre) afin de produire l'effet « punaisé sur un mur » de la maquette.

Une souche SHALL rester lisible quand le nom de l'artiste ou de la salle est trop long pour la largeur disponible, sans déborder de sa carte ni déformer les éléments voisins.

#### Scenario: Rendu d'une souche

- **WHEN** une souche de billet est rendue avec un artiste, une salle, une date, un genre, une note et une couleur d'accent
- **THEN** les encoches latérales, la ligne pointillée et la bande de couleur sont visibles, la bande et le tag de genre portent la couleur d'accent demandée, et chaque information s'affiche dans le rôle typographique prévu

#### Scenario: Deux souches de même genre et de couleurs différentes

- **WHEN** deux souches partageant le même genre reçoivent deux couleurs d'accent différentes
- **THEN** chacune affiche la couleur qu'elle a reçue, sans qu'aucune règle interne ne les aligne sur une couleur commune

#### Scenario: Rotations alternées en liste

- **WHEN** plusieurs souches sont affichées à la suite
- **THEN** leurs rotations alternent entre les deux sens, de sorte que deux souches voisines ne penchent jamais du même côté

#### Scenario: Texte trop long

- **WHEN** une souche reçoit un nom d'artiste plus large que l'espace disponible
- **THEN** le texte est tronqué proprement à l'intérieur de la carte, sans débordement ni chevauchement

### Requirement: Primitives d'interface de base

Le système SHALL fournir, comme composants réutilisables, les primitives récurrentes de la maquette : puce de statistique (grand nombre en display ambre et libellé en capitales), tag de genre coloré, chip de filtre avec état actif, contrôle segmenté à deux options, et bouton principal au dégradé rose vers ambre.

Chaque primitive SHALL accepter son contenu depuis l'extérieur et MUST NOT contenir de donnée de démonstration en dur.

#### Scenario: Chip de filtre actif

- **WHEN** une chip de filtre est marquée comme active
- **THEN** son fond devient violet accent et son texte blanc, les chips inactives restant sur fond `surface-alt` avec texte atténué

#### Scenario: Contrôle segmenté

- **WHEN** l'utilisateur sélectionne la seconde option d'un contrôle segmenté
- **THEN** l'indicateur actif se déplace sur cette option et la valeur sélectionnée est remontée au composant parent

### Requirement: Focus clavier visible

Tout élément interactif SHALL exposer un contour de focus visible au clavier, dans la couleur `accent-violet`, suffisamment contrasté sur le fond sombre.

#### Scenario: Navigation au clavier

- **WHEN** l'utilisateur parcourt l'interface à la touche Tab
- **THEN** chaque élément atteint affiche un contour de focus nettement visible

### Requirement: Respect du mouvement réduit

Lorsque le système d'exploitation signale une préférence pour un mouvement réduit, l'application SHALL supprimer ses animations et ses transitions.

#### Scenario: Préférence de mouvement réduit active

- **WHEN** la préférence système de réduction des animations est activée
- **THEN** aucune animation ni transition ne se joue dans l'interface, et tout le contenu reste accessible

### Requirement: Page de vérification du design system

Le système SHALL exposer une page de vérification qui présente, sur un même écran, tous les tokens de couleur, les trois rôles typographiques et chaque primitive dans ses différents états.

Cette page SHALL exister pour permettre une comparaison visuelle directe avec la maquette de référence ; elle n'est pas un écran du produit et MUST NOT être accessible depuis la navigation principale.

#### Scenario: Comparaison avec la maquette

- **WHEN** un développeur ouvre la page de vérification à côté de `neiro-maquette.html`
- **THEN** chaque couleur, police et primitive peut être comparée à son équivalent dans la maquette, et les écarts sont immédiatement visibles

#### Scenario: Page absente de la navigation

- **WHEN** l'utilisateur parcourt la navigation principale de l'application
- **THEN** aucun lien ne mène à la page de vérification

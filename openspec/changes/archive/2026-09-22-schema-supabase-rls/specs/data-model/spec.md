# Spec Delta

## Purpose

Les entités que Neiro persiste — profils, concerts, festivals, compagnons, amitiés, badges — avec leurs relations et les invariants que la base fait respecter elle-même, indépendamment de tout code applicatif.

## ADDED Requirements

### Requirement: Profil adossé au compte d'authentification

Chaque compte authentifié SHALL disposer d'un profil applicatif portant un nom affiché, un avatar optionnel et une date d'inscription. L'identifiant du profil SHALL être celui du compte d'authentification, de sorte qu'aucune correspondance parallèle ne puisse diverger.

La suppression d'un compte d'authentification SHALL entraîner la suppression de son profil et de toutes les données qui en dépendent.

#### Scenario: Création d'un profil

- **WHEN** un compte est créé et son profil renseigné
- **THEN** le profil porte le même identifiant que le compte, et un nom affiché non vide

#### Scenario: Suppression en cascade

- **WHEN** un compte d'authentification est supprimé
- **THEN** son profil, ses concerts, ses festivals, ses badges et ses liens d'amitié disparaissent avec lui, sans ligne orpheline

### Requirement: Le concert est l'entité centrale

Un concert SHALL appartenir à exactement un utilisateur et porter au minimum un artiste et une date. La salle, la ville, le genre, l'heure de début et l'illustration sont optionnels.

Deux utilisateurs présents au même événement réel SHALL posséder chacun leur propre concert : les notes, les souvenirs et les billets sont personnels et ne sont jamais partagés entre comptes.

Un concert SHALL pouvoir porter quatre notes indépendantes — son, ambiance, setlist, prix — chacune absente ou comprise entre 1 et 5. Une note hors de cet intervalle MUST être rejetée par la base, pas seulement par le formulaire.

#### Scenario: Note hors intervalle

- **WHEN** une écriture tente d'enregistrer une note de 0 ou de 6 sur l'un des quatre critères
- **THEN** la base rejette l'écriture

#### Scenario: Notation partielle

- **WHEN** un concert est enregistré avec la seule note de son, les trois autres laissées vides
- **THEN** l'enregistrement est accepté et les critères non notés restent distincts d'une note de zéro

#### Scenario: Concert minimal

- **WHEN** un concert est créé avec seulement un artiste et une date
- **THEN** il est accepté, afin que la saisie rapide en salle ne soit jamais bloquée par un champ manquant

### Requirement: Le statut d'un concert se déduit de sa date

Le caractère « à venir » ou « passé » d'un concert SHALL être déterminé par comparaison de sa date avec la date courante. Ce statut MUST NOT être stocké dans une colonne.

#### Scenario: Passage du temps

- **WHEN** la date d'un concert à venir devient antérieure à la date courante
- **THEN** le concert est considéré comme passé sans qu'aucune écriture n'ait eu lieu en base

### Requirement: Un festival regroupe les concerts qui y ont été vus

Un festival SHALL porter un nom, une ville optionnelle, une date de début et une date de fin, et appartenir à un utilisateur.

Un concert SHALL pouvoir être rattaché à un festival ou rester indépendant. Chaque artiste vu pendant un festival SHALL donner lieu à un concert distinct, afin d'alimenter le classement, les records et les statistiques au même titre qu'un concert isolé.

Un concert MUST NOT être rattaché au festival d'un autre utilisateur.

#### Scenario: Week-end de festival

- **WHEN** un utilisateur enregistre quinze artistes vus pendant un même festival
- **THEN** quinze concerts distincts existent, tous rattachés au même festival, et chacun compte individuellement dans les statistiques

#### Scenario: Rattachement à un festival étranger

- **WHEN** une écriture tente de rattacher un concert au festival d'un autre utilisateur
- **THEN** l'écriture est rejetée

### Requirement: Les compagnons sont des profils tagués sur un concert

Un concert SHALL pouvoir référencer zéro, un ou plusieurs profils comme compagnons présents. Un même profil MUST NOT être tagué deux fois sur un même concert, et un utilisateur MUST NOT se taguer lui-même comme compagnon de son propre concert.

La suppression d'un concert SHALL supprimer ses tags de compagnons ; la suppression d'un profil tagué SHALL retirer ses tags sans supprimer les concerts concernés.

#### Scenario: Double tag

- **WHEN** une écriture tente de taguer deux fois le même profil sur un concert
- **THEN** l'écriture est rejetée

#### Scenario: Départ d'un compagnon

- **WHEN** un profil tagué comme compagnon est supprimé
- **THEN** les concerts où il était tagué subsistent, amputés de ce seul tag

### Requirement: Le billet est porté par le concert

Les informations de billet — catégorie, rappel actif, origine de la saisie et référence du fichier PDF importé — SHALL être portées par le concert lui-même, sans entité distincte.

L'origine de la saisie SHALL valoir soit une saisie manuelle, soit un import de PDF. Une référence de fichier MUST NOT exister pour un concert saisi manuellement.

#### Scenario: Import d'un PDF

- **WHEN** un concert est créé depuis un PDF importé
- **THEN** le concert porte l'origine « pdf » et la référence du fichier conservé

#### Scenario: Référence incohérente

- **WHEN** une écriture déclare une saisie manuelle tout en fournissant une référence de fichier
- **THEN** l'écriture est rejetée

### Requirement: Les amitiés sont des liens dirigés avec un statut

Un lien d'amitié SHALL relier un demandeur à un destinataire, avec un statut « en attente » ou « accepté ». Un utilisateur MUST NOT s'ajouter lui-même en ami, et un même couple de profils MUST NOT porter deux liens dans le même sens.

#### Scenario: Auto-ajout

- **WHEN** une écriture tente de créer un lien dont le demandeur et le destinataire sont le même profil
- **THEN** l'écriture est rejetée

#### Scenario: Demande en double

- **WHEN** un utilisateur envoie une seconde demande au même destinataire
- **THEN** l'écriture est rejetée, le lien existant faisant foi

### Requirement: Les badges sont attribués à un utilisateur

Un badge SHALL porter un type et appartenir à un utilisateur. Un même type de badge MUST NOT être attribué deux fois au même utilisateur. Un badge non obtenu n'existe pas en base : l'absence de ligne vaut verrouillage.

#### Scenario: Badge déjà obtenu

- **WHEN** un calcul tente d'attribuer un badge que l'utilisateur possède déjà
- **THEN** l'écriture est rejetée et le badge conserve sa date d'obtention d'origine

### Requirement: Le schéma est géré exclusivement par migrations versionnées

Toute évolution du schéma SHALL passer par une migration SQL versionnée, produite depuis la définition du schéma et conservée dans le dépôt. Le schéma MUST NOT être modifié à la main depuis l'interface d'administration une fois le projet lancé.

#### Scenario: Reconstruction depuis zéro

- **WHEN** les migrations du dépôt sont appliquées dans l'ordre sur une base vide
- **THEN** le schéma obtenu est identique à celui décrit par la définition, sans étape manuelle

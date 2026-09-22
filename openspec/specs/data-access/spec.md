# data-access Specification

## Purpose
Qui peut lire et écrire quoi dans Neiro, décidé au niveau de la base de données plutôt que dans le code applicatif — afin qu'un oubli côté front ne puisse jamais exposer les données d'un utilisateur à un autre.

## Requirements

### Requirement: Aucune table sans protection

Toute table contenant des données d'utilisateur SHALL avoir la Row Level Security activée et au moins une politique définie avant d'être lue ou écrite depuis l'application.

Une table dont la RLS est activée sans qu'aucune politique ne la couvre refuse tout accès : cet état est acceptable, une table sans RLS ne l'est pas.

#### Scenario: Inventaire des protections

- **WHEN** on interroge la base sur l'ensemble de ses tables applicatives
- **THEN** chacune a la Row Level Security activée, et aucune n'est accessible sans politique explicite

#### Scenario: Nouvelle table

- **WHEN** une table est ajoutée au schéma
- **THEN** sa migration active la RLS et définit ses politiques dans le même passage, jamais dans un second temps

### Requirement: Isolation stricte par utilisateur en lecture

Un utilisateur authentifié SHALL pouvoir lire ses propres concerts, festivals, badges et son propre profil, et rien d'autre.

À ce stade, les données d'un autre utilisateur MUST NOT être lisibles, y compris celles d'un utilisateur qui l'a tagué comme compagnon. L'ouverture aux amis est une évolution ultérieure et explicite de cette capacité.

#### Scenario: Lecture croisée entre deux comptes

- **WHEN** l'utilisateur A demande la liste de tous les concerts alors que l'utilisateur B en possède
- **THEN** A ne reçoit que ses propres concerts, et aucune ligne de B

#### Scenario: Lecture directe par identifiant

- **WHEN** l'utilisateur A demande un concert de B en connaissant son identifiant exact
- **THEN** la base répond comme si la ligne n'existait pas

#### Scenario: Compagnon tagué

- **WHEN** B tague A comme compagnon de l'un de ses concerts
- **THEN** A ne voit toujours pas ce concert à ce stade

### Requirement: Isolation stricte par utilisateur en écriture

Un utilisateur SHALL pouvoir créer, modifier et supprimer uniquement ses propres lignes. Une écriture MUST NOT pouvoir attribuer une ligne à un autre utilisateur, ni au moment de la création, ni par modification ultérieure du propriétaire.

#### Scenario: Création au nom d'un autre

- **WHEN** l'utilisateur A crée un concert en déclarant B comme propriétaire
- **THEN** l'écriture est refusée

#### Scenario: Transfert de propriété

- **WHEN** l'utilisateur A tente de modifier l'un de ses concerts pour en attribuer la propriété à B
- **THEN** l'écriture est refusée

#### Scenario: Suppression d'une ligne étrangère

- **WHEN** l'utilisateur A tente de supprimer un concert de B
- **THEN** aucune ligne n'est supprimée

### Requirement: Les tags de compagnons suivent le propriétaire du concert

L'accès aux tags de compagnons d'un concert SHALL être déterminé par l'accès au concert lui-même. Seul le propriétaire d'un concert SHALL pouvoir y ajouter ou retirer des compagnons.

#### Scenario: Tag sur un concert étranger

- **WHEN** l'utilisateur A tente d'ajouter un compagnon sur un concert de B
- **THEN** l'écriture est refusée

### Requirement: Un lien d'amitié est visible de ses deux parties

Un lien d'amitié SHALL être lisible par son demandeur comme par son destinataire, quel que soit son statut. Un utilisateur MUST NOT pouvoir lire un lien qui ne le concerne pas.

Seul le destinataire d'une demande en attente SHALL pouvoir la faire passer au statut « accepté ». Chacune des deux parties SHALL pouvoir supprimer le lien.

#### Scenario: Demande reçue

- **WHEN** A envoie une demande d'ami à B
- **THEN** A et B voient tous deux ce lien, et aucun tiers ne le voit

#### Scenario: Auto-acceptation

- **WHEN** A tente de faire passer à « accepté » la demande qu'il a lui-même envoyée
- **THEN** l'écriture est refusée

### Requirement: Les secrets d'administration ne quittent pas le serveur

La clé de service, qui contourne la Row Level Security par conception, MUST NOT être exposée au navigateur ni committée dans le dépôt. Le navigateur SHALL n'employer que la clé publique, soumise aux politiques.

#### Scenario: Inspection du code livré

- **WHEN** on inspecte le JavaScript servi au navigateur et l'historique du dépôt
- **THEN** la clé de service n'y apparaît nulle part

### Requirement: L'isolation est vérifiée, pas supposée

Avant que cette capacité soit considérée comme terminée, l'isolation SHALL être éprouvée contre la base réelle avec deux comptes distincts, et le résultat consigné.

#### Scenario: Preuve d'isolation

- **WHEN** deux comptes de test possèdent chacun des données et que chacun tente de lire celles de l'autre
- **THEN** chaque tentative revient vide, et cette vérification est consignée comme réalisée

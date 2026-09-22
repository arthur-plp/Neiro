# Proposal

## Why

Le socle applicatif tourne, mais l'application ne sait rien retenir : il n'existe ni base de données, ni compte, ni la moindre ligne persistée. Toutes les étapes suivantes de la section 10 — l'authentification, le journal de concerts, les billets, le volet social, les statistiques — supposent un schéma en place et des permissions déjà posées.

L'ordre importe particulièrement ici. `CLAUDE.md` pose que **toute table exposée à plusieurs utilisateurs doit avoir une politique RLS avant d'être utilisée en front**, sans exception. Poser le schéma sans la RLS reviendrait à créer une fenêtre pendant laquelle les données d'un utilisateur seraient lisibles par n'importe quel autre — et ces fenêtres ne se referment jamais au moment prévu. Le schéma et son isolation arrivent donc ensemble, dans le même change.

## What Changes

- Création du projet **Supabase** (Postgres, Auth, Storage) sur le palier gratuit, et branchement de l'application via des variables d'environnement.
- Définition du schéma en **Drizzle ORM** à partir du modèle de la section 5 du cahier des charges, avec les écarts justifiés plus bas.
- Génération et application des **migrations SQL versionnées** par `drizzle-kit`.
- Mise en place de la **Row Level Security sur chaque table**, dans sa version « isolation par utilisateur » : chacun ne voit et ne modifie que ses propres données. La visibilité partagée entre amis est hors scope ici — elle relève de l'étape 6, qui élargira ces politiques.
- Un client Supabase typé côté serveur et côté navigateur, sans qu'aucune clé secrète ne quitte le serveur.
- Une vérification effective de l'isolation : deux comptes de test, et la preuve que l'un ne peut pas lire les lignes de l'autre.

Non-goals : aucune interface, aucun écran, aucune authentification finalisée (étape 3), aucune requête depuis un composant. Ce change s'arrête à la frontière de la base et de son accès.

## Capabilities

### New Capabilities

- `data-model`: les entités que l'application persiste, leurs champs, leurs relations et leurs invariants — ce qui existe et ce qui ne peut pas exister.
- `data-access`: qui peut lire et écrire quoi, posé au niveau de la base. Cette capacité sera **modifiée à l'étape 6** pour ouvrir la visibilité aux amis tagués ; elle démarre ici en isolation stricte.

### Modified Capabilities

Aucune. `design-system` n'est pas touchée.

## Impact

**Écarts assumés par rapport à la section 5 du cahier des charges**, chacun justifié :

1. **`Ticket` est fusionné dans `Concert`.** Le cahier laissait explicitement le choix ouvert. Un billet appartient à un utilisateur pour un concert donné ; le cas « plusieurs billets pour un même concert » n'existe pas dans l'usage visé, puisqu'un ami a son propre compte et son propre concert. Une table de moins, une politique RLS de moins, aucune jointure sur l'écran Billets.

2. **Une entité `festivals` est ajoutée, et chaque set devient un concert.** Le cahier ne tranchait pas ; la décision retenue est qu'un festival de trois jours produit autant de concerts que d'artistes vus, rattachés à un festival parent. C'est la seule forme qui fasse remonter ces artistes dans le classement, les records et les statistiques — sans quoi un week-end de festival compterait pour une seule ligne.

3. **`statut: "à venir" | "passé"` n'est pas stocké.** Il se déduit de la date. Une colonne dénormalisée de ce type se désynchronise dès le premier concert dont la date passe sans que personne n'écrive dans la table.

4. **`companions` devient une table de liaison**, pas un tableau d'identifiants. La RLS de l'étape 6 devra vérifier l'appartenance à cet ensemble à chaque lecture ; un tableau rendrait cette vérification coûteuse et fragile.

5. **`setlist` et `photos` restent des tableaux Postgres.** L'ordre de la setlist est porteur de sens et un tableau le préserve. À l'échelle visée — de l'ordre d'une centaine de concerts par utilisateur — une table dédiée par titre de chanson serait de la normalisation sans bénéfice.

6. **`profiles` est une table publique adossée à `auth.users`.** Supabase Auth possède ses propres utilisateurs ; le nom affiché et l'avatar vivent dans une table applicative liée par identifiant.

**Dépendances ajoutées** : `drizzle-orm`, `drizzle-kit`, `postgres` (pilote), `@supabase/supabase-js`, `@supabase/ssr`. Toutes actées en section 7 du cahier des charges.

**Sécurité** : aucune clé n'entre dans le dépôt. `.env.local` reste ignoré par git ; un `.env.example` documente les noms de variables. La clé `service_role` ne doit jamais être exposée au navigateur.

**Service externe** : un projet Supabase est créé sur le palier gratuit — 500 Mo de base, 1 Go de stockage, aucune carte bancaire.

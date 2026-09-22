# Tasks

## 1. Projet Supabase et raccordement

- [ ] 1.1 Créer le projet Supabase `neiro` sur le palier gratuit, région Europe (action utilisateur) ; vérifier que le tableau de bord du projet est accessible et que la base répond
- [x] 1.2 Écrire `.env.example` avec les noms de variables et un commentaire par variable, sans aucune valeur ; vérifier par `git check-ignore .env.local` que le fichier de valeurs réelles est bien ignoré et par `git status` qu'il n'apparaît jamais
- [ ] 1.3 Remplir `.env.local` avec l'URL du projet, la clé publique et la chaîne de connexion (action utilisateur, valeurs jamais transmises dans la conversation) ; vérifier par un script de diagnostic que la connexion à la base aboutit, sans afficher les secrets
- [x] 1.4 Installer `drizzle-orm`, `drizzle-kit`, `postgres`, `@supabase/supabase-js` et `@supabase/ssr` ; vérifier que `npx tsc --noEmit` passe toujours

## 2. Schéma Drizzle

- [x] 2.1 Écrire `db/schema.ts` : `profiles`, `festivals`, `concerts`, `concert_companions`, `friendships`, `badges`, avec les écarts justifiés au proposal (billet fusionné dans `concerts`, festival parent, statut non stocké) ; vérifier que le fichier compile et que les types s'infèrent
- [x] 2.2 Poser les contraintes d'intégrité en base (décision D5) : notes entre 1 et 5, pas d'auto-tag en compagnon, pas d'auto-amitié, unicité d'un badge par type et par utilisateur, cohérence entre origine de saisie et référence de fichier, suppressions en cascade ; vérifier que chaque contrainte apparaît dans le SQL généré
- [x] 2.3 Configurer `drizzle.config.ts` et générer la migration de structure ; vérifier que le SQL produit contient les six tables et toutes les contraintes de 2.2
- [ ] 2.4 Appliquer la migration sur le projet Supabase ; vérifier dans l'éditeur de tables que les six tables existent avec leurs colonnes et leurs clés étrangères

## 3. Profils et authentification de base

- [ ] 3.1 Écrire la migration du trigger qui crée un profil à chaque compte créé (décision D2) ; vérifier en créant un compte de test que sa ligne de profil apparaît sans intervention
- [ ] 3.2 Vérifier la cascade : supprimer le compte de test et constater que son profil et ses données ont disparu sans laisser de ligne orpheline

## 4. Row Level Security

- [ ] 4.1 Écrire la migration des politiques pour `profiles`, `festivals`, `concerts` et `badges` : lecture et écriture limitées au propriétaire, sans possibilité de créer ou transférer une ligne au nom d'un tiers ; vérifier que la RLS est activée sur chacune
- [ ] 4.2 Écrire les politiques de `concert_companions`, dérivées de l'accès au concert parent (seul le propriétaire du concert tague) ; vérifier qu'un tag sur un concert étranger est refusé
- [ ] 4.3 Écrire les politiques de `friendships` : lisible par les deux parties, seul le destinataire accepte, chacune des deux parties peut supprimer ; vérifier qu'une auto-acceptation est refusée
- [ ] 4.4 Vérifier par requête sur les catalogues système qu'aucune table applicative n'a la RLS désactivée et qu'aucune n'est dépourvue de politique

## 5. Preuve d'isolation

- [ ] 5.1 Créer deux comptes de test avec chacun un festival, deux concerts et un badge ; vérifier que les données sont bien en place pour les deux
- [ ] 5.2 Depuis le compte A, tenter les quatre attaques de la spec — lister tous les concerts, lire un concert de B par son identifiant exact, créer un concert au nom de B, transférer un de ses concerts à B — et vérifier que les quatre échouent
- [ ] 5.3 Vérifier qu'un concert de B où A est tagué comme compagnon reste invisible pour A à ce stade, conformément à l'isolation stricte voulue
- [ ] 5.4 Consigner le résultat de ces vérifications dans `design.md` sous R1, puis supprimer les deux comptes de test et constater qu'il ne reste aucune donnée

## 6. Accès applicatif

- [x] 6.1 Écrire `lib/supabase/client.ts` et `lib/supabase/server.ts` (décision D3) ; vérifier que les deux s'instancient sans erreur et que seule la clé publique est employée
- [x] 6.2 Vérifier par `grep` qu'aucune clé ne figure dans le dépôt et que la clé de service n'est référencée que dans `.env.example`
- [x] 6.3 Exposer les types TypeScript des tables dérivés du schéma Drizzle (décision D4) ; vérifier qu'un champ inexistant provoque bien une erreur de compilation

## 7. Vérification

- [ ] 7.1 Vérifier que `npx tsc --noEmit`, `npm run lint` et `npm run build` passent tous les trois sans erreur
- [ ] 7.2 Rejouer toutes les migrations depuis une base vierge et vérifier que le schéma obtenu et les politiques sont identiques, sans aucune étape manuelle
- [ ] 7.3 Committer en commits séparés et cohérents (dépendances, schéma, trigger, politiques, clients), messages en français

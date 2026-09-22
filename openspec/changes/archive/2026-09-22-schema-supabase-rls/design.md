# Design

## Context

Le socle de l'étape 1 est en place : Next.js 16, TypeScript strict, Tailwind v4, design system. Aucune persistance, aucun compte, aucune dépendance de données. Voir `proposal.md` — Why pour la motivation.

Trois contraintes cadrent l'approche :

1. **La RLS n'est pas négociable.** `CLAUDE.md` en fait une condition d'achèvement : une table sans RLS correctement testée ne doit pas être considérée comme terminée. C'est le seul point où le cahier des charges interdit explicitement l'arbitrage « simple plutôt que propre ».
2. **Drizzle possède le schéma.** Migrations versionnées dans le dépôt, aucune modification manuelle depuis l'interface Supabase une fois le projet lancé.
3. **Le palier gratuit.** 500 Mo de base, 1 Go de stockage, aucune carte bancaire. À l'échelle visée — quelques dizaines d'utilisateurs, une centaine de concerts chacun — ces limites ne sont jamais approchées.

Une tension structurante traverse ce change : **Drizzle génère le DDL des tables, mais la RLS est du SQL que Drizzle ne produit pas spontanément.** Comment les deux cohabitent sans qu'un schéma régénéré n'efface silencieusement les politiques est la première décision à prendre.

## Goals / Non-Goals

**Goals :**

- Un schéma complet, typé, correspondant au modèle de la section 5 avec les écarts justifiés du proposal.
- Des migrations rejouables depuis zéro, politiques RLS comprises.
- L'isolation par utilisateur effective et **prouvée** contre la vraie base.
- Un accès aux données depuis le serveur comme depuis le navigateur, sans qu'aucun secret ne fuie.

**Non-Goals :**

- Aucune interface, aucun composant, aucun hook de données. L'étape 3 câble l'authentification, l'étape 4 consomme le schéma.
- Aucune visibilité entre amis : les politiques posées ici sont volontairement les plus strictes possibles. L'étape 6 les élargira, et il est plus sûr d'ouvrir ensuite que de restreindre après coup.
- Aucun calcul de badge, de record ou de statistique. La table `badges` existe, personne ne la remplit.
- Aucun bucket de stockage configuré : le PDF de billet et les photos relèvent des étapes 5 et 8.

## Decisions

### D1 — La RLS vit dans des migrations SQL écrites à la main, pas dans le schéma Drizzle

Drizzle sait déclarer des politiques RLS depuis la version 0.36, mais le générateur reste centré sur la structure des tables. Une politique oubliée lors d'une régénération est exactement le type de silence que ce change doit empêcher.

**Décision : `drizzle-kit generate` produit les migrations de structure ; les politiques RLS sont ajoutées dans des fichiers de migration SQL dédiés, numérotés à la suite, committés et rejouables.**

Rationale : le SQL de la RLS est lisible, auditables ligne à ligne, et ne dépend pas de ce qu'un générateur décide de conserver. Surtout, il rend visible dans le diff d'une pull request qu'une politique a changé — ce qu'une abstraction masquerait.

Conséquence opérationnelle : toute migration qui crée une table est immédiatement suivie de sa migration de politiques. La spec en fait un scénario testable.

Alternative écartée : déclarer les politiques dans le schéma Drizzle. Plus élégant sur le papier, mais cela fait dépendre la sécurité du comportement d'un générateur, et l'écart entre ce qui est déclaré et ce qui est réellement appliqué en base deviendrait invisible.

### D2 — `profiles` est alimentée par un trigger, pas par le code applicatif

Supabase Auth crée les comptes dans `auth.users`. L'application a besoin d'un profil dans `public.profiles` pour chaque compte.

**Décision : un trigger `on auth.users insert` crée automatiquement la ligne de profil correspondante.**

Rationale : si la création du profil dépend d'un appel applicatif après inscription, tout chemin qui crée un compte sans passer par ce code — invitation, OAuth ajouté plus tard, création depuis l'interface Supabase — produit un compte sans profil. Le trigger rend l'invariant « un compte, un profil » vrai par construction plutôt que par discipline.

### D3 — Deux clients Supabase, deux responsabilités

- **Client navigateur** (`@supabase/ssr`, clé publique) : porte la session de l'utilisateur, subit la RLS. C'est lui que TanStack Query utilisera à l'étape 4.
- **Client serveur** (composants serveur, route handlers) : lit la session depuis les cookies, subit également la RLS.

**Décision : la clé `service_role` n'est utilisée nulle part dans ce change.** Elle n'apparaît que dans `.env.example`, documentée comme réservée à d'éventuelles Edge Functions ultérieures.

Rationale : cette clé contourne la RLS par conception. Chaque endroit qui l'utilise est un endroit où toute la sécurité repose à nouveau sur du code applicatif. N'en avoir aucun aujourd'hui est la meilleure position de départ.

### D4 — Drizzle sert au schéma et aux migrations, pas aux requêtes applicatives

**Décision : les requêtes de l'application passent par le client Supabase, pas par Drizzle.**

Rationale : le client Supabase transporte le JWT de l'utilisateur, ce qui est précisément ce qui déclenche la RLS. Une connexion Drizzle directe à Postgres se connecte avec un rôle de base et court-circuiterait les politiques — l'inverse de l'objectif. Drizzle reste ce que le cahier des charges en attend : la source de vérité du schéma et le générateur de migrations.

Conséquence : les types TypeScript des tables sont dérivés du schéma Drizzle et partagés avec le code qui interroge Supabase, ce qui conserve le typage sans rien sacrifier de la sécurité.

### D5 — Les invariants sont posés en base, pas seulement dans Zod

Notes entre 1 et 5, pas d'auto-tag en compagnon, pas d'auto-amitié, unicité d'un badge par type et par utilisateur, cohérence entre l'origine de saisie et la présence d'un fichier.

**Décision : chacun de ces invariants est une contrainte `CHECK` ou `UNIQUE` en base, en plus de sa validation Zod côté formulaire.**

Rationale : la validation de formulaire protège l'utilisateur d'une faute de frappe ; la contrainte de base protège les données d'un bug. Les specs les formulent comme des rejets par la base, pas par le front — c'est délibéré et c'est vérifiable.

### D6 — Un festival appartient à un utilisateur

Deux amis au même festival possèdent chacun leur ligne de festival.

**Décision : `festivals.user_id` est obligatoire, et une contrainte empêche de rattacher un concert au festival d'autrui.**

Rationale : c'est la seule forme cohérente avec un concert par utilisateur. Un festival partagé entre comptes poserait immédiatement la question de qui peut le renommer, et créerait une entité transverse à protéger par une RLS bien plus subtile que l'isolation simple visée ici. La déduplication éventuelle — reconnaître que deux utilisateurs parlent du même festival réel — est un problème d'affichage de l'étape 6, pas un problème de schéma.

### D7 — Nommage en anglais, `snake_case`

Tables et colonnes en anglais au pluriel (`concerts`, `festivals`, `concert_companions`), colonnes en `snake_case` (`rating_sound`, `expectations_before`).

Rationale : c'est la convention de Postgres et celle que Supabase applique à ses propres objets ; mélanger français et anglais dans un même schéma produit des requêtes illisibles. Les specs et la documentation restent en français, le code reste en anglais — la règle déjà suivie depuis le début du projet.

### D8 — Arborescence

```
db/
  schema.ts            # définition Drizzle, source de vérité
  migrations/          # SQL versionné, généré + politiques écrites à la main
lib/
  supabase/
    client.ts          # client navigateur
    server.ts          # client serveur (cookies)
drizzle.config.ts
.env.example           # noms de variables, aucune valeur
```

## Risks / Trade-offs

**R1 — Une politique RLS juste en apparence.** Une politique syntaxiquement valide peut laisser passer ce qu'elle devrait bloquer, et rien ne le signale : la requête réussit simplement. → Mitigation : la vérification à deux comptes est une exigence de la spec, pas une tâche facultative. Elle teste la lecture croisée, la lecture directe par identifiant, la création au nom d'un tiers et le transfert de propriété — les quatre façons dont une isolation se révèle fausse.

> **Résultat de la vérification (22/09/2026) — 17/17, isolation prouvée.** Exécutée par `npm run db:verify` contre le projet réel (PostgreSQL 17.6), deux comptes provisionnés puis supprimés. Refus constatés : création d'un concert au nom d'un tiers (403), transfert de propriété (403), tag de compagnon sur un concert étranger (403), auto-attribution d'un badge (403), rattachement au festival d'autrui (409, rejeté par la clé étrangère composite avant même la RLS), auto-acceptation d'une demande d'ami (0 ligne affectée). Lectures vides constatées : liste globale des concerts limitée aux siens, lecture par identifiant exact, badges d'autrui. Isolation stricte confirmée : un utilisateur tagué comme compagnon ne voit ni le concert ni le tag qui le concerne — c'est l'état voulu jusqu'à l'étape 6. Cascade vérifiée : la suppression des deux comptes ne laisse aucune ligne dans les six tables.
>
> Le script parle à PostgREST en HTTP brut plutôt que par `@supabase/supabase-js`, pour deux raisons : la librairie exige Node 22+ (voir R5), et un test de sécurité qui ne dépend d'aucun client éprouve la base elle-même plutôt que la librairie.

**R5 — `@supabase/supabase-js` exige Node 22 ou plus.** Depuis la version 2.116, le client instancie un client temps réel qui réclame un `WebSocket` natif, absent de Node 20 comme de Node 21 ; `createClient` lève donc une exception à la construction, y compris côté serveur. La machine de développement est en Node 20.19 et le projet ne déclarait aucune version requise. → Mitigation : `engines` déclare désormais Node >= 22 dans `package.json`, ce qui fait échouer l'installation tôt et clairement plutôt qu'à la première requête. La montée de version est à faire sur le poste de développement (`nvm install 22`) ; Vercel exécute déjà Node 22 par défaut. Ce change n'est pas bloqué par là, puisque rien n'appelle encore les clients Supabase à l'exécution — mais l'étape 3 le sera.

**R2 — La fenêtre entre la création d'une table et sa politique.** Entre `generate` et la migration de politiques, une table existe sans protection. → Mitigation : les deux migrations sont appliquées ensemble et committées ensemble ; aucune table n'est utilisée depuis le front dans ce change, donc la fenêtre n'existe qu'en local.

**R3 — Ouvrir la RLS à l'étape 6 est plus délicat que la poser ici.** Les politiques de visibilité entre amis devront lire la table des compagnons et celle des amitiés depuis l'intérieur d'une politique, ce qui peut créer des récursions. → Mitigation : c'est précisément pourquoi les compagnons sont une table de liaison et non un tableau (écart 4 du proposal). La question est reconnue et instruite maintenant, elle se résoudra à l'étape 6 avec des fonctions `security definer` si nécessaire.

**R4 — Le projet Supabase gratuit se met en pause après une semaine d'inactivité.** Un projet gratuit inactif est suspendu et doit être réveillé manuellement. → Mitigation : sans conséquence pendant le développement actif ; à connaître avant le déploiement, et sans incidence sur les données, qui sont conservées.

**Trade-off assumé — `setlist` et `photos` en tableaux Postgres.** On perd la possibilité d'interroger « tous les concerts où tel titre a été joué » avec un index efficace. À une centaine de concerts par utilisateur, un parcours séquentiel reste instantané. Si la recherche par titre devient un vrai besoin, la normalisation se fera à ce moment-là, avec le cas d'usage sous les yeux.

## Migration Plan

Base vierge, aucune donnée, aucun utilisateur. Les migrations s'appliquent dans l'ordre sur un projet neuf.

Retour arrière : le projet Supabase peut être supprimé et recréé sans perte, puisqu'il ne contient rien que les migrations ne sachent reconstruire. C'est vrai tant que la première donnée réelle n'est pas saisie — c'est-à-dire jusqu'à l'étape 4.

## Open Questions

- **Le bucket de stockage des PDF et des photos.** Nom du bucket, caractère public ou privé, politiques d'accès aux fichiers. Reportable sans risque : le schéma ne stocke qu'un chemin de fichier sous forme de texte, et la configuration du stockage relève des étapes 5 et 8. La réponse ne change ni les specs ni les tâches de ce change.

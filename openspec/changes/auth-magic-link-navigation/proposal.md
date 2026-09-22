# Proposal

## Why

La base est en place et protégée, mais personne ne peut s'y connecter : les politiques RLS reposent toutes sur `auth.uid()`, et sans session authentifiée cette valeur est nulle — l'application ne voit donc rien. Les six tables existent et restent inatteignables.

C'est aussi le premier change qui produit des écrans. Jusqu'ici l'application n'a qu'une page d'accueil provisoire et une page de vérification du design system. L'étape 4 attaquera le journal de concerts en CRUD complet ; elle a besoin d'un endroit où se poser, d'une navigation qui existe, et d'un utilisateur connu.

## What Changes

- **Envoi d'e-mails** : configuration d'un SMTP externe gratuit (Brevo) dans Supabase, en remplacement du service intégré dont le palier gratuit n'envoie qu'aux membres du projet. Sans cela, aucun ami ne pourra jamais s'inscrire — un mur qui tomberait à l'étape 6, quand il serait bien plus coûteux à franchir.
- **Authentification par magic link** : écran de connexion, envoi du lien, route de rappel qui échange le code contre une session, déconnexion.
- **Cycle de vie de la session** : rafraîchissement du jeton par un middleware, pour qu'une session ouverte le reste sans que l'utilisateur ait à se reconnecter.
- **Protection des routes** : tout l'intérieur de l'application exige une session ; un visiteur non connecté est renvoyé vers la connexion, et un utilisateur connecté qui revient sur la connexion est renvoyé chez lui.
- **Squelette de navigation** : la barre basse à quatre onglets de la maquette — Accueil, Classement, Billets, Profil — et le bouton d'ajout flottant, construits avec les primitives du design system.
- **Coquilles d'écrans** pour les dix écrans de la section 3, chacune affichant son titre et un état vide honnête plutôt qu'un contenu factice.

Non-goals : aucune donnée réelle affichée, aucun formulaire de concert, aucune requête métier. L'étape 4 remplira ces coquilles. Aucun profil éditable, aucune recherche d'ami : étape 6.

## Capabilities

### New Capabilities

- `authentication`: comment un utilisateur prouve son identité, ce qui arrive à sa session dans le temps, et ce qu'il peut atteindre selon qu'il est connecté ou non.
- `app-navigation`: la structure de l'application — quels écrans existent, comment on passe de l'un à l'autre, et ce que voit un écran qui n'a rien à montrer.

### Modified Capabilities

Aucune. `data-model` et `data-access` sont consommées, pas modifiées.

## Impact

**Service externe ajouté** : un compte Brevo sur son palier gratuit — 300 e-mails par jour, aucune carte bancaire, aucun nom de domaine à posséder puisqu'une adresse expéditrice validée suffit. `CLAUDE.md` impose de signaler tout ajout de service : celui-ci est nécessaire parce que le SMTP intégré de Supabase ne sait pas écrire à quelqu'un qui n'est pas membre du projet.

**Écart au cahier des charges** : la section 7 prévoit le magic link sans dire comment les e-mails partent. Ce change tranche ce silence ; le magic link lui-même est conservé tel quel.

**Code créé** : un middleware de session, les routes d'authentification, un groupe de routes protégé portant la navigation, et dix coquilles d'écrans.

**Dépendances** : aucune nouvelle. `@supabase/ssr` est déjà installé.

**Conséquence sur la suite** : chaque écran de l'étape 4 se posera dans cette structure. Une navigation mal découpée ici se paie à chaque écran ajouté ensuite.

# Design

## Context

Le schéma est en place et protégé : six tables, RLS activée partout, 18 politiques, isolation prouvée à 17/17. Toutes ces politiques reposent sur `auth.uid()` — sans session, l'application ne voit rien. Voir `proposal.md` — Why.

Deux contraintes cadrent l'approche :

1. **Les écrans existent déjà en maquette, sauf un.** `neiro-maquette.html` prototype les dix écrans de la section 3 et la barre de navigation. Elle ne contient **aucun écran de connexion** : c'est le seul écran de ce change à concevoir, et il devra l'être avec les tokens et primitives du design system plutôt qu'inventé à part.
2. **Node 22 est désormais requis.** `@supabase/supabase-js` instancie un client temps réel réclamant `WebSocket` natif. L'étape 2 s'en était affranchie en parlant HTTP brut ; ici les clients sont réellement utilisés, donc la contrainte devient effective. `engines` la déclare déjà.

## Goals / Non-Goals

**Goals :**

- Se connecter et se déconnecter réellement, avec un e-mail qui arrive, y compris à quelqu'un d'extérieur au projet.
- Une session qui tient dans le temps sans reconnexion et sans clignotement au chargement.
- Une structure de routes et une navigation sur lesquelles l'étape 4 pourra se poser sans réorganisation.
- Des états vides honnêtes, qui n'inventent rien.

**Non-Goals :**

- Aucune donnée métier affichée : pas de concert, pas de classement, pas de billet. Les coquilles sont des coquilles.
- Aucun formulaire d'ajout fonctionnel : le bouton mène à un écran qui existe, pas à un formulaire qui enregistre.
- Aucune édition de profil, aucune recherche d'ami : étape 6.
- Aucun service worker, aucun mode hors-ligne : étapes 5 et 9. Une session non rafraîchie hors réseau est un problème connu et reporté.

## Decisions

### D1 — SMTP externe dès maintenant, pas plus tard

Le SMTP intégré de Supabase n'envoie, sur le palier gratuit, qu'aux adresses des membres du projet, avec une limite de quelques messages par heure.

**Décision : configurer Brevo (palier gratuit, 300 e-mails par jour) comme SMTP personnalisé de Supabase dès ce change.**

Rationale : sans cela, l'authentification fonctionnerait parfaitement pour l'unique développeur et pour personne d'autre. Le défaut ne se révélerait qu'à l'étape 6, au moment d'inviter un ami — c'est-à-dire après que six étapes se soient appuyées sur une authentification réputée finie. La spec en fait un scénario explicite : l'envoi est vérifié vers une adresse tierce.

Brevo plutôt que Resend : Resend n'autorise l'envoi vers des adresses arbitraires qu'avec un nom de domaine vérifié, ce qui sortirait du palier gratuit. Brevo se contente d'une adresse expéditrice validée.

### D2 — Le middleware rafraîchit la session, il ne garde pas les routes

Le middleware Next s'exécute à chaque requête. Il est tentant d'y mettre la protection des routes.

**Décision : le middleware ne fait qu'une chose — rafraîchir le jeton et réécrire les cookies. La protection est faite dans le layout du groupe de routes protégé, côté serveur.**

Rationale : un middleware qui décide de l'accès raisonne sur un cookie, pas sur une session vérifiée ; la vraie garantie vient de la RLS de toute façon. Faire la redirection dans un Server Component permet d'appeler `getUser()`, qui valide le jeton auprès de Supabase plutôt que de faire confiance à son contenu. Le middleware reste alors petit, prévisible, et ne duplique pas la règle d'accès à deux endroits.

### D3 — Deux groupes de routes, une seule barre de navigation

```
app/
  (auth)/
    connexion/page.tsx            # le seul écran non prototypé
    callback/route.ts             # échange le code contre une session
  (app)/
    layout.tsx                    # vérifie la session, porte la navigation
    page.tsx                      # Accueil
    classement/page.tsx
    billets/page.tsx
    profil/page.tsx
    concert/[id]/page.tsx         # écrans secondaires : pas d'onglet
    ajouter/page.tsx
    frise/page.tsx
    recap/page.tsx
    amis/recherche/page.tsx
    amis/[id]/page.tsx
```

**Décision : la barre de navigation vit dans le layout du groupe `(app)`, pas dans chaque page.**

Rationale : elle est ainsi rendue une fois et ne se remonte pas à chaque navigation — l'état actif suit le chemin courant. Les écrans secondaires vivent dans le même groupe (ils exigent une session) mais n'apparaissent pas dans la barre, conformément à la spec.

Les segments d'URL sont en français parce qu'ils sont visibles par l'utilisateur ; le code qui les sert reste en anglais.

### D4 — La route de rappel est un route handler, pas une page

**Décision : `/callback` est un `route.ts` qui échange le code contre une session puis redirige.**

Rationale : il n'y a rien à afficher. Une page rendrait un écran intermédiaire visible le temps de l'échange, et l'utilisateur verrait passer un flash blanc entre son e-mail et son accueil.

### D8 — La route de rappel accepte les deux formes de lien

Constaté en implémentant : Supabase produit deux formes de lien selon qui a initié la demande.

- `?code=` — flux PKCE, quand c'est le navigateur qui a demandé le lien. C'est le cas nominal de l'écran de connexion, car `@supabase/ssr` stocke un vérificateur côté client.
- `?token_hash=&type=` — vérification côté serveur, la forme des liens émis hors navigateur et des gabarits d'e-mail utilisant `{{ .TokenHash }}`.

**Décision : `/callback` traite les deux.**

Rationale : ne gérer que la première produit une panne silencieuse particulièrement traîtresse — le lien atterrit sur la connexion avec un message d'expiration, alors qu'il était parfaitement valide. L'utilisateur conclut que l'application est cassée, et le symptôme ne désigne pas la cause. Quelques lignes suffisent à couvrir les deux.

### D9 — L'URL de rappel doit être déclarée dans Supabase

Également constaté en implémentant, et absent du plan initial : Supabase remplace silencieusement tout `redirect_to` qui ne figure pas dans sa liste blanche par l'URL du site. Le lien atterrit alors sur `/` au lieu de `/callback`, le code n'est jamais échangé, et la connexion échoue sans message d'erreur exploitable.

**Décision : `http://localhost:3000/**` et l'URL de production sont déclarées dans *Authentication → URL Configuration → Redirect URLs*.** C'est une configuration obligatoire, pas un réglage optionnel ; elle est inscrite comme tâche pour ne pas rester tacite.

### D5 — L'écran de connexion se construit avec le design system existant

Aucun écran de connexion n'existe en maquette. La tentation serait d'en dessiner un nouveau.

**Décision : il reprend le fond d'ambiance, le logo en dégradé rose-ambre de l'en-tête, le champ de formulaire de la maquette (`surface-alt`, bordure, rayon de 12 px, contour de focus violet) et le bouton principal en dégradé.** Aucune couleur, aucune taille, aucune forme nouvelle n'est introduite.

Rationale : `CLAUDE.md` interdit de réinterpréter le design. Un écran absent de la maquette n'est pas une permission d'inventer, c'est une obligation de déduire — le vocabulaire existe déjà et suffit.

### D6 — Les coquilles portent de vrais états vides, pas des gabarits

**Décision : chaque coquille affiche le titre et le sous-titre de son écran, plus un état vide qui nomme ce qui manque et propose l'action correspondante.**

Rationale : c'est la seule forme qui reste vraie quand les données arrivent — un état vide est un état permanent du produit, pas un échafaudage à retirer. À l'inverse, un faux concert d'exemple devrait être traqué et supprimé à l'étape 4, et un oubli passerait pour une vraie donnée.

### D7 — L'accueil lit le profil, pas seulement la session

**Décision : le layout protégé charge le profil de l'utilisateur connecté et le met à disposition des écrans.**

Rationale : la spec exige que l'identité affichée vienne du profil réel. Cela vérifie au passage, dès ce change, que le trigger de l'étape 2 a bien fait son travail et que la politique de lecture de `profiles` fonctionne — une vérification gratuite qu'il serait dommage de reporter.

## Risks / Trade-offs

**R1 — La délivrabilité d'un SMTP gratuit.** Un e-mail de connexion qui atterrit en indésirables est indistinguable d'un e-mail qui n'est jamais parti, et l'utilisateur conclut que l'application est cassée. → Mitigation : la vérification d'envoi vers une adresse tierce inclut le contrôle du dossier indésirables, et l'écran de confirmation le mentionne explicitement plutôt que d'afficher un « e-mail envoyé » péremptoire.

**R2 — Une protection de route qui protège mal.** Un layout serveur qui vérifie la session peut être contourné si un écran enfant rend du contenu avant la vérification. → Mitigation : la vérification est faite dans le layout du groupe, avant tout rendu d'enfant, et testée par un accès direct à une URL interne sans session — c'est un scénario de la spec.

**R3 — Le clignotement de l'état déconnecté.** Un rendu serveur qui ignore la session, suivi d'une hydratation qui la découvre, produit un écran qui affiche « non connecté » pendant une fraction de seconde. → Mitigation : le client serveur lit les cookies et rend déjà l'état connecté ; la spec en fait un scénario.

**R4 — Les segments d'URL en français figent des choix.** Renommer une route après qu'elle a été partagée casse des liens. → Mitigation : à cette échelle — un utilisateur et ses amis — le coût d'un renommage est nul. La décision est réversible et ne mérite pas d'être sur-pensée.

**Trade-off assumé — dix coquilles d'un coup.** Créer les dix écrans de la section 3 alors que neuf resteront vides plusieurs étapes peut sembler prématuré. C'est pourtant ce qui rend la navigation réellement testable : une barre dont deux onglets sur quatre mènent à une erreur 404 n'est pas un squelette, c'est une maquette de squelette.

## Migration Plan

Aucune donnée existante. Les comptes créés pendant ce change sont réels et conservés — contrairement à ceux de l'étape 2, qui étaient des comptes de test supprimés en fin de vérification.

Retour arrière : la configuration SMTP se retire depuis le tableau de bord Supabase, le code se révoque par un retour au commit précédent.

## Open Questions

- **Le contenu et la langue de l'e-mail de connexion.** Supabase fournit un gabarit par défaut en anglais. Le personnaliser en français est souhaitable mais ne change ni les specs, ni l'approche, ni les tâches : c'est un gabarit à éditer dans le tableau de bord, faisable à tout moment.

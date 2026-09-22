# Tasks

## 1. Envoi des e-mails

- [x] 1.1 Créer un compte Brevo sur le palier gratuit et valider une adresse expéditrice (action utilisateur) ; vérifier que l'adresse apparaît comme validée dans Brevo
- [x] 1.2 Récupérer les identifiants SMTP de Brevo et les saisir dans Supabase, *Authentication > Emails > SMTP Settings* (action utilisateur, identifiants jamais transmis dans la conversation) ; vérifier que Supabase accepte la configuration sans erreur
- [ ] 1.3 Déclarer les URL de rappel dans Supabase, *Authentication > URL Configuration > Redirect URLs* : `http://localhost:3000/**` et, plus tard, l'URL de production (décision D9) ; sans cela Supabase remplace silencieusement la redirection par l'URL du site et le lien n'ouvre jamais de session
- [ ] 1.4 Vérifier l'envoi réel vers une adresse **extérieure au projet Supabase**, dossier indésirables inclus ; sans cette preuve, l'authentification ne fonctionne que pour l'administrateur

## 2. Session et protection

- [x] 2.1 Écrire le middleware de rafraîchissement de session (décision D2) ; vérifier qu'une session ouverte survit à un rechargement et à un redémarrage du serveur de développement
- [x] 2.2 Écrire le layout du groupe `(app)` qui vérifie la session par `getUser()` et redirige les visiteurs non connectés (décision D2) ; vérifier qu'un accès direct à une URL interne sans session redirige avant tout rendu de contenu
- [x] 2.3 Rediriger vers l'accueil un utilisateur déjà connecté qui atteint l'écran de connexion ; vérifier le comportement dans les deux sens
- [x] 2.4 Charger le profil de l'utilisateur connecté dans le layout protégé (décision D7) ; vérifier que le nom affiché provient bien de la base et non d'une valeur codée en dur

## 3. Authentification

- [x] 3.1 Construire l'écran de connexion avec les seules primitives du design system (décision D5) ; vérifier qu'aucune couleur, taille ou forme nouvelle n'est introduite et comparer au vocabulaire de la maquette
- [x] 3.2 Implémenter l'envoi du lien avec une réponse uniforme, qu'une adresse soit connue ou non et que l'envoi aboutisse ou non ; vérifier que le message est identique dans les trois cas
- [x] 3.3 Écrire la route de rappel `/callback` en route handler qui échange le code contre une session puis redirige (décision D4) ; vérifier qu'aucun écran intermédiaire n'apparaît
- [x] 3.4 Traiter les liens invalides, expirés et déjà consommés par un message explicite proposant d'en redemander un ; vérifier les trois cas, dont la réouverture d'un lien déjà utilisé
- [x] 3.5 Implémenter la déconnexion depuis le profil ; vérifier qu'après déconnexion le bouton précédent du navigateur ne redonne accès à aucun écran interne

## 4. Squelette de navigation

- [x] 4.1 Construire la barre de navigation basse à quatre onglets, fidèle à la maquette (fond translucide flouté, bordure haute, onglet actif en `accent-amber`) ; vérifier que l'onglet actif suit le chemin courant
- [x] 4.2 Construire le bouton d'ajout flottant au-dessus de la barre, présent sur les quatre destinations ; vérifier qu'il reste atteignable sans défilement sur un écran long
- [x] 4.3 Créer les quatre destinations principales — Accueil, Classement, Billets, Profil — dans le groupe `(app)` ; vérifier que les quatre onglets mènent à un écran existant, sans erreur 404
- [x] 4.4 Créer les six écrans secondaires — fiche concert, ajout, frise, récap, recherche de profils, profil d'un ami — avec un retour explicite et hors de la barre ; vérifier que le retour ramène à l'écran d'origine

## 5. États vides

- [x] 5.1 Écrire une primitive d'état vide dans `components/ui/`, qui nomme ce qui manque et porte l'action correspondante ; l'ajouter à la page `/design-system`
- [x] 5.2 Donner à chacun des dix écrans son titre, son sous-titre et son état vide (décision D6) ; vérifier par relecture qu'aucun écran n'affiche de donnée fictive

## 6. Vérification

- [ ] 6.1 Parcourir l'application comme un utilisateur neuf : demander un lien, le suivre depuis la boîte mail, atterrir sur l'accueil, visiter les quatre onglets et un écran secondaire, se déconnecter ; vérifier que le parcours tient de bout en bout
- [x] 6.2 Vérifier la mise en page à 320 pixels de large et sur un écran de bureau : aucun débordement horizontal, colonne centrée sur grand écran
- [x] 6.3 Vérifier que deux comptes distincts voient chacun leur propre identité sur l'accueil
- [x] 6.4 Vérifier que `npx tsc --noEmit`, `npm run lint` et `npm run build` passent tous les trois sans erreur
- [x] 6.5 Committer en commits séparés et cohérents (session, authentification, navigation, états vides), messages en français

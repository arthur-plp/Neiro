# Spec Delta

## Purpose

Comment un utilisateur de Neiro prouve son identité sans jamais retenir de mot de passe, ce qu'il advient de sa session au fil du temps, et ce qu'il peut atteindre selon qu'il est connecté ou non.

## ADDED Requirements

### Requirement: Connexion par lien envoyé par e-mail

Le système SHALL permettre de se connecter en saisissant une adresse e-mail et en suivant un lien reçu à cette adresse. Aucun mot de passe MUST NOT être demandé, ni à l'inscription, ni à la connexion.

Une adresse inconnue SHALL créer un compte ; une adresse connue SHALL ouvrir une session sur le compte existant. L'utilisateur n'a pas à savoir dans lequel des deux cas il se trouve.

#### Scenario: Première connexion

- **WHEN** une adresse jamais vue demande un lien et que ce lien est suivi
- **THEN** un compte et son profil existent, et l'utilisateur se retrouve connecté dans l'application

#### Scenario: Retour d'un utilisateur connu

- **WHEN** une adresse déjà inscrite demande un lien et que ce lien est suivi
- **THEN** la session s'ouvre sur le compte existant, avec ses données

#### Scenario: Aucun mot de passe nulle part

- **WHEN** on parcourt les écrans d'authentification
- **THEN** aucun champ de mot de passe n'est présenté

### Requirement: L'envoi ne révèle pas si une adresse est inscrite

Après une demande de lien, le système SHALL afficher le même message de confirmation que l'adresse corresponde ou non à un compte existant.

Cette réponse uniforme évite de transformer l'écran de connexion en outil permettant de savoir qui utilise l'application.

Les défaillances qui ne portent pas sur l'adresse font exception : une panne du service d'envoi ou un quota dépassé ne disent rien de l'utilisateur et tout du service. Le système SHALL les distinguer d'un succès et l'annoncer, plutôt que de laisser quelqu'un attendre un e-mail qui n'est jamais parti.

#### Scenario: Adresse inconnue

- **WHEN** un lien est demandé pour une adresse qui n'a jamais servi
- **THEN** le message affiché est identique à celui d'une adresse inscrite

#### Scenario: Service d'envoi en panne

- **WHEN** le service d'envoi refuse la demande pour une raison qui ne dépend pas de l'adresse
- **THEN** l'utilisateur est informé que l'envoi a échoué et que son adresse n'est pas en cause, au lieu d'être invité à consulter sa boîte mail

#### Scenario: Quota dépassé

- **WHEN** trop de demandes sont envoyées en peu de temps
- **THEN** l'utilisateur est invité à patienter, et aucune information sur l'existence du compte n'est divulguée

### Requirement: Un lien est à usage unique et périmable

Un lien de connexion SHALL cesser d'être valide après avoir été utilisé, et SHALL expirer au bout d'un délai borné même s'il n'a pas servi.

Un lien invalide, expiré ou déjà consommé SHALL conduire à un message explicite proposant d'en demander un nouveau, jamais à une page d'erreur brute ni à un écran vide.

#### Scenario: Lien réutilisé

- **WHEN** un lien déjà utilisé est ouvert une seconde fois
- **THEN** l'utilisateur voit un message lui expliquant que le lien n'est plus valable et lui proposant d'en redemander un

#### Scenario: Lien altéré

- **WHEN** l'adresse de rappel est ouverte avec un code manquant ou modifié
- **THEN** l'utilisateur est renvoyé vers la connexion avec un message compréhensible, et aucune session n'est ouverte

### Requirement: La session survit au temps et aux rechargements

Une session ouverte SHALL être conservée d'une visite à l'autre et SHALL être rafraîchie automatiquement avant expiration, sans que l'utilisateur ait à se reconnecter ni à recharger la page.

#### Scenario: Retour le lendemain

- **WHEN** l'utilisateur rouvre l'application le lendemain sans s'être déconnecté
- **THEN** il est toujours connecté et accède directement à ses écrans

#### Scenario: Cohérence entre serveur et navigateur

- **WHEN** une page rendue côté serveur et le navigateur consultent l'identité de l'utilisateur
- **THEN** les deux voient la même session, sans clignotement d'un état déconnecté au chargement

### Requirement: L'intérieur de l'application exige une session

Tout écran de l'application SHALL exiger une session valide. Un visiteur sans session SHALL être renvoyé vers la connexion avant que le moindre contenu d'écran ne soit rendu.

Un utilisateur déjà connecté qui atteint l'écran de connexion SHALL être renvoyé vers l'accueil.

#### Scenario: Accès direct par URL

- **WHEN** un visiteur non connecté ouvre directement l'adresse d'un écran interne
- **THEN** il est renvoyé vers la connexion, et aucune donnée n'a été rendue

#### Scenario: Connexion déjà ouverte

- **WHEN** un utilisateur connecté ouvre l'écran de connexion
- **THEN** il est renvoyé vers l'accueil

### Requirement: Déconnexion

Le système SHALL offrir une déconnexion explicite depuis le profil. Après déconnexion, la session SHALL être détruite côté serveur comme côté navigateur, et un retour en arrière dans l'historique MUST NOT redonner accès à un écran interne.

#### Scenario: Retour arrière après déconnexion

- **WHEN** l'utilisateur se déconnecte puis utilise le bouton précédent du navigateur
- **THEN** il n'atteint aucun écran interne et se retrouve sur la connexion

### Requirement: Les e-mails partent réellement, y compris vers des tiers

Le système SHALL envoyer ses e-mails d'authentification par un service capable d'écrire à n'importe quelle adresse, et non seulement à celles des membres du projet.

Cette capacité SHALL être vérifiée en envoyant un lien vers une adresse qui n'est pas celle de l'administrateur du projet, et en constatant sa réception.

#### Scenario: Inscription d'un ami

- **WHEN** un lien est demandé pour l'adresse d'une personne extérieure au projet Supabase
- **THEN** l'e-mail arrive et le lien ouvre bien une session

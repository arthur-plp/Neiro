# Neiro — Cahier des charges (PWA de suivi de concerts)

> Document destiné à un agent Claude Code. À fournir avec, si possible, le fichier `neiro-maquette.html` joint (maquette visuelle interactive de référence). Objectif : construire la PWA fonctionnelle décrite ci-dessous, avec la stack et l'ordre de développement indiqués en sections 7 et 10.

## 1. Concept

Application personnelle et gratuite (usage solo, un seul utilisateur principal + ses amis) pour :
- noter et journaliser les concerts et festivals vus,
- établir un classement personnel,
- garder ses billets (à venir et passés) dans l'appli,
- comparer avec des amis ajoutés comme compagnons de concert.

**Nom retenu : Neiro (音色)** — mot japonais désignant le timbre, la "couleur" propre d'un son ou d'une voix, ce qui rend chaque interprétation unique. Aucun conflit trouvé lors d'une recherche rapide (à vérifier soi-même sur l'App Store / Play Store / INPI avant dépôt officiel). Noms écartés en cours de route : Setlist (déjà pris), Souche/Loge/Standing (pistes françaises), Yoin (marque belge active sur yoin.be), Kyomei (appli existante sur l'App Store, même thème musical), Zankyo et Nagori (libres mais moins directement musicaux).

## 2. Identité visuelle (déjà validée dans la maquette)

**Palette**
| Rôle | Couleur | Usage |
|---|---|---|
| Fond | `#0B0B14` | fond général, ambiance "backstage" |
| Surface | `#17161F` | fond des écrans |
| Surface alt | `#211F2C` | cartes, champs de formulaire |
| Bordure | `#2B293A` | séparateurs, contours |
| Texte | `#F5F3FF` | texte principal |
| Texte atténué | `#8D89A0` | sous-titres, labels |
| Accent rose | `#FF3D68` | accent chaud, CTA |
| Accent ambre | `#FFC857` | notes, records, highlights |
| Accent violet | `#8B7CFA` | liens, sélections, badges "ami" |
| Accent teal | `#2DD4BF` | tags secondaires, succès/détection |

**Typographies**
- Titres / logo / gros chiffres : **Anton** (poster, condensé, très typé "affiche de concert")
- Interface / corps de texte : **Space Grotesk** (400/500/600/700)
- Données / dates / codes : **IBM Plex Mono**

**Élément signature** : les concerts sont affichés comme de vraies souches de billet — encoches rondes sur les côtés, ligne pointillée de déchirure, légère rotation aléatoire (façon punaisé sur un mur).

## 3. Écrans (tous prototypés dans la maquette HTML)

1. **Accueil** — fil des concerts récents (souches), stats rapides (nb concerts, artistes, cette année), accès recherche + frise chronologique
2. **Classement** — toggle "Mes concerts" / "Entre amis" ; filtres tous temps / cette année / par genre ; classement avec podium visuel
3. **Billets** — billets à venir (compte à rebours, badge hors-ligne, rappel, champ "note tes attentes") et billets passés
4. **Ajouter un concert** — toggle "Remplir manuellement" / "Scanner un billet" (photo ou coller un e-mail → champs détectés automatiquement à confirmer) ; formulaire avec 4 notes séparées (son/ambiance/setlist/prix), tags compagnons, tags chansons jouées, notes libres
5. **Profil** — stats globales, bouton "Ton année en concerts" (récap façon Wrapped), graphique concerts/année, badges (débloqués/verrouillés), records insolites, villes visitées (heatmap), liste d'amis, réglages
6. **Fiche concert détaillée** — notes par critère, section Avant/Après (attentes vs ressenti), setlist réelle jouée, compagnons présents (cliquables), souvenirs/photos
7. **Profil d'un ami** — concerts vécus ensemble
8. **Recherche de profils** — barre de recherche, amis actuels, suggestions, bouton d'ajout en ami (états : Ajouter → Envoyé → Ami ✓)
9. **Frise chronologique** — vue verticale de tous les concerts, groupés par année
10. **Récap annuel ("Wrapped")** — chiffres clés de l'année en cours, mis en avant visuellement

## 4. Fonctionnalités par thème

**Journal & notation**
- Ajout manuel ou par scan/import (photo de billet ou collage d'un texte d'e-mail de confirmation → extraction automatique artiste/salle/date/catégorie à valider)
- Notation multi-critères : son, ambiance, setlist, prix (au lieu d'une seule étoile globale)
- Setlist réelle jouée ce soir-là (liste de titres)
- Notes libres / souvenirs, photos
- Avant/Après : champ "attentes" rempli avant le concert (depuis l'écran Billets), comparé après coup au ressenti réel dans la fiche détaillée

**Billets**
- Billets à venir avec compte à rebours et rappel activable
- Disponibilité hors-ligne (essentiel en PWA : les billets doivent être consultables sans réseau, donc en cache local / IndexedDB, pas seulement en ligne)
- Archive des billets passés

**Social / compagnons**
- Recherche de profils, envoi et acceptation de demandes d'ami
- Tag des personnes présentes à chaque concert (compagnons)
- Consultation du profil d'un ami et des concerts vécus ensemble
- Mini-classement "entre amis" (qui a vu le plus de concerts sur une période donnée)

**Stats & gamification**
- Classement personnel (tous temps / cette année / par genre)
- Badges de progression (ex. "10 concerts en 2025", "3 festivals", "1er concert à l'étranger" — certains verrouillés tant que non débloqués)
- Records insolites (concert le plus ancien, plus long trajet, artiste le plus revu, marathon de concerts en un week-end...)
- Carte/heatmap des villes visitées
- Récap annuel type "Wrapped"
- Frise chronologique de tous les concerts

**Repoussé à plus tard (complexité backend)**
- Suivre des artistes et être alerté quand ils annoncent une date à proximité (nécessite une base d'événements en temps réel type Songkick/Bandsintown/Ticketmaster — hors scope V1)

## 5. Modèle de données (proposition de base)

```
User
 - id, nom, avatar, date d'inscription

Concert
 - id, userId, artiste, salle, ville, date, genre
 - photo/illustration éventuelle
 - noteSon, noteAmbiance, noteSetlist, notePrix (1-5)
 - setlist: [titres de chansons]
 - notesLibres (texte)
 - attentesAvant (texte, optionnel, rempli avant la date)
 - ressentiApres (texte, optionnel, rempli après)
 - companions: [userId] (amis tagués comme présents)
 - photos: [références image]
 - statut: "à venir" | "passé"

Ticket (peut être fusionné avec Concert ou distinct si plusieurs billets par concert)
 - id, concertId, catégorie (fosse, carré or...), heure, rappelActif (bool)
 - sourceImport: "manuel" | "scan" | "email"

Friendship
 - userId, friendId, statut: "en attente" | "ami"

Badge
 - id, userId, type, dateObtention (null si non obtenu)
```

## 6. Socle technique retenu

**Vercel (hébergement/front) + Supabase (base de données, auth, stockage)** — combinaison 100% gratuite pour un usage personnel, aucune carte bancaire requise pour démarrer.

| Brique | Choix | Rôle |
|---|---|---|
| Hébergement | **Vercel** | Déploiement du front, sous-domaine gratuit type `neiro.vercel.app`, déploiement automatique depuis GitHub |
| Base de données | **Supabase (Postgres)** | 500 Mo gratuits ; adaptée car les données sont relationnelles (concerts ↔ compagnons ↔ amis ↔ badges) |
| Authentification | **Supabase Auth** | Incluse, gère les comptes (email, magic link, ou OAuth) |
| Stockage fichiers | **Supabase Storage** | 1 Go gratuit, pour les photos de concerts |
| Permissions amis/données | **Row Level Security (Supabase)** | Point décisif du choix : permet de définir au niveau de la base elle-même qui voit quoi (ex. un ami ne voit que les concerts où il est tagué), plus sûr qu'une logique codée à la main |

**Alternatives envisagées et écartées** :
- *Vercel + Firebase* — viable aussi (Firestore, Auth, Storage gratuits), mais NoSQL moins naturel pour des données aussi reliées entre elles (concerts/amis/badges), et règles de sécurité plus verbeuses à écrire que la RLS de Supabase.
- *Cloudflare Pages + D1 + R2* — quotas gratuits encore plus généreux, mais pas d'authentification intégrée : il faudrait la coder à la main ou greffer un service tiers, ce qui complique le démarrage pour un gain inutile à cette échelle d'usage.

## 7. Stack technique (front & back)

**Front-end**
| Techno | Rôle |
|---|---|
| **Next.js 15 (App Router) + TypeScript** | Framework principal, SSR/SSG natif sur Vercel |
| **Tailwind CSS** | Styling, variables CSS de la section 2 déclinées en tokens Tailwind |
| **Serwist** | Manifest PWA + service worker (successeur maintenu de `next-pwa`, qui n'est plus actif) ; stratégies de cache par route : cache-first pour billets/assets statiques, network-first pour le fil et le classement entre amis |
| **TanStack Query** | Cache et synchronisation des requêtes Supabase ; affichage des données en cache pendant revalidation en fond |
| **React Hook Form + Zod** | Formulaires (ajout concert, scan) et validation, schéma Zod partagé front/back |
| **Zustand** | État UI local léger (toggles, écran actif) — pas de state manager lourd, l'essentiel des données vit déjà dans Supabase + TanStack Query |

**Back-end**
| Techno | Rôle |
|---|---|
| **Supabase Postgres + RLS** | Base de données et permissions (ex. un ami ne voit que les concerts où il est tagué), posées au niveau base plutôt qu'en code |
| **Drizzle ORM** | Schéma typé + migrations SQL versionnées ; préféré à Prisma pour des cold starts plus légers sur Vercel/Edge |
| **Supabase Edge Functions (Deno)** | Logique serveur : parsing du texte d'e-mail de billet, calcul des badges/records/récap annuel, envoi des Web Push de rappel |
| **Supabase Auth** | Magic link par e-mail en V1 (zéro mot de passe à gérer) ; OAuth Google ajoutable plus tard |

**Choix écartés et pourquoi** : Prisma (cold starts plus lourds que Drizzle en environnement serverless/edge) ; `next-pwa` (non maintenu, remplacé par Serwist) ; Redux (état déjà porté par Supabase + TanStack Query, inutile d'alourdir avec un state manager global).

## 8. Notes techniques pour la V1 fonctionnelle

- **Stockage** : les données persistent réellement dans Supabase (Postgres), contrairement à la maquette actuelle qui est purement visuelle et sans sauvegarde.
- **Hors-ligne** : Supabase étant une base distante, prévoir une couche de cache local (IndexedDB côté navigateur, via le service worker) pour que les billets restent consultables sans réseau — ne pas dépendre uniquement d'un appel réseau à Supabase pour cet écran précis.
- **PWA** : prévoir un manifest.json + service worker (ex. via `next-pwa` si le front est en Next.js) pour l'installation sur l'écran d'accueil et la stratégie de cache (cache-first pour les billets/assets statiques, network-first pour le fil d'actualité et le classement entre amis).
- **Scan de billet** : en V1 simple, se limiter au collage de texte d'e-mail (extraction de champs par mots-clés/regex) ; l'OCR sur photo de billet papier est une amélioration ultérieure plus complexe.
- **Notifications de rappel** : les rappels avant un billet nécessitent les Notifications Web Push (support variable selon navigateur/OS, à vérifier).

## 9. Ce qui est déjà prototypé (fichier `neiro-maquette.html`)

La maquette HTML jointe est un prototype visuel interactif complet (navigation entre tous les écrans listés en section 3, formulaires, toggles, boutons cliquables) mais **sans aucune donnée réelle ni persistance** — tout le contenu est statique/factice. Elle sert de référence exacte pour le design (couleurs, polices, composants, mise en page) lors du développement de la vraie version.

## 10. Instructions pour l'agent de développement

Ce document, accompagné de `neiro-maquette.html`, contient tout le nécessaire pour démarrer l'implémentation. Ordre de construction suggéré :

1. Initialiser le projet Next.js + TypeScript + Tailwind, reproduire les tokens de design (section 2) en configuration Tailwind
2. Mettre en place Supabase (projet, schéma Drizzle à partir du modèle de données en section 5, RLS de base pour l'isolation par utilisateur)
3. Authentification (magic link) et squelette de navigation reprenant les écrans de la section 3
4. Journal de concerts en CRUD complet (ajout manuel, notation multi-critères, setlist, avant/après) avec persistance réelle Supabase
5. Billets : stockage, compte à rebours, cache hors-ligne (Serwist), rappel (Web Push)
6. Volet social : recherche de profils, demandes d'ami, tag de compagnons, RLS ajustée pour la visibilité partagée
7. Stats & gamification : classement, badges, records, heatmap villes, récap annuel — calculs faisables côté Edge Function ou client selon le volume de données
8. Scan de billet (V1 : collage de texte d'e-mail, extraction par regex/mots-clés)
9. PWA finale : manifest, icônes, installation, tests hors-ligne

À chaque étape, se référer à `neiro-maquette.html` pour la fidélité visuelle (composants, espacements, couleurs, typographies) plutôt que de réinterpréter le design.

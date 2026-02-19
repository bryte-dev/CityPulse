# CityPulse 🎉

**CityPulse** est une plateforme web dédiée à la découverte, création et participation à des événements locaux, pensée pour les jeunes (16–25 ans).

## 🚀 Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styles | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Base de données | Firebase Firestore |
| Upload images | Cloudinary |
| Authentification | Better-Auth |
| Paiement | Stripe (mode test) |
| Publicités | Google AdSense |
| Déploiement | Vercel-ready |

## ✨ Fonctionnalités

- 🔐 **Authentification** : Inscription/connexion email + Google OAuth
- 📅 **Événements** : Création, modification, suppression avec upload Cloudinary
- 🏠 **Découverte** : Filtres (catégorie, date, prix), recherche, tri, vues grille/liste
- 👆 **Inscriptions** : Inscription/désinscription en temps réel
- 💬 **Commentaires** : Avis avec notation (1-5 ⭐) et réponses imbriquées
- 👤 **Profil** : Gestion profil, événements créés, participations
- 📊 **Dashboard** : Stats organisateur, gestion événements
- 💳 **Paiement** : Plan Pro via Stripe (2 CHF/mois)
- 🎯 **Publicités** : AdSense avec placeholders
- 🌙 **Dark mode** : Persisté dans localStorage
- 📱 **Responsive** : Mobile-first

## 🔧 Installation

```bash
# 1. Cloner le repo
git clone <repo-url>
cd citypulse

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Remplir .env.local avec vos clés (voir ci-dessous)

# 4. Lancer en développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🔑 Variables d'environnement

Copier `.env.example` en `.env.local` et remplir :

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Better-Auth
BETTER_AUTH_SECRET=    # Générer : openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Google AdSense (optionnel)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
```

## 🔥 Setup Firebase

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
2. Créer un projet (ou utiliser `citypulse-81660`)
3. **Activer Firestore** : Build → Firestore Database → Create database
4. **Activer Authentication** : Build → Authentication → Sign-in method
   - Activer **Email/Password**
   - Activer **Google** (nécessite Google Client ID/Secret)
5. **Récupérer les clés** : Project Settings → Your apps → Add app (Web) → Copy config
6. **Règles Firestore** recommandées :

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events: lecture publique, écriture authentifiée
    match /events/{eventId} {
      allow read: if resource.data.visibility == 'public' || request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.organizerId;
    }
    // Registrations
    match /registrations/{regId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }
    // Comments
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }
    // Users
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## ☁️ Setup Cloudinary

1. Créer un compte sur [cloudinary.com](https://cloudinary.com)
2. Dashboard → Settings → Upload presets
3. Créer un **Upload Preset** nommé `citypulse_events` (mode Unsigned)
4. Récupérer le **Cloud Name** dans le Dashboard
5. Remplir `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` dans `.env.local`
6. Pour les webhooks serveur : récupérer **API Key** et **API Secret**

## 🔐 Setup Better-Auth

1. Générer un secret : `openssl rand -base64 32`
2. Remplir `BETTER_AUTH_SECRET` dans `.env.local`
3. Pour Google OAuth :
   - Aller sur [console.cloud.google.com](https://console.cloud.google.com)
   - Créer des credentials OAuth 2.0
   - Ajouter `http://localhost:3000/api/auth/callback/google` comme redirect URI
   - Copier Client ID et Client Secret

## 💳 Setup Stripe (mode test)

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Dashboard → Developers → API keys
3. Copier **Publishable key** (`pk_test_...`) et **Secret key** (`sk_test_...`)
4. **Créer un produit** : Products → Add product
   - Nom : "CityPulse Pro"
   - Prix : 2 CHF/mois (recurring)
   - Copier le **Price ID** (`price_...`)
   - Ajouter dans `.env.local` : `NEXT_PUBLIC_STRIPE_PRICE_ID=price_...`
5. **Webhook local** (développement) :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copier le webhook secret (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`
6. **Carte test** : `4242 4242 4242 4242`, n'importe quelle date future, n'importe quel CVC

## 📢 Setup Google AdSense (optionnel)

1. S'inscrire sur [adsense.google.com](https://adsense.google.com)
2. Une fois approuvé, récupérer le **Publisher ID** (`ca-pub-XXXXXXXXXXXXXXXX`)
3. Remplir `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX`
4. Sans cette variable, des placeholders stylés s'affichent automatiquement

## 🏗️ Structure Firestore

```
users/{userId}
  email, name, avatar, bio, role, stripeCustomerId, subscriptionStatus, createdAt, updatedAt

events/{eventId}
  title, description, date, startTime, endTime, location, category
  organizerId, organizerName, maxParticipants, participantCount
  visibility, price, isFree, imageUrl, sponsored, createdAt, updatedAt

registrations/{registrationId}
  eventId, userId, userName, userAvatar, registeredAt

comments/{commentId}
  eventId, userId, userName, userAvatar, text, rating, parentCommentId, createdAt
```

## 🚀 Déploiement Vercel

1. Pousser le code sur GitHub
2. Importer le repo dans [vercel.com](https://vercel.com)
3. Configurer les variables d'environnement dans Vercel Dashboard
4. Mettre à jour `BETTER_AUTH_URL` avec l'URL de production
5. Mettre à jour les redirect URIs OAuth et Stripe webhooks

```bash
# Build de production
npm run build
npm start
```

## 📁 Structure du projet

```
app/
  (auth)/          # Pages d'authentification
    login/
    register/
    forgot-password/
  (main)/          # Pages principales
    page.tsx         # Accueil / Découverte
    events/
      create/        # Création événement
      [id]/          # Détail événement
    dashboard/       # Dashboard organisateur
    profile/         # Profil utilisateur
      [userId]/      # Profil public
    pricing/         # Plans tarifaires
  api/
    auth/            # Better-Auth handler
    stripe/          # Stripe checkout + webhook
components/
  ads/             # AdBanner
  events/          # EventCard, EventFilters, EventList
  layout/          # Navbar, Footer
  providers/       # ThemeProvider
  ui/              # shadcn/ui components
lib/
  auth.ts          # Configuration Better-Auth
  auth-client.ts   # Client Better-Auth
  db.ts            # Opérations Firestore
  firebase.ts      # Configuration Firebase
  utils.ts         # Utilitaires
types/             # Types TypeScript
```

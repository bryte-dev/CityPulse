# 🎉 CityPulse

**Découvrez, créez et participez aux meilleurs événements de votre ville !**

CityPulse est une plateforme web moderne dédiée à la découverte et à la création d'événements locaux, pensée principalement pour les jeunes (16–25 ans). L'objectif est de répondre simplement à la question « On fait quoi ? » en centralisant toutes les sorties locales, y compris les petits événements spontanés souvent invisibles sur les réseaux sociaux classiques.

![CityPulse Banner](https://via.placeholder.com/1200x400/7c3aed/ffffff?text=CityPulse)

## ✨ Fonctionnalités

### Pour les Participants
- 🔍 **Découverte d'événements** : Parcourez tous les événements locaux avec filtres avancés (date, lieu, catégorie, prix)
- 🎫 **Participation en un clic** : Inscrivez-vous facilement aux événements qui vous intéressent
- 💬 **Interaction sociale** : Commentez, notez et discutez avec d'autres participants
- 📱 **Notifications** : Recevez des alertes pour les modifications d'événements
- 👤 **Profil personnalisé** : Gérez votre profil et consultez votre historique

### Pour les Organisateurs
- ✏️ **Création d'événements** : Créez des événements publics ou privés en quelques minutes
- 📊 **Dashboard complet** : Suivez vos statistiques (participants, taux de participation, avis)
- 👥 **Gestion des participants** : Gérez les inscriptions et invitations
- 💰 **Événements gratuits ou payants** : Définissez vos propres tarifs
- 📸 **Upload d'images** : Personnalisez vos événements avec des visuels attractifs

## 🛠 Stack Technique

- **Frontend** : [Next.js 14+](https://nextjs.org/) (App Router) avec TypeScript
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Backend & BDD** : [Firebase](https://firebase.google.com/) (Firestore, Storage, Cloud Messaging)
- **Authentification** : [Better-Auth](https://better-auth.com/)
- **Hébergement** : Prêt pour [Vercel](https://vercel.com/)

## 📁 Structure du Projet

```
CityPulse/
├── app/
│   ├── (auth)/                  # Pages d'authentification
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (main)/                  # Pages principales
│   │   ├── page.tsx             # Home / Découverte
│   │   ├── events/
│   │   │   ├── [id]/           # Détail événement
│   │   │   └── create/         # Créer un événement
│   │   ├── dashboard/          # Espace organisateur
│   │   ├── profile/            # Profil utilisateur
│   │   └── pricing/            # Page tarifs
│   ├── api/
│   │   └── auth/[...all]/      # API Better-Auth
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # Composants shadcn/ui
│   ├── events/                 # Composants événements
│   ├── layout/                 # Layout (Navbar, Footer)
│   └── auth/                   # Composants auth
├── lib/
│   ├── firebase.ts             # Configuration Firebase
│   ├── auth.ts                 # Configuration Better-Auth
│   ├── db.ts                   # Helpers Firestore
│   └── utils.ts                # Utilitaires
├── types/
│   └── index.ts                # Types TypeScript
└── public/
```

## 🚀 Installation et Setup

### Prérequis

- Node.js 18+ et npm
- Un compte [Firebase](https://firebase.google.com/)
- Un compte [Vercel](https://vercel.com/) (pour le déploiement)

### 1. Cloner le repository

```bash
git clone https://github.com/bryte-dev/CityPulse.git
cd CityPulse
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Firebase

#### a) Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Suivez les étapes de création

#### b) Activer Firestore

1. Dans votre projet Firebase, allez dans "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez le mode "test" pour commencer (⚠️ n'oubliez pas de configurer les règles de sécurité plus tard)
4. Sélectionnez une région proche de vos utilisateurs

#### c) Activer Firebase Storage

1. Allez dans "Storage"
2. Cliquez sur "Commencer"
3. Acceptez les règles par défaut

#### d) Activer Firebase Authentication

1. Allez dans "Authentication"
2. Cliquez sur "Commencer"
3. Activez les méthodes de connexion souhaitées (Email/Mot de passe, Google, GitHub)

#### e) Récupérer les clés de configuration

1. Allez dans les paramètres du projet (⚙️)
2. Dans "Vos applications", créez une application web
3. Copiez les clés de configuration

### 4. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

Remplissez les variables avec vos clés Firebase :

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_projet_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id

# Better-Auth
BETTER_AUTH_SECRET=une_cle_secrete_longue_et_aleatoire
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth (optionnel)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### 5. Configurer les règles Firestore

Dans Firebase Console > Firestore Database > Règles, ajoutez :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events
    match /events/{eventId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.organizerId;
    }
    
    // Comments
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Chat Messages
    match /chatMessages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Users
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Configurer les règles Storage

Dans Firebase Console > Storage > Règles, ajoutez :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{eventId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.resource.size < 5 * 1024 * 1024 && 
        request.resource.contentType.matches('image/.*');
    }
    
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 2 * 1024 * 1024 && 
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 7. Lancer l'application en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🌐 Déploiement sur Vercel

### 1. Préparer le déploiement

Assurez-vous que votre projet est sur GitHub :

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com/)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Configurez les variables d'environnement (copiez depuis `.env.local`)
5. Cliquez sur "Deploy"

### 3. Mettre à jour Better-Auth URL

Une fois déployé, mettez à jour la variable `BETTER_AUTH_URL` avec l'URL de votre application Vercel :

```env
BETTER_AUTH_URL=https://votre-app.vercel.app
```

## 🎨 Design & UI/UX

- **Couleurs** : Dégradés vibrants (violet, rose, orange) adaptés aux jeunes
- **Typography** : Police Inter pour une lecture moderne
- **Mobile-first** : Entièrement responsive sur tous les appareils
- **Dark mode** : Support du mode sombre intégré
- **Animations** : Transitions douces avec Framer Motion

## 🔐 Sécurité

- Authentification sécurisée avec Better-Auth
- Validation des données côté serveur
- Protection des routes sensibles
- Règles Firebase strictes
- Gestion des rôles (participant / organisateur / admin)

## 📱 Fonctionnalités à venir

- [ ] Notifications push avec Firebase Cloud Messaging
- [ ] Intégration de cartes interactives (Google Maps)
- [ ] Système de recommandations basé sur les préférences
- [ ] Export des événements au format iCal
- [ ] Application mobile (React Native)
- [ ] Mode hors ligne (PWA)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter :

- Email : contact@citypulse.ch
- Twitter : [@CityPulse](https://twitter.com/citypulse)

---

Fait avec ❤️ pour la communauté suisse

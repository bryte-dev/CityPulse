Demo checklist — préparer une présentation rapide

But: fournir un environnement local test prêt à présenter (Stripe, Cloudinary, Firebase, pubs démo, contact)

1. Variables d'environnement (.env.local)
- NEXT_PUBLIC_FIREBASE_API_KEY=...
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
- NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
- NEXT_PUBLIC_FIREBASE_APP_ID=...
- FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
- FIREBASE_CLIENT_EMAIL=...
- STRIPE_SECRET_KEY=sk_test_...
- NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
- STRIPE_WEBHOOK_SECRET=whsec_...
- NEXT_PUBLIC_ADS_DEMO=true
- NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=unsigned_preset_name
- NEXT_PUBLIC_ADSENSE_CLIENT_ID= (optional, leave empty for demo)

2. Installer dépendances

```bash
npm install
```

3. Démarrer Firebase Emulators (optionnel mais recommandé)
- Si tu utilises Firebase local emulator, démarre :

```bash
firebase emulators:start --only firestore,auth
```

4. Pubs (option simple)

- Le composant `AdBanner` affiche un espace publicitaire par défaut si aucune pub n'existe dans Firestore. Tu n'as rien à seed pour la démo — laisse tel quel pour afficher un placeholder.
- Si tu veux malgré tout ajouter une annonce manuellement : va dans la console Firebase → Firestore → collection `ads` et ajoute un document avec `imageUrl`, `link`, `title`.

5. Stripe
- Récupère `STRIPE_SECRET_KEY` et `NEXT_PUBLIC_STRIPE_PRICE_ID` (crée un produit + price de type récurrent/month dans ton dashboard Stripe).
- Pour tester les webhooks localement :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook --events checkout.session.completed customer.subscription.deleted
```

Copie la `STRIPE_WEBHOOK_SECRET` retournée par `stripe listen` dans `.env.local`.

6. Cloudinary
- Crée un upload preset non signé si tu veux permettre upload côté client. Ajoute son nom dans `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

7. Lancer l'app

```bash
npm run dev
```

8. Tester pubs
- Avec `NEXT_PUBLIC_ADS_DEMO=true`, le composant `AdBanner` affichera une pub de la collection `ads` et enregistrera les impressions (`ad_impressions`) et clics (`ad_clicks`) dans Firestore.
- Vérifie les collections `ads`, `ad_impressions`, `ad_clicks` dans la console Firebase.

9. Tester contact
- Va sur `/contact` et envoie un message; les messages sont sauvegardés dans `support_messages`.

11. Restreindre les opérations administrateur (protection rapide)

- Option A (rapide): configure l'env var `ADMIN_UIDS` avec les UIDs Firebase des comptes admin (séparés par des virgules). Exemple:

```bash
ADMIN_UIDS=uid1,uid2
```

L'API interne `/api/admin/check` vérifie le token Firebase et retourne si l'utilisateur est admin.

-- Option B (via Firestore): crée manuellement le document `config/admins` dans la console Firebase avec un champ `uids` qui est un tableau d'UIDs (ex: `['uid1','uid2']`).

Les règles Firestore fournies dans `firestore.rules` restreignent les écritures sensibles (`ads`, suppression de `support_messages`, etc.) aux UIDs listés dans `config/admins`.

Pour déployer en production, utilise plutôt les Custom Claims ou un système d'identité plus robuste; ceci est une solution simple, gratuite et rapide pour une démo.

12. Mode présentation (restreindre l'accès public)

- Si tu veux déployer le site mais limiter l'accès pendant la présentation, définis la variable d'environnement `PRESENTATION_PASSWORD` sur Vercel (ou dans `.env.local` pour tests locaux). Ex :

```bash
PRESENTATION_PASSWORD=monmotdepassepresent
```

Quand `PRESENTATION_PASSWORD` est défini, une page `/presentation-login` protège l'accès public. Seuls les visiteurs qui saisissent le bon mot de passe verront le site. Cela évite d'exposer ta BDD ou l'app au public.

Notes:
- Garde `PRESENTATION_PASSWORD` court et partage-le uniquement aux personnes de la démo.
- Pour la production, remplace cette solution par un contrôle d'accès plus robuste si nécessaire.


10. Présentation
- Prépare une courte démo : 1) créer compte, 2) montrer profil + abonnement, 3) s'abonner via Stripe (mode test), 4) vérifier que webhook met `subscriptionStatus: pro` dans Firestore, 5) montrer la pub démo et les logs d'impressions/clics, 6) envoyer message via `/contact` et montrer la collection `support_messages`.

Si tu veux, je peux :
- Lancer le seed script pour toi (si tu veux que j'exécute des actions dans l'environnement local),
- Vérifier les règles Firestore recommandées pour production,
- Générer un fichier `firebase.rules` d'exemple pour protéger `support_messages` et `ads`.

---
Notes de sécurité rapide:
- Ne commite jamais `FIREBASE_PRIVATE_KEY` en clair dans le repo.
- Pour la prod, protège les endpoints sensibles (webhook, cancel) et limite les opérations write sur les collections sensibles via rules ou Admin SDK.

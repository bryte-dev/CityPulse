Vercel deployment guide — quick demo (Stripe test, Cloudinary test, Firebase Admin)

Goal: deploy the app to Vercel for a private presentation. Keep Stripe in test mode and protect the site with `PRESENTATION_PASSWORD`.

1) Create a Vercel project
- Connect your GitHub/Repo to Vercel and create a new project. Use the root of this repository.

2) Required Environment Variables (set these in Vercel > Project Settings > Environment Variables)
- For Firebase client (public):
  - `NEXT_PUBLIC_FIREBASE_API_KEY` = from Firebase project settings
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`

- For Firebase Admin (server):
  - `FIREBASE_CLIENT_EMAIL` = service account client_email
  - `FIREBASE_PRIVATE_KEY` = the service account private_key (replace real newlines with literal `\n` when pasting into Vercel)
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (same as above)

- Stripe (test):
  - `STRIPE_SECRET_KEY` = sk_test_...
  - `NEXT_PUBLIC_STRIPE_PRICE_ID` = price_... (the test price id for the subscription)
  - `STRIPE_WEBHOOK_SECRET` = (see step 5)

- Cloudinary (client upload preset):
  - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` = your unsigned preset name (or leave blank if not using uploads)

- Ads demo toggle (optional):
  - `NEXT_PUBLIC_ADS_DEMO` = `true` (so demo ads from Firestore will display)

- Presentation protection (recommended):
  - `PRESENTATION_PASSWORD` = pick a password to restrict public access during your demo

- Admins (optional):
  - `ADMIN_UIDS` = comma-separated Firebase UIDs that should be admin (optional if you seed `config/admins`)

3) Build & Output Settings
- Framework Preset: Next.js (Vercel should auto-detect)
- Build Command: `npm run build` (Vercel uses `npm install` automatically)
- Output Directory: default (Next.js handles it)

4) Stripe webhook configuration (test events)
- For the webhook to update Firestore on subscription completed, create a webhook endpoint in the Stripe Dashboard (in Test mode):
  - URL: `https://<your-vercel-domain>/api/stripe/webhook`
  - Events: `checkout.session.completed`, `customer.subscription.deleted` (and any others you need)
- After creating the endpoint, copy the Signing Secret (starts with `whsec_`) and paste it into Vercel env `STRIPE_WEBHOOK_SECRET`.
- Note: If you prefer to use `stripe listen` locally, you can forward events to your local server, but for a deployed demo it’s easier to register the endpoint directly in the Stripe Dashboard (test mode).

5) Seeding demo data (ads + admin list)
- Locally (with service account env vars set) run:

```bash
# seed a demo ad
node scripts/seed-demo-ads.js

# seed admin UIDs (option 1: via env)
ADMIN_UIDS=uid1,uid2 node scripts/seed-admins.js
# or via args
node scripts/seed-admins.js uid1 uid2
```

- Alternatively, use the Firestore Console to manually add a document in `ads` and `config/admins`.

6) Presentation flow
- Set `PRESENTATION_PASSWORD` in Vercel env to restrict access
- Deploy the project
- Visit the site; visitors will be redirected to `/presentation-login` until they enter the password
- Stripe will use test mode values — users can complete a test checkout; Stripe will call your deployed webhook and your server will update Firestore accordingly

7) Notes & tips
- For `FIREBASE_PRIVATE_KEY` in Vercel: paste the private key with `\n` escaped for newlines. Example value must literally contain `\n` sequences.
- Do NOT commit secrets to the repo. Use Vercel env variables.
- If webhook deliveries fail, check the Stripe Dashboard > Webhooks > Endpoint > Recent Deliveries for detailed logs.
- To test locally with credentials identical to Vercel env, create a local `.env.local` with the same values (do NOT commit it).

8) Quick checklist to hand to your professor before demo
- [ ] Vercel project deployed and healthy
- [ ] `PRESENTATION_PASSWORD` set and confirmed working
- [ ] `STRIPE_SECRET_KEY` (test) and `NEXT_PUBLIC_STRIPE_PRICE_ID` set
- [ ] `STRIPE_WEBHOOK_SECRET` configured from Stripe endpoint
- [ ] Firebase Admin creds set (`FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL`)
- [ ] Demo ad seeded and visible when `NEXT_PUBLIC_ADS_DEMO=true`
- [ ] Contact form works (check `support_messages` in Firestore)

If you want, I can generate a single copy-paste block of variables pre-filled with placeholders for Vercel's UI to speed this up. Tell me the deploy domain when ready and I can also validate the webhook endpoint for you.

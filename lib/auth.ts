import { betterAuth } from "better-auth";

// Better-Auth configuration
// Note: This uses SQLite for local development. For production with Firestore,
// you would configure Better-Auth to use a Firestore adapter or keep using SQLite
// for auth data while application data (events, comments) uses Firestore.
// Better-Auth SQLite database is separate from Firebase Firestore.

export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: "./db.sqlite",
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "development-secret-key-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CityPulse - Découvrez les événements de votre ville",
  description: "Plateforme de découverte, création et participation à des événements locaux pour les jeunes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

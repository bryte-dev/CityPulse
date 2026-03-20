'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-9">
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardContent>
              <CardTitle>Centre d'aide</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Besoin d'aide pour utiliser CityPulse ? Voici quelques ressources rapides :</p>
              <ul className="mt-4 list-disc pl-6 space-y-2 text-sm">
                <li>Créer un compte : page d'inscription</li>
                <li>Créer un événement : page Créer un événement</li>
                <li>Gérer son abonnement : page Profil → section Abonnement</li>
                <li>Signaler un problème : utilisez le formulaire de contact</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">Pour les questions/erreurs techniques (Firebase, Stripe, Cloudinary), fournissez une capture d'écran et une description dans la page d'aide. Nous répondrons au plus vite.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardContent>
              <CardTitle>Conditions d'utilisation (placeholder)</CardTitle>
              <p className="text-sm text-muted-foreground mt-4">Ceci est une page de conditions d'utilisation minimaliste destinée à la présentation. Elle ne remplace pas des conditions légales rédigées par un professionnel. Si tu veux, je peux générer une version plus complète à partir d'un modèle, sans clauses de remboursement spécifiques comme demandé.</p>
              <h3 className="mt-4 font-semibold">Résumé</h3>
              <ul className="list-disc pl-6 text-sm mt-2">
                <li>Utilisation du service à titre informatif et de démonstration.</li>
                <li>Les utilisateurs sont responsables de leurs contenus.</li>
                <li>Les paiements sont gérés par Stripe; les transactions réelles nécessitent une intégration Stripe en production.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

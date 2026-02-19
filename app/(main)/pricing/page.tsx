'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Check, Zap, Heart } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

const FREE_FEATURES = [
  'Découvrir les événements publics',
  'S\'inscrire à des événements gratuits',
  'Laisser des avis et commentaires',
  'Profil public',
];

const PRO_FEATURES = [
  'Tout du plan Gratuit',
  'Créer des événements illimités',
  'Statistiques avancées',
  'Badge organisateur vérifié ✓',
  'Événements sponsorisés (bientôt)',
  'Support prioritaire',
];

function PricingContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Abonnement activé ! Bienvenue dans le plan Pro 🎉');
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Paiement annulé');
    }
  }, [searchParams]);

  const handleSubscribe = async () => {
    if (!session?.user) {
      window.location.href = '/sign-in';
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_test' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Erreur lors de la redirection');
      }
    } catch {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-16 px-4 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tarifs simples 💎</h1>
            <p className="text-lg opacity-90 max-w-xl mx-auto">Commence gratuitement, passe Pro quand tu veux organiser</p>
          </motion.div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-border/50 h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                      <Heart className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-2xl">Gratuit</CardTitle>
                    <CardDescription>Pour participer</CardDescription>
                    <div className="text-3xl font-bold mt-2">0 CHF<span className="text-base font-normal text-muted-foreground">/mois</span></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {FREE_FEATURES.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {session?.user ? (
                      <Button variant="outline" className="w-full" disabled>Plan actuel</Button>
                    ) : (
                      <Link href="/sign-up">
                        <Button variant="outline" className="w-full">Commencer gratuitement</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pro Plan */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-purple-600/50 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">Populaire</span>
                  </div>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Organisateur Pro</CardTitle>
                    <CardDescription>Pour créer et organiser</CardDescription>
                    <div className="text-3xl font-bold mt-2">2 CHF<span className="text-base font-normal text-muted-foreground">/mois</span></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {PRO_FEATURES.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm">
                          <Check className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                      onClick={handleSubscribe}
                      disabled={loading}
                    >
                      {loading ? 'Redirection...' : 'S\'abonner au plan Pro'}
                    </Button>
                    {process.env.NODE_ENV === 'development' && (
                      <p className="text-xs text-center text-muted-foreground">
                        Mode test : carte <code className="font-mono bg-muted px-1 py-0.5 rounded">4242 4242 4242 4242</code>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EventCard } from '@/components/events/EventCard';
import { User, Edit2, Save, X, Calendar, UserCheck } from 'lucide-react';
import { getUserEvents, getUserRegistrations, getEvent, upsertUser, getUser } from '@/lib/db';
import { getAuth, updateProfile } from 'firebase/auth';
import type { Event, User as UserType } from '@/types';

// Remplace l'ancien import par le hook local basé sur Firebase
function useSession() {
  const [session, setSession] = useState<{ user: any } | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setSession({ user: { id: user.uid, name: user.displayName || user.email || '', image: user.photoURL || undefined, email: user.email || undefined } });
      } else {
        setSession(null);
      }
    });
    return () => unsubscribe();
  }, []);
  return { data: session };
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<Event[]>([]);
  const [dbUser, setDbUser] = useState<UserType | null>(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) router.push('/login');
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!session?.user) { setLoading(false); return; }
    const load = async () => {
      const [evs, regs, userData] = await Promise.all([
        getUserEvents(session.user.id),
        getUserRegistrations(session.user.id),
        getUser(session.user.id),
      ]);
      setMyEvents(evs);
      const eventIds = regs.map((r) => r.eventId);
      const participantEvs = await Promise.all(eventIds.map((id) => getEvent(id)));
      setParticipatingEvents(participantEvs.filter(Boolean) as Event[]);
      setBio(userData?.bio || '');
      setName(userData?.name || session.user.name || '');
      setDbUser(userData || null);
      setLoading(false);
    };
    load();
  }, [session?.user?.id]);

  const handleSave = async () => {
    if (!session?.user) return;
    await upsertUser(session.user.id, { bio, name });
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
    } catch (e) {
      console.error('Error updating auth profile', e);
    }
    toast.success('Profil mis à jour !');
    setEditing(false);
  };

  const handleSubscribe = async () => {
    if (!session?.user) { window.location.href = '/sign-in'; return; }
    setSubscribing(true);
    try {
      const idToken = await (await import('firebase/auth')).getAuth().currentUser?.getIdToken();
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_test' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Erreur lors de la redirection vers le paiement');
      }
    } catch (e) {
      console.error('Subscribe error', e);
      toast.error('Une erreur est survenue');
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    if (!session?.user) return;
    if (!confirm('Confirmer l\'annulation de votre abonnement Pro ?')) return;
    setCancelling(true);
    try {
      const idToken = await (await import('firebase/auth')).getAuth().currentUser?.getIdToken();
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
      });
      const data = await res.json();
      if (data.success) {
        const refreshed = await getUser(session.user.id);
        setDbUser(refreshed || null);
        toast.success('Abonnement annulé. Ton compte repasse au plan Gratuit.');
      } else {
        toast.error(data?.error || 'Impossible d\'annuler l\'abonnement');
      }
    } catch (e) {
      console.error('Cancel error', e);
      toast.error('Une erreur est survenue');
    } finally {
      setCancelling(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
            <Link href="/sign-in"><Button>Se connecter</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Profile Card */}
            <Card className="border-border/50 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />
              <CardContent className="pt-0 pb-6">
                <div className="flex items-end gap-4 -mt-10 mb-4">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-background shadow-lg">
                    {(session.user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="pb-2">
                    {editing ? (
                      <Input value={name} onChange={(e) => setName(e.target.value)} className="font-bold text-lg h-8" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">{session.user.name}</h1>
                        {dbUser?.subscriptionStatus === 'pro' && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pro</span>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                  <div className="ml-auto pb-2">
                    {editing ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Sauvegarder</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />Modifier
                      </Button>
                    )}
                  </div>
                </div>
                {editing ? (
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none h-20"
                      placeholder="Parle-nous de toi..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                ) : bio ? (
                  <p className="text-sm text-muted-foreground">{bio}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Aucune bio pour le moment</p>
                )}
                <div className="flex gap-6 mt-4 pt-4 border-t border-border/50">
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{myEvents.length}</div>
                    <div className="text-xs text-muted-foreground">Événements créés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-pink-600">{participatingEvents.length}</div>
                    <div className="text-xs text-muted-foreground">Participations</div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Subscription Overview */}
              <Card className="border-border/50">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Abonnement</h3>
                      <p className="text-sm text-muted-foreground">Statut: {dbUser?.subscriptionStatus === 'pro' ? 'Pro' : 'Gratuit'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {dbUser?.subscriptionStatus === 'pro' ? (
                        <>
                          <Button size="sm" variant="outline" onClick={handleCancel} disabled={cancelling}>{cancelling ? 'Annulation...' : 'Annuler l\'abonnement'}</Button>
                        </>
                      ) : (
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0" onClick={handleSubscribe} disabled={subscribing}>{subscribing ? 'Redirection...' : 'Passer Pro'}</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* My Events */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-bold">Mes événements</h2>
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">{myEvents.length}</span>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({length:2}).map((_,i) => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
                </div>
              ) : myEvents.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <p>Tu n'as pas encore créé d'événement</p>
                    <Link href="/events/create"><Button className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0" size="sm">Créer un événement</Button></Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myEvents.map((event) => <EventCard key={event.id} event={event} />)}
                </div>
              )}
            </div>

            {/* Participating Events */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-5 w-5 text-pink-600" />
                <h2 className="text-xl font-bold">Mes participations</h2>
                <span className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs rounded-full">{participatingEvents.length}</span>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({length:2}).map((_,i) => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
                </div>
              ) : participatingEvents.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <p>Tu ne participes à aucun événement pour le moment</p>
                    <Link href="/"><Button className="mt-4" variant="outline" size="sm">Découvrir les événements</Button></Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participatingEvents.map((event) => <EventCard key={event.id} event={event} />)}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

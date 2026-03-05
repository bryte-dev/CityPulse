'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EventCard } from '@/components/events/EventCard';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getUser, getUserEvents } from '@/lib/db';
import type { Event, User } from '@/types';

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [u, evs] = await Promise.all([getUser(userId), getUserEvents(userId)]);
      setUser(u);
      setEvents(evs.filter((e) => e.visibility === 'public'));
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />Retour
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <Card className="border-border/50 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />
              <CardContent className="pt-0 pb-6">
                <div className="flex items-end gap-4 -mt-10 mb-4">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-background shadow-lg">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="pb-2">
                    <h1 className="text-xl font-bold">{user?.name || 'Utilisateur'}</h1>
                    <p className="text-sm text-muted-foreground capitalize">{user?.role || 'participant'}</p>
                  </div>
                </div>
                {user?.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
                <div className="flex gap-6 mt-4 pt-4 border-t border-border/50">
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{events.length}</div>
                    <div className="text-xs text-muted-foreground">Événements</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {events.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-bold">Événements organisés</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event) => <EventCard key={event.id} event={event} />)}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Plus, Trash2, Edit, Copy, Users, Star, Calendar, BarChart3 } from 'lucide-react';
import { getUserEvents, deleteEvent, createEvent, getEventComments } from '@/lib/db';
import type { Event } from '@/types';
import { formatDate } from '@/lib/utils';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

function useSession() {
  const [session, setSession] = useState<{ user: any } | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setSession(user ? { user } : null);
    });
    return () => unsubscribe();
  }, []);
  return { data: session };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) router.push('/login');
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!session?.user) { setLoading(false); return; }
    const load = async () => {
      const evs = await getUserEvents(session.user.id);
      setEvents(evs);
      const counts: Record<string, number> = {};
      const avgs: Record<string, number> = {};
      await Promise.all(evs.map(async (e) => {
        const comms = await getEventComments(e.id);
        counts[e.id] = comms.length;
        const rated = comms.filter((c) => c.rating);
        avgs[e.id] = rated.length > 0 ? rated.reduce((a, c) => a + (c.rating || 0), 0) / rated.length : 0;
      }));
      setCommentCounts(counts);
      setRatings(avgs);
      setLoading(false);
    };
    load();
  }, [session?.user?.id]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet événement ?')) return;
    await deleteEvent(id);
    setEvents((e) => e.filter((x) => x.id !== id));
    toast.success('Événement supprimé');
  };

  const handleDuplicate = async (event: Event) => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = event;
    const newId = await createEvent({
      ...rest,
      title: `${event.title} (copie)`,
      participantCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (newId) {
      toast.success('Événement dupliqué !');
      router.push(`/events/${newId}`);
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

  const totalParticipants = events.reduce((a, e) => a + e.participantCount, 0);
  const avgRating = events.length > 0 && Object.values(ratings).some((r) => r > 0)
    ? Object.values(ratings).filter((r) => r > 0).reduce((a, r) => a + r, 0) / Object.values(ratings).filter((r) => r > 0).length
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Dashboard 📊
                </h1>
                <p className="text-muted-foreground mt-1">Gère tes événements</p>
              </div>
              <Link href="/events/create">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  <Plus className="h-4 w-4 mr-2" />Créer
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Événements', value: events.length, icon: Calendar, color: 'from-purple-500 to-purple-600' },
                { label: 'Participants', value: totalParticipants, icon: Users, color: 'from-pink-500 to-pink-600' },
                { label: 'Note moy.', value: avgRating > 0 ? avgRating.toFixed(1) : '–', icon: Star, color: 'from-orange-500 to-orange-600' },
                { label: 'Commentaires', value: Object.values(commentCounts).reduce((a, c) => a + c, 0), icon: BarChart3, color: 'from-blue-500 to-blue-600' },
              ].map((stat) => (
                <Card key={stat.label} className="border-border/50">
                  <CardContent className="pt-4 pb-4">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Events Table */}
            <Card className="border-border/50">
              <CardHeader><CardTitle>Mes événements</CardTitle></CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({length:3}).map((_,i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>Tu n'as pas encore créé d'événement</p>
                    <Link href="/events/create">
                      <Button className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0" size="sm">
                        <Plus className="h-4 w-4 mr-2" />Créer mon premier événement
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <Link href={`/events/${event.id}`} className="font-medium text-sm hover:text-primary line-clamp-1">{event.title}</Link>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(event.date)}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.participantCount} inscrits</span>
                            {commentCounts[event.id] > 0 && <span>{commentCounts[event.id]} avis</span>}
                            {ratings[event.id] > 0 && (
                              <span className="flex items-center gap-1 text-yellow-500"><Star className="h-3 w-3 fill-yellow-500" />{ratings[event.id].toFixed(1)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={`/events/${event.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(event)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(event.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

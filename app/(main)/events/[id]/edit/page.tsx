'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ImageIcon, Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { getEvent, updateEvent } from '@/lib/db';
import type { Event as EventType, EventCategory } from '@/types';

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

const schema = z.object({
  title: z.string().min(3, 'Titre trop court'),
  description: z.string().min(10, 'Description trop courte'),
  date: z.string().min(1, 'Date requise'),
  startTime: z.string().min(1, 'Heure de début requise'),
  endTime: z.string().optional(),
  location: z.string().min(3, 'Lieu requis'),
  category: z.enum(['music','sport','culture','gaming','food','party','outdoor','networking','education','other']),
  maxParticipants: z.string().optional(),
  visibility: z.enum(['public','private']),
  isFree: z.boolean(),
  price: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function formatDateInput(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id;
  const { data: session } = useSession();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { visibility: 'public', isFree: true, category: 'other' },
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const ev = await getEvent(id);
      if (!ev) {
        toast.error('Événement introuvable');
        router.push('/');
        return;
      }
      setEvent(ev);
      // populate form
      setValue('title', ev.title);
      setValue('description', ev.description);
      setValue('date', formatDateInput(ev.date));
      setValue('startTime', ev.startTime || '');
      setValue('endTime', ev.endTime || '');
      setValue('location', ev.location);
      setValue('category', ev.category);
      setValue('maxParticipants', ev.maxParticipants ? String(ev.maxParticipants) : '');
      setValue('visibility', ev.visibility);
      setValue('isFree', ev.isFree);
      setValue('price', ev.price ? String(ev.price) : '');
      setImageUrl(ev.imageUrl || '');
      setLoading(false);
    };
    load();
  }, [id, setValue, router]);

  if (!session?.user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
            <p className="text-muted-foreground mb-6">Tu dois être connecté pour modifier un événement</p>
            <Link href="/sign-in"><Button>Se connecter</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    if (!id || !event) return;
    setSubmitting(true);
    try {
      const eventDate = new Date(`${data.date}T${data.startTime}`);
      const success = await updateEvent(id, {
        title: data.title,
        description: data.description,
        date: eventDate,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        category: data.category as EventCategory,
        maxParticipants: data.maxParticipants ? Number(data.maxParticipants) : undefined,
        visibility: data.visibility,
        isFree: data.isFree,
        price: data.isFree ? undefined : (data.price ? Number(data.price) : undefined),
        imageUrl: imageUrl || undefined,
        updatedAt: new Date(),
      });
      if (success) {
        toast.success('Événement mis à jour !');
        router.push(`/events/${id}`);
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (e) {
      toast.error('Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Modifier l'événement
            </h1>
            {loading ? (
              <div className="py-12 text-center">Chargement...</div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Image de couverture</CardTitle></CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                      ) : (
                        <div className="text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Aucune image</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Titre *</Label>
                      <Input id="title" className="mt-1" {...register('title')} />
                      {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <textarea id="description" className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none h-24" {...register('description')} />
                      {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="category">Catégorie *</Label>
                      <select id="category" className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm" {...register('category')}>
                        <option value="music">Musique</option>
                        <option value="sport">Sport</option>
                        <option value="culture">Culture</option>
                        <option value="gaming">Gaming</option>
                        <option value="food">Food</option>
                        <option value="party">Soirée</option>
                        <option value="outdoor">Extérieur</option>
                        <option value="networking">Networking</option>
                        <option value="education">Éducation</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2">
                  <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0" disabled={submitting}>
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                  <Link href={`/events/${id}`}><Button variant="ghost">Annuler</Button></Link>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

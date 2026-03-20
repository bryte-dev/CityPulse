'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { createEvent, getUser, getUserEventsCountSince } from '@/lib/db';
import type { EventCategory } from '@/types';

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

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { visibility: 'public', isFree: true, category: 'other' },
  });

  const isFree = watch('isFree');

  if (!session?.user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
            <p className="text-muted-foreground mb-6">Tu dois être connecté pour créer un événement</p>
            <Link href="/sign-in"><Button>Se connecter</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        toast.error('Configuration Cloudinary manquante');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      // Upload preset must be created in Cloudinary as an unsigned preset
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (!uploadPreset) {
        toast.error('Configuration Cloudinary: upload preset manquant');
        setUploading(false);
        return;
      }
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'citypulse/events');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        toast.success('Image uploadée !');
      } else {
        toast.error('Erreur upload image');
      }
    } catch {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      // enforce organizer limits for non-Pro users: 2 events per month
      const NON_PRO_MONTHLY_LIMIT = 2;
      try {
        const userDoc = await getUser(session.user.id);
        if (userDoc?.subscriptionStatus !== 'pro') {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const createdCount = await getUserEventsCountSince(session.user.id, startOfMonth);
          if (createdCount >= NON_PRO_MONTHLY_LIMIT) {
            toast.error(`Limite atteinte : seuls les organisateurs Pro peuvent créer plus de ${NON_PRO_MONTHLY_LIMIT} événements par mois.`);
            setSubmitting(false);
            return;
          }
        }
      } catch (e) {
        console.error('Error checking organizer monthly limits', e);
      }
      const eventDate = new Date(`${data.date}T${data.startTime}`);
      const eventId = await createEvent({
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
        organizerId: session.user.id,
        organizerName: session.user.name,
        organizerAvatar: session.user.image || undefined,
        participantCount: 0,
        sponsored: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      if (eventId) {
        toast.success('Événement créé ! 🎉');
        router.push(`/events/${eventId}`);
      } else {
        toast.error('Erreur lors de la création');
      }
    } catch {
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
              Créer un événement ✨
            </h1>
            <p className="text-muted-foreground mb-8">Partage quelque chose d'incroyable avec ta communauté</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Image Upload */}
              <Card>
                <CardHeader><CardTitle className="text-base">Image de couverture</CardTitle></CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                    ) : (
                      <div className="text-muted-foreground">
                        {uploading ? (
                          <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2" />
                        ) : (
                          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        )}
                        <p className="text-sm">{uploading ? 'Upload en cours...' : 'Clique pour ajouter une image'}</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {imageUrl && (
                    <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setImageUrl('')}>
                      Supprimer l'image
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card>
                <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input id="title" placeholder="Un titre accrocheur..." className="mt-1" {...register('title')} />
                    {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      placeholder="Décris ton événement..."
                      className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-ring"
                      {...register('description')}
                    />
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

              {/* Date & Location */}
              <Card>
                <CardHeader><CardTitle className="text-base">Date & Lieu</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input id="date" type="date" className="mt-1" {...register('date')} />
                      {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="startTime">Heure de début *</Label>
                      <Input id="startTime" type="time" className="mt-1" {...register('startTime')} />
                      {errors.startTime && <p className="text-xs text-destructive mt-1">{errors.startTime.message}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="endTime">Heure de fin</Label>
                    <Input id="endTime" type="time" className="mt-1" {...register('endTime')} />
                  </div>
                  <div>
                    <Label htmlFor="location">Lieu (adresse) *</Label>
                    <Input id="location" placeholder="Ex: Rue du Lac 5, Lausanne" className="mt-1" {...register('location')} />
                    {errors.location && <p className="text-xs text-destructive mt-1">{errors.location.message}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader><CardTitle className="text-base">Paramètres</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxParticipants">Max participants</Label>
                      <Input id="maxParticipants" type="number" min="1" placeholder="Illimité" className="mt-1" {...register('maxParticipants')} />
                    </div>
                    <div>
                      <Label htmlFor="visibility">Visibilité</Label>
                      <select id="visibility" className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm" {...register('visibility')}>
                        <option value="public">Public</option>
                        <option value="private">Privé</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Prix</Label>
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${isFree ? 'bg-green-500 text-white border-green-500' : 'bg-background border-input hover:bg-accent'}`}
                        onClick={() => setValue('isFree', true)}
                      >
                        Gratuit
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${!isFree ? 'bg-purple-600 text-white border-purple-600' : 'bg-background border-input hover:bg-accent'}`}
                        onClick={() => setValue('isFree', false)}
                      >
                        Payant
                      </button>
                    </div>
                  </div>
                  {!isFree && (
                    <div>
                      <Label htmlFor="price">Montant (CHF)</Label>
                      <Input id="price" type="number" min="0" step="0.5" placeholder="0.00" className="mt-1" {...register('price')} />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                disabled={submitting || uploading}
              >
                {submitting ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Création...</> : 'Créer l\'événement 🚀'}
              </Button>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

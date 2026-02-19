'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Tag,
  Share2,
  Heart,
  Edit,
  Trash2,
} from 'lucide-react';
import type { Event } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    // TODO: Fetch event from Firebase
    // Mock data for now
    const mockEvent: Event = {
      id: params.id as string,
      title: 'Festival de Musique Électronique',
      description:
        'Une soirée inoubliable avec les meilleurs DJs de Suisse romande. Venez danser sur les meilleurs morceaux électro du moment dans une ambiance festive et conviviale. Bar sur place et food trucks disponibles.',
      date: new Date('2026-03-15T20:00:00'),
      endDate: new Date('2026-03-16T04:00:00'),
      location: {
        address: 'Rue du Lac 15',
        city: 'Lausanne',
      },
      organizerId: 'org1',
      organizerName: 'EventPro',
      organizerAvatar: undefined,
      category: 'music',
      tags: ['électro', 'danse', 'nuit', 'DJ'],
      maxParticipants: 200,
      currentParticipants: 87,
      visibility: 'public',
      isFree: false,
      price: 25,
      status: 'published',
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setEvent(mockEvent);
    setLoading(false);
  }, [params.id]);

  const handleParticipate = () => {
    // TODO: Implement participation logic
    setIsParticipant(!isParticipant);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Événement introuvable</h1>
            <Button onClick={() => router.push('/')}>
              Retour à l'accueil
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const gradients = [
    'gradient-purple',
    'gradient-pink',
    'gradient-orange',
    'gradient-blue',
    'gradient-green',
  ];
  const gradientClass = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Image */}
        <div className={`h-64 md:h-96 ${event.imageUrl ? '' : gradientClass} relative`}>
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-primary uppercase mb-2">
                      {event.category}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {event.title}
                    </h1>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Organizer */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-lg font-semibold">
                    {event.organizerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Organisé par</p>
                    <p className="font-semibold">{event.organizerName}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>À propos de l'événement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {event.description}
                  </p>
                </CardContent>
              </Card>

              {/* Tags */}
              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participation Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Price */}
                    <div className="text-center pb-4 border-b">
                      {event.isFree ? (
                        <div className="text-3xl font-bold text-green-600">
                          Gratuit
                        </div>
                      ) : (
                        <div className="text-3xl font-bold">{event.price} CHF</div>
                      )}
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-5 w-5" />
                      <span>
                        {event.currentParticipants}
                        {event.maxParticipants
                          ? ` / ${event.maxParticipants}`
                          : ''}{' '}
                        participants
                      </span>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleParticipate}
                      variant={isParticipant ? 'outline' : 'default'}
                    >
                      {isParticipant ? 'Se désinscrire' : 'Participer'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Event Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{formatDate(event.date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(event.date)}
                        {event.endDate && ` - ${formatTime(event.endDate)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{event.location.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.location.city}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

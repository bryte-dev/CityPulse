'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Edit, Camera } from 'lucide-react';
import type { User, Event } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data
  const [user, setUser] = useState<User>({
    id: '1',
    email: 'user@example.com',
    name: 'Jean Dupont',
    bio: 'Passionné d\'événements et de rencontres. J\'aime découvrir de nouvelles activités et partager mes expériences.',
    role: 'organizer',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date(),
  });

  // Mock upcoming events
  const upcomingEvents: Event[] = [
    {
      id: '1',
      title: 'Festival de Musique Électronique',
      description: 'Une soirée inoubliable',
      date: new Date('2026-03-15T20:00:00'),
      location: { address: 'Rue du Lac 15', city: 'Lausanne' },
      organizerId: 'org1',
      organizerName: 'EventPro',
      category: 'music',
      tags: [],
      currentParticipants: 87,
      maxParticipants: 200,
      visibility: 'public',
      isFree: false,
      price: 25,
      status: 'published',
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const handleSave = () => {
    // TODO: Save user data to Firebase
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                      <Camera className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nom</Label>
                        <Input
                          id="name"
                          value={user.name}
                          onChange={(e) =>
                            setUser({ ...user, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          rows={3}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={user.bio}
                          onChange={(e) =>
                            setUser({ ...user, bio: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                      <p className="text-muted-foreground mb-4">{user.bio}</p>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            user.role === 'organizer'
                              ? 'bg-purple-500/10 text-purple-600'
                              : 'bg-blue-500/10 text-blue-600'
                          }`}
                        >
                          {user.role === 'organizer'
                            ? 'Organisateur'
                            : 'Participant'}
                        </span>
                        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                          Membre depuis {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Edit Button */}
                <div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button onClick={handleSave}>Enregistrer</Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Événements à venir</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun événement à venir
                  </p>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <h3 className="font-semibold mb-2">{event.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(event.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location.city}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline">Voir détails</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Events */}
            <Card>
              <CardHeader>
                <CardTitle>Événements passés</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Aucun événement passé
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

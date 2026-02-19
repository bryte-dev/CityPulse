'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  Users,
  Star,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import type { Event, DashboardStats } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  // Mock data
  const stats: DashboardStats = {
    totalEvents: 12,
    activeEvents: 5,
    totalParticipants: 347,
    averageRating: 4.5,
    upcomingEvents: 3,
    completedEvents: 7,
  };

  const myEvents: Event[] = [
    {
      id: '1',
      title: 'Festival de Musique Électronique',
      description: 'Une soirée inoubliable',
      date: new Date('2026-03-15T20:00:00'),
      location: { address: 'Rue du Lac 15', city: 'Lausanne' },
      organizerId: 'me',
      organizerName: 'Moi',
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
    {
      id: '2',
      title: 'Brunch Networking',
      description: 'Rencontrez des entrepreneurs',
      date: new Date('2026-03-18T10:00:00'),
      location: { address: 'Café du Commerce', city: 'Genève' },
      organizerId: 'me',
      organizerName: 'Moi',
      category: 'networking',
      tags: [],
      currentParticipants: 28,
      maxParticipants: 40,
      visibility: 'public',
      isFree: false,
      price: 20,
      status: 'published',
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Gérez vos événements et suivez vos statistiques
              </p>
            </div>
            <Link href="/events/create">
              <Button size="lg" className="mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total événements
                    </p>
                    <p className="text-3xl font-bold">{stats.totalEvents}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Événements actifs
                    </p>
                    <p className="text-3xl font-bold">{stats.activeEvents}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total participants
                    </p>
                    <p className="text-3xl font-bold">{stats.totalParticipants}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Note moyenne
                    </p>
                    <p className="text-3xl font-bold">{stats.averageRating}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Table */}
          <Card>
            <CardHeader>
              <CardTitle>Mes événements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            event.status === 'published'
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-gray-500/10 text-gray-600'
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.currentParticipants}
                          {event.maxParticipants
                            ? ` / ${event.maxParticipants}`
                            : ''}{' '}
                          participants
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                      </Link>
                      <Link href={`/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

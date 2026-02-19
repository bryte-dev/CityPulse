'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EventList } from '@/components/events/EventList';
import { EventFiltersComponent } from '@/components/events/EventFilters';
import type { Event, EventFilters } from '@/types';

// Mock data for demonstration
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de Musique Électronique',
    description: 'Une soirée inoubliable avec les meilleurs DJs de Suisse romande. Ambiance garantie jusqu\'au bout de la nuit!',
    date: new Date('2026-03-15T20:00:00'),
    location: {
      address: 'Rue du Lac 15',
      city: 'Lausanne',
    },
    organizerId: 'org1',
    organizerName: 'EventPro',
    category: 'music',
    tags: ['électro', 'danse', 'nuit'],
    maxParticipants: 200,
    currentParticipants: 87,
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
    title: 'Match de Football Amateur',
    description: 'Rejoignez-nous pour un match amical de football. Tous niveaux acceptés!',
    date: new Date('2026-03-10T14:00:00'),
    location: {
      address: 'Stade Municipal',
      city: 'Genève',
    },
    organizerId: 'org2',
    organizerName: 'SportClub',
    category: 'sport',
    tags: ['football', 'sport', 'amateur'],
    maxParticipants: 22,
    currentParticipants: 16,
    visibility: 'public',
    isFree: true,
    status: 'published',
    participants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Exposition d\'Art Contemporain',
    description: 'Découvrez les œuvres de jeunes artistes locaux dans une ambiance conviviale.',
    date: new Date('2026-03-20T18:00:00'),
    location: {
      address: 'Galerie du Centre 8',
      city: 'Fribourg',
    },
    organizerId: 'org3',
    organizerName: 'ArtSpace',
    category: 'art',
    tags: ['art', 'exposition', 'culture'],
    currentParticipants: 45,
    visibility: 'public',
    isFree: true,
    status: 'published',
    participants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Soirée Pizza & Gaming',
    description: 'Une soirée décontractée pour jouer à vos jeux préférés tout en dégustant de délicieuses pizzas.',
    date: new Date('2026-03-12T19:00:00'),
    location: {
      address: 'Gaming Lounge',
      city: 'Neuchâtel',
    },
    organizerId: 'org4',
    organizerName: 'GamersHub',
    category: 'gaming',
    tags: ['gaming', 'pizza', 'social'],
    maxParticipants: 30,
    currentParticipants: 12,
    visibility: 'public',
    isFree: false,
    price: 15,
    status: 'published',
    participants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Randonnée en Montagne',
    description: 'Venez profiter d\'une magnifique randonnée dans les Alpes avec un guide expérimenté.',
    date: new Date('2026-03-25T08:00:00'),
    location: {
      address: 'Point de rencontre: Gare',
      city: 'Montreux',
    },
    organizerId: 'org5',
    organizerName: 'MountainAdventures',
    category: 'outdoor',
    tags: ['randonnée', 'nature', 'montagne'],
    maxParticipants: 15,
    currentParticipants: 9,
    visibility: 'public',
    isFree: false,
    price: 30,
    status: 'published',
    participants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: 'Brunch Networking Entrepreneurs',
    description: 'Rencontrez d\'autres entrepreneurs et échangez vos idées autour d\'un délicieux brunch.',
    date: new Date('2026-03-18T10:00:00'),
    location: {
      address: 'Café du Commerce 22',
      city: 'Lausanne',
    },
    organizerId: 'org6',
    organizerName: 'StartupCommunity',
    category: 'networking',
    tags: ['networking', 'business', 'brunch'],
    maxParticipants: 40,
    currentParticipants: 28,
    visibility: 'public',
    isFree: false,
    price: 20,
    status: 'published',
    participants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function HomePage() {
  const [filters, setFilters] = useState<EventFilters>({
    viewMode: 'grid',
    sortBy: 'date',
  });

  // Filter events based on current filters
  const filteredEvents = mockEvents.filter((event) => {
    if (filters.search && !event.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category && event.category !== filters.category) {
      return false;
    }
    if (filters.isFree && !event.isFree) {
      return false;
    }
    return true;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (filters.sortBy === 'date') {
      return a.date.getTime() - b.date.getTime();
    }
    if (filters.sortBy === 'popularity') {
      return b.currentParticipants - a.currentParticipants;
    }
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 px-4 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
          <div className="container mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              On fait quoi ce soir ?
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Découvrez les meilleurs événements de votre ville
            </p>
          </div>
        </section>

        {/* Filters & Events */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <EventFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
            />
            
            <div className="mt-8">
              <EventList
                events={sortedEvents}
                viewMode={filters.viewMode}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

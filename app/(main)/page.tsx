'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EventList } from '@/components/events/EventList';
import { EventFiltersComponent } from '@/components/events/EventFilters';
import { AdBanner } from '@/components/ads/AdBanner';
import { subscribeToEvents } from '@/lib/db';
import type { Event, EventFilters } from '@/types';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';

export default function HomePage() {
  const [filters, setFilters] = useState<EventFilters>({ viewMode: 'grid', sortBy: 'date' });
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = events
    .filter((e) => e.visibility === 'public')
    .filter((e) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!e.title.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q)) return false;
      }
      if (filters.category) return e.category === filters.category;
      if (filters.isFree) return e.isFree;
      if (filters.date === 'today') return isToday(e.date);
      if (filters.date === 'week') return isThisWeek(e.date);
      if (filters.date === 'month') return isThisMonth(e.date);
      return true;
    })
    .sort((a, b) => {
      if (a.sponsored && !b.sponsored) return -1;
      if (!a.sponsored && b.sponsored) return 1;
      if (filters.sortBy === 'popularity') return b.participantCount - a.participantCount;
      return a.date.getTime() - b.date.getTime();
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-14 px-4 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)' }} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto text-center text-white relative z-10"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              On fait quoi ce soir ? 🎉
            </h1>
            <p className="text-lg md:text-xl mb-6 opacity-90 max-w-xl mx-auto">
              Découvrez, créez et participez aux meilleurs événements de votre ville
            </p>
          </motion.div>
        </section>

        {/* Content */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="flex gap-8">
              {/* Left sidebar ad - desktop */}
              <div className="hidden xl:flex flex-col items-center pt-4 gap-4 flex-shrink-0">
                <AdBanner format="skyscraper" />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <EventFiltersComponent filters={filters} onFiltersChange={setFilters} />
                <div className="mt-6">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <EventList events={filtered} viewMode={filters.viewMode} />
                  )}
                </div>
              </div>

              {/* Right sidebar ad - desktop */}
              <div className="hidden xl:flex flex-col items-center pt-4 gap-4 flex-shrink-0">
                <AdBanner format="rectangle" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { EventCard } from './EventCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { CalendarX } from 'lucide-react';
import type { Event } from '@/types';

interface EventListProps {
  events: Event[];
  viewMode?: 'grid' | 'list';
}

export function EventList({ events, viewMode = 'grid' }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarX className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun événement pour le moment</h3>
        <p className="text-muted-foreground">Crée le premier événement et lance la fête !</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  }

  // Grid mode with ads injected every 4 cards on mobile
  const items: React.ReactNode[] = [];
  events.forEach((event, i) => {
    items.push(<EventCard key={event.id} event={event} />);
    if ((i + 1) % 4 === 0 && i < events.length - 1) {
      items.push(
        <div key={`ad-${i}`} className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-2">
          <AdBanner format="banner" />
        </div>
      );
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items}
    </div>
  );
}

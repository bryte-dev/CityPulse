'use client';

import { EventCard } from './EventCard';
import type { Event } from '@/types';

interface EventListProps {
  events: Event[];
  viewMode?: 'grid' | 'list';
}

export function EventList({ events, viewMode = 'grid' }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun événement trouvé</p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }
    >
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

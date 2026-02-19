'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Heart } from 'lucide-react';
import type { Event } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

const gradients = [
  'gradient-purple',
  'gradient-pink',
  'gradient-orange',
  'gradient-blue',
  'gradient-green',
];

// Deterministic gradient selection based on event ID
const getGradientClass = (eventId: string): string => {
  const hash = eventId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return gradients[Math.abs(hash) % gradients.length];
};

export function EventCard({ event }: EventCardProps) {
  const gradientClass = getGradientClass(event.id);
  
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
        {/* Image/Gradient Header */}
        <div className={`h-48 ${event.imageUrl ? '' : gradientClass} relative`}>
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : null}
          
          {/* Badge */}
          <div className="absolute top-3 right-3">
            {event.isFree ? (
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                Gratuit
              </span>
            ) : (
              <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                {event.price} CHF
              </span>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          <div className="text-xs font-semibold text-primary mb-2 uppercase">
            {event.category}
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {event.description}
          </p>

          {/* Info */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(event.date)} à {formatTime(event.date)}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="line-clamp-1">{event.location.city}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {event.currentParticipants}
                {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participants
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-semibold mr-2">
              {event.organizerName.charAt(0).toUpperCase()}
            </div>
            <span className="line-clamp-1">{event.organizerName}</span>
          </div>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

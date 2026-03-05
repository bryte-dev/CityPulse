'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import type { Event } from '@/types';
import { formatDate } from '@/lib/utils';

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

const getGradientClass = (eventId: string): string => {
  const hash = eventId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return gradients[Math.abs(hash) % gradients.length];
};

const categoryLabels: Record<string, string> = {
  music: 'Musique',
  sport: 'Sport',
  culture: 'Culture',
  gaming: 'Gaming',
  food: 'Food',
  party: 'Soirée',
  outdoor: 'Extérieur',
  networking: 'Networking',
  education: 'Éducation',
  other: 'Autre',
};

export function EventCard({ event }: EventCardProps) {
  const gradientClass = getGradientClass(event.id);
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Link href={`/events/${event.id}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full border-border/50">
          <div className={`h-44 ${event.imageUrl ? '' : gradientClass} relative overflow-hidden`}>
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            ) : null}
            <div className="absolute top-3 left-3 flex gap-2">
              {event.sponsored && (
                <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" />Sponsorisé
                </span>
              )}
            </div>
            <div className="absolute top-3 right-3">
              {event.isFree ? (
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">Gratuit</span>
              ) : (
                <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">{event.price} CHF</span>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
              {categoryLabels[event.category] || event.category}
            </div>
            <h3 className="font-bold text-base mb-2 line-clamp-2">{event.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
            <div className="space-y-1.5">
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span>{event.participantCount}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participants</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-semibold mr-2">
                {event.organizerName.charAt(0).toUpperCase()}
              </div>
              <span className="line-clamp-1 text-xs">{event.organizerName}</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

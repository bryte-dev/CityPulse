'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Grid, List } from 'lucide-react';
import type { EventFilters } from '@/types';

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
}

export function EventFiltersComponent({ filters, onFiltersChange }: EventFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher un événement..."
          className="pl-10"
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant={filters.isFree ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, isFree: filters.isFree ? undefined : true })}
        >
          Gratuit
        </Button>
        <select
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          value={filters.category || ''}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value as EventFilters['category'] })}
        >
          <option value="">Toutes catégories</option>
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
        <select
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          value={filters.date || ''}
          onChange={(e) => onFiltersChange({ ...filters, date: e.target.value as EventFilters['date'] })}
        >
          <option value="">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
        <select
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          value={filters.sortBy || 'date'}
          onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as EventFilters['sortBy'] })}
        >
          <option value="date">Par date</option>
          <option value="popularity">Par popularité</option>
        </select>
        <div className="ml-auto flex gap-2">
          <Button variant={filters.viewMode !== 'list' ? 'default' : 'outline'} size="icon" onClick={() => onFiltersChange({ ...filters, viewMode: 'grid' })}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={filters.viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => onFiltersChange({ ...filters, viewMode: 'list' })}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

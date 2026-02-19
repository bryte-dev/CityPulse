// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'participant' | 'organizer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  category: EventCategory;
  tags: string[];
  imageUrl?: string;
  maxParticipants?: number;
  currentParticipants: number;
  visibility: 'public' | 'private';
  price?: number;
  isFree: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  participants: string[];
  invitedUsers?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventCategory = 
  | 'music'
  | 'sport'
  | 'art'
  | 'food'
  | 'networking'
  | 'party'
  | 'outdoor'
  | 'gaming'
  | 'education'
  | 'other';

// Comment Types
export interface Comment {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'event_update' | 'event_cancelled' | 'new_participant' | 'event_reminder';
  eventId: string;
  eventTitle: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// Filter Types
export interface EventFilters {
  search?: string;
  category?: EventCategory;
  date?: Date;
  location?: string;
  isFree?: boolean;
  sortBy?: 'date' | 'popularity' | 'proximity';
  viewMode?: 'grid' | 'list';
}

// Dashboard Stats
export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalParticipants: number;
  averageRating: number;
  upcomingEvents: number;
  completedEvents: number;
}

// Form Types
export interface CreateEventFormData {
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  address: string;
  city: string;
  category: EventCategory;
  tags: string[];
  maxParticipants?: number;
  visibility: 'public' | 'private';
  price?: number;
  isFree: boolean;
  invitedUsers?: string[];
  image?: File;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  role: 'participant' | 'organizer';
}

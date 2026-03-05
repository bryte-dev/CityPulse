// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'participant' | 'organizer' | 'admin';
  stripeCustomerId?: string;
  subscriptionStatus?: 'free' | 'pro';
  createdAt: Date;
  updatedAt: Date;
}

// Event Types
export type EventCategory =
  | 'music'
  | 'sport'
  | 'culture'
  | 'gaming'
  | 'food'
  | 'party'
  | 'outdoor'
  | 'networking'
  | 'education'
  | 'other';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  category: EventCategory;
  imageUrl?: string;
  maxParticipants?: number;
  participantCount: number;
  visibility: 'public' | 'private';
  price?: number;
  isFree: boolean;
  sponsored?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Comment Types
export interface Comment {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  rating?: number;
  parentCommentId?: string | null;
  createdAt: Date;
}

// Registration Types
export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  registeredAt: Date;
}

// Filter Types
export interface EventFilters {
  search?: string;
  category?: EventCategory | '';
  date?: 'today' | 'week' | 'month' | '';
  isFree?: boolean;
  sortBy?: 'date' | 'popularity';
  viewMode?: 'grid' | 'list';
}

// Dashboard Stats
export interface DashboardStats {
  totalEvents: number;
  totalParticipants: number;
  averageRating: number;
}

// Form Types
export interface CreateEventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  maxParticipants?: number;
  visibility: 'public' | 'private';
  price?: number;
  isFree: boolean;
  imageUrl?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}

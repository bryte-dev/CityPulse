import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  type QueryConstraint,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Event, Comment, Registration, User } from '@/types';

export const timestampToDate = (timestamp: unknown): Date => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  return new Date(timestamp as string | number);
};

// Events
export const getEvents = async (filters?: QueryConstraint[]): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, 'events');
    const q = filters ? query(eventsRef, ...filters) : query(eventsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      date: timestampToDate(d.data().date),
      createdAt: timestampToDate(d.data().createdAt),
      updatedAt: timestampToDate(d.data().updatedAt),
    })) as Event[];
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
};

export const getEvent = async (id: string): Promise<Event | null> => {
  try {
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        date: timestampToDate(docSnap.data().date),
        createdAt: timestampToDate(docSnap.data().createdAt),
        updatedAt: timestampToDate(docSnap.data().updatedAt),
      } as Event;
    }
    return null;
  } catch (error) {
    console.error('Error getting event:', error);
    return null;
  }
};

export const createEvent = async (eventData: Omit<Event, 'id'>): Promise<string | null> => {
  try {
    // Build payload and remove undefined fields (Firestore rejects undefined)
    const payload: any = { ...eventData };
    payload.participantCount = eventData.participantCount ?? 0;
    payload.date = Timestamp.fromDate(eventData.date);
    payload.createdAt = Timestamp.now();
    payload.updatedAt = Timestamp.now();
    // remove keys with undefined values
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });
    const docRef = await addDoc(collection(db, 'events'), payload);
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
};

export const updateEvent = async (id: string, eventData: Partial<Event>): Promise<boolean> => {
  try {
    const docRef = doc(db, 'events', id);
    const payload: any = { ...eventData };
    if (payload.date && payload.date instanceof Date) payload.date = Timestamp.fromDate(payload.date as Date);
    payload.updatedAt = Timestamp.now();
    // remove undefined fields
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });
    await updateDoc(docRef, payload);
    return true;
  } catch (error) {
    console.error('Error updating event:', error);
    return false;
  }
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'events', id));
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};

export const subscribeToEvents = (callback: (events: Event[]) => void): Unsubscribe => {
  const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      date: timestampToDate(d.data().date),
      createdAt: timestampToDate(d.data().createdAt),
      updatedAt: timestampToDate(d.data().updatedAt),
    })) as Event[];
    callback(events);
  });
};

// Registrations
export const getRegistration = async (eventId: string, userId: string): Promise<Registration | null> => {
  try {
    const q = query(
      collection(db, 'registrations'),
      where('eventId', '==', eventId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const d = snapshot.docs[0];
      return { id: d.id, ...d.data(), registeredAt: timestampToDate(d.data().registeredAt) } as Registration;
    }
    return null;
  } catch (error) {
    console.error('Error getting registration:', error);
    return null;
  }
};

export const getEventRegistrations = async (eventId: string): Promise<Registration[]> => {
  try {
    const q = query(collection(db, 'registrations'), where('eventId', '==', eventId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      registeredAt: timestampToDate(d.data().registeredAt),
    })) as Registration[];
  } catch (error) {
    console.error('Error getting registrations:', error);
    return [];
  }
};

export const createRegistration = async (data: Omit<Registration, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'registrations'), {
      ...data,
      registeredAt: Timestamp.now(),
    });
    await updateDoc(doc(db, 'events', data.eventId), { participantCount: increment(1) });
    return docRef.id;
  } catch (error) {
    console.error('Error creating registration:', error);
    return null;
  }
};

export const deleteRegistration = async (registrationId: string, eventId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'registrations', registrationId));
    await updateDoc(doc(db, 'events', eventId), { participantCount: increment(-1) });
    return true;
  } catch (error) {
    console.error('Error deleting registration:', error);
    return false;
  }
};

export const getUserRegistrations = async (userId: string): Promise<Registration[]> => {
  try {
    const q = query(collection(db, 'registrations'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      registeredAt: timestampToDate(d.data().registeredAt),
    })) as Registration[];
  } catch (error) {
    console.error('Error getting user registrations:', error);
    return [];
  }
};

// Comments
export const getEventComments = async (eventId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, 'comments'),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: timestampToDate(d.data().createdAt),
    })) as Comment[];
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

export const createComment = async (commentData: Omit<Comment, 'id'>): Promise<string | null> => {
  try {
    // Remove undefined fields (Firestore rejects undefined values)
    const payload: any = { ...commentData };
    if (payload.rating === undefined) delete payload.rating;
    if (payload.parentCommentId === undefined) delete payload.parentCommentId;
    const docRef = await addDoc(collection(db, 'comments'), {
      ...payload,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    return null;
  }
};

export const deleteComment = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'comments', id));
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

// Users
export const getUser = async (id: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: timestampToDate(docSnap.data().createdAt),
        updatedAt: timestampToDate(docSnap.data().updatedAt),
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const upsertUser = async (id: string, data: Partial<User>): Promise<boolean> => {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
    } else {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(docRef, { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    }
    return true;
  } catch (error) {
    console.error('Error upserting user:', error);
    return false;
  }
};

export const getUserEvents = async (userId: string): Promise<Event[]> => {
  try {
    const q = query(collection(db, 'events'), where('organizerId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      date: timestampToDate(d.data().date),
      createdAt: timestampToDate(d.data().createdAt),
      updatedAt: timestampToDate(d.data().updatedAt),
    })) as Event[];
  } catch (error) {
    console.error('Error getting user events:', error);
    return [];
  }
};

// Count events created by a user since a given date
export const getUserEventsCountSince = async (userId: string, since: Date): Promise<number> => {
  try {
    const q = query(
      collection(db, 'events'),
      where('organizerId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(since))
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting user events since date:', error);
    return 0;
  }
};

// Ads (demo support)
export const getAds = async (): Promise<Array<{ id: string; imageUrl?: string; link?: string; title?: string }>> => {
  try {
    const snapshot = await getDocs(collection(db, 'ads'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any;
  } catch (e) {
    console.error('Error fetching ads', e);
    return [];
  }
};

export const recordAdImpression = async (adId: string): Promise<void> => {
  try {
    await addDoc(collection(db, 'ad_impressions'), { adId, createdAt: Timestamp.now() });
    await updateDoc(doc(db, 'ads', adId), { impressions: increment(1) });
  } catch (e) {
    console.error('Error recording ad impression', e);
  }
};

export const recordAdClick = async (adId: string): Promise<void> => {
  try {
    await addDoc(collection(db, 'ad_clicks'), { adId, createdAt: Timestamp.now() });
    await updateDoc(doc(db, 'ads', adId), { clicks: increment(1) });
  } catch (e) {
    console.error('Error recording ad click', e);
  }
};

// Support messages (contact form)
export const createSupportMessage = async (data: { name?: string; email?: string; message: string }) => {
  try {
    const docRef = await addDoc(collection(db, 'support_messages'), { ...data, createdAt: Timestamp.now() });
    return docRef.id;
  } catch (e) {
    console.error('Error creating support message', e);
    return null;
  }
};

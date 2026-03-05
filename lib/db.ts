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
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      date: Timestamp.fromDate(eventData.date),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
};

export const updateEvent = async (id: string, eventData: Partial<Event>): Promise<boolean> => {
  try {
    const docRef = doc(db, 'events', id);
    await updateDoc(docRef, { ...eventData, updatedAt: Timestamp.now() });
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
    const docRef = await addDoc(collection(db, 'comments'), {
      ...commentData,
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

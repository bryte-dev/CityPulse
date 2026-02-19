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
  limit,
  type Query,
  type DocumentData,
  type QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Event, Comment, ChatMessage, User } from '@/types';

// Convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Events
export const getEvents = async (filters?: QueryConstraint[]): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, 'events');
    const q = filters ? query(eventsRef, ...filters) : query(eventsRef);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: timestampToDate(doc.data().date),
      endDate: doc.data().endDate ? timestampToDate(doc.data().endDate) : undefined,
      createdAt: timestampToDate(doc.data().createdAt),
      updatedAt: timestampToDate(doc.data().updatedAt),
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
        endDate: docSnap.data().endDate ? timestampToDate(docSnap.data().endDate) : undefined,
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
      endDate: eventData.endDate ? Timestamp.fromDate(eventData.endDate) : null,
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
    await updateDoc(docRef, {
      ...eventData,
      updatedAt: Timestamp.now(),
    });
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

// Comments
export const getEventComments = async (eventId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToDate(doc.data().createdAt),
      updatedAt: timestampToDate(doc.data().updatedAt),
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
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    return null;
  }
};

// Chat Messages
export const getChatMessages = async (eventId: string): Promise<ChatMessage[]> => {
  try {
    const messagesRef = collection(db, 'chatMessages');
    const q = query(
      messagesRef,
      where('eventId', '==', eventId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToDate(doc.data().createdAt),
    })) as ChatMessage[];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
};

export const createChatMessage = async (messageData: Omit<ChatMessage, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'chatMessages'), {
      ...messageData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat message:', error);
    return null;
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

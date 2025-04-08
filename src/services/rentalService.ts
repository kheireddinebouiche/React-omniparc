import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { RentalRequest } from '../types';

export const createRentalRequest = async (request: Omit<RentalRequest, 'id'>): Promise<RentalRequest> => {
  try {
    const docRef = await addDoc(collection(db, 'rentalRequests'), request);
    return { id: docRef.id, ...request };
  } catch (error) {
    throw error;
  }
};

export const getRentalRequest = async (id: string): Promise<RentalRequest | null> => {
  try {
    const docRef = doc(db, 'rentalRequests', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as RentalRequest;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateRentalRequest = async (id: string, request: Partial<RentalRequest>): Promise<void> => {
  try {
    const docRef = doc(db, 'rentalRequests', id);
    await updateDoc(docRef, request);
  } catch (error) {
    throw error;
  }
};

export const getRentalRequestsByUser = async (userId: string): Promise<RentalRequest[]> => {
  try {
    const q = query(collection(db, 'rentalRequests'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RentalRequest));
  } catch (error) {
    throw error;
  }
};

export const getRentalRequestsByEquipment = async (equipmentId: string): Promise<RentalRequest[]> => {
  try {
    const q = query(collection(db, 'rentalRequests'), where('equipmentId', '==', equipmentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RentalRequest));
  } catch (error) {
    throw error;
  }
}; 
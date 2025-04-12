import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  deleteDoc
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

export const updateRentalRequest = async (requestId: string, data: Partial<RentalRequest>): Promise<void> => {
  try {
    const requestRef = doc(db, 'rentalRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Demande de location non trouvée');
    }

    await updateDoc(requestRef, data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la demande de location:', error);
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

export const cancelRentalRequest = async (requestId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'rentalRequests', requestId);
    await updateDoc(docRef, { status: 'REJECTED' });
  } catch (error) {
    throw error;
  }
};

export const deleteRentalRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'rentalRequests', requestId);
    await deleteDoc(requestRef);
  } catch (error) {
    console.error('Erreur lors de la suppression de la demande:', error);
    throw error;
  }
};

export const approveRentalRequest = async (requestId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'rentalRequests', requestId);
    await updateDoc(docRef, { status: 'APPROVED' });
  } catch (error) {
    throw error;
  }
}; 
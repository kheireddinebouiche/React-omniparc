import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Equipment } from '../types';

export const getEquipments = async (): Promise<Equipment[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'equipment'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment));
  } catch (error) {
    throw error;
  }
};

export const getEquipment = async (id: string): Promise<Equipment | null> => {
  try {
    const docRef = doc(db, 'equipment', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Equipment;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const addEquipment = async (equipment: Omit<Equipment, 'id'>): Promise<Equipment> => {
  try {
    const docRef = await addDoc(collection(db, 'equipment'), equipment);
    return { id: docRef.id, ...equipment };
  } catch (error) {
    throw error;
  }
};

export const updateEquipment = async (id: string, equipment: Partial<Equipment>): Promise<void> => {
  try {
    const docRef = doc(db, 'equipment', id);
    await updateDoc(docRef, equipment);
  } catch (error) {
    throw error;
  }
};

export const deleteEquipment = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'equipment', id);
    await deleteDoc(docRef);
  } catch (error) {
    throw error;
  }
};

export const getEquipmentsByOwner = async (ownerId: string): Promise<Equipment[]> => {
  try {
    const q = query(collection(db, 'equipment'), where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment));
  } catch (error) {
    throw error;
  }
}; 
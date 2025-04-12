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
    console.log('Début de la mise à jour de l\'équipement avec l\'ID:', id);
    console.log('Données de mise à jour:', equipment);

    if (!id) {
      console.error('ID de l\'équipement non fourni');
      throw new Error('ID de l\'équipement non fourni');
    }
    
    // S'assurer que l'ID est une chaîne valide
    const equipmentId = String(id).trim();
    if (!equipmentId) {
      console.error('ID de l\'équipement invalide après conversion');
      throw new Error('ID de l\'équipement invalide');
    }

    console.log('ID de l\'équipement validé:', equipmentId);

    // Créer la référence du document
    const equipmentRef = doc(db, 'equipment', equipmentId);
    console.log('Référence du document créée:', equipmentRef.path);
    
    // Vérifier si le document existe
    const docSnap = await getDoc(equipmentRef);
    if (!docSnap.exists()) {
      console.error('Document non trouvé pour l\'ID:', equipmentId);
      throw new Error('Équipement non trouvé');
    }

    console.log('Document trouvé, préparation de la mise à jour');

    // Préparer les données de mise à jour
    const { id: _, ...equipmentData } = equipment;
    console.log('Données préparées pour la mise à jour:', equipmentData);
    
    // Mettre à jour le document
    await updateDoc(equipmentRef, equipmentData);
    console.log('Document mis à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'équipement:', error);
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
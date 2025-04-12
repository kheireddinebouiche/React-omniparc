import { collection, query, where, getDocs, addDoc, deleteDoc, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Availability {
  id?: string;
  equipmentId: string;
  startDate: Date;
  endDate: Date;
  status: 'available' | 'unavailable';
}

export const getEquipmentAvailability = async (equipmentId: string): Promise<Availability[]> => {
  if (!equipmentId) {
    console.error('ID d\'équipement manquant');
    return [];
  }

  try {
    console.log('Récupération des disponibilités pour l\'équipement:', equipmentId);
    const availabilitiesRef = collection(db, 'availabilities');
    const q = query(availabilitiesRef, where('equipmentId', '==', equipmentId));
    const querySnapshot = await getDocs(q);
    
    const availabilities: Availability[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.startDate || !data.endDate) {
        console.warn('Données de date manquantes pour la disponibilité:', doc.id);
        return;
      }
      availabilities.push({
        id: doc.id,
        equipmentId: data.equipmentId,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        status: data.status
      });
    });
    
    console.log('Disponibilités récupérées:', availabilities);
    return availabilities;
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    throw error;
  }
};

export const updateEquipmentAvailability = async (
  equipmentId: string,
  availabilities: Omit<Availability, 'id'>[]
): Promise<void> => {
  if (!equipmentId || !availabilities) {
    throw new Error('Paramètres invalides');
  }

  try {
    console.log('Mise à jour des disponibilités pour l\'équipement:', equipmentId);
    console.log('Données à sauvegarder:', availabilities);
    
    const batch = writeBatch(db);
    
    // Supprimer les anciennes disponibilités
    const oldAvailabilities = await getEquipmentAvailability(equipmentId);
    console.log('Suppression de', oldAvailabilities.length, 'anciennes disponibilités');
    
    oldAvailabilities.forEach((availability) => {
      if (availability.id) {
        batch.delete(doc(db, 'availabilities', availability.id));
      }
    });

    // Ajouter les nouvelles disponibilités
    console.log('Ajout de', availabilities.length, 'nouvelles disponibilités');
    availabilities.forEach((availability) => {
      if (!availability.startDate || !availability.endDate) {
        console.warn('Disponibilité invalide ignorée:', availability);
        return;
      }
      
      const docRef = doc(collection(db, 'availabilities'));
      const data = {
        equipmentId,
        startDate: Timestamp.fromDate(new Date(availability.startDate)),
        endDate: Timestamp.fromDate(new Date(availability.endDate)),
        status: availability.status
      };
      
      console.log('Sauvegarde de la disponibilité:', data);
      batch.set(docRef, data);
    });

    await batch.commit();
    console.log('Mise à jour des disponibilités terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des disponibilités:', error);
    throw error;
  }
}; 
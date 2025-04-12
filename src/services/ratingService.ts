import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Rating } from '../types';

export const addRating = async (equipmentId: string, rating: Rating): Promise<void> => {
  try {
    const ratingsRef = collection(db, 'ratings');
    await addDoc(ratingsRef, {
      ...rating,
      equipmentId,
      createdAt: new Date(),
    });

    // Mettre à jour la note moyenne de l'équipement
    await updateAverageRating(equipmentId);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    throw error;
  }
};

export const getRatings = async (equipmentId: string): Promise<Rating[]> => {
  try {
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('equipmentId', '==', equipmentId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Rating[];
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    throw error;
  }
};

export const updateRating = async (ratingId: string, rating: Partial<Rating>): Promise<void> => {
  try {
    const ratingRef = doc(db, 'ratings', ratingId);
    await updateDoc(ratingRef, rating);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error);
    throw error;
  }
};

export const deleteRating = async (ratingId: string): Promise<void> => {
  try {
    const ratingRef = doc(db, 'ratings', ratingId);
    await deleteDoc(ratingRef);
  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    throw error;
  }
};

const updateAverageRating = async (equipmentId: string): Promise<void> => {
  try {
    const ratings = await getRatings(equipmentId);
    const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
    
    const equipmentRef = doc(db, 'equipment', equipmentId);
    await updateDoc(equipmentRef, {
      averageRating: averageRating || 0,
      totalRatings: ratings.length,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note moyenne:', error);
    throw error;
  }
}; 
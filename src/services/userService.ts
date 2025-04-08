import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, UserRole } from '../types';

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      role: doc.data().role.toUpperCase() as UserRole
    } as User));
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const updates: Partial<User> = {
      ...userData,
      role: userData.role ? userData.role.toUpperCase() as UserRole : undefined
    };
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const updates: Partial<User> = {
      isActive
    };

    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de l\'utilisateur:', error);
    throw error;
  }
};

export const getUsersByRole = async (role: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', role.toUpperCase()));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      role: doc.data().role.toUpperCase() as UserRole
    } as User));
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs par rôle:', error);
    throw error;
  }
};

export const deleteUserAndRelatedData = async (userId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // 1. Supprimer les demandes de location
    const rentalRequestsQuery = query(collection(db, 'rentalRequests'), where('userId', '==', userId));
    const rentalRequestsSnapshot = await getDocs(rentalRequestsQuery);
    rentalRequestsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 2. Supprimer les équipements
    const equipmentQuery = query(collection(db, 'equipment'), where('ownerId', '==', userId));
    const equipmentSnapshot = await getDocs(equipmentQuery);
    equipmentSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. Supprimer les notifications
    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 4. Supprimer les avis
    const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', userId));
    const reviewsSnapshot = await getDocs(reviewsQuery);
    reviewsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 5. Supprimer l'utilisateur
    const userRef = doc(db, 'users', userId);
    batch.delete(userRef);

    // Exécuter toutes les suppressions en une seule transaction
    await batch.commit();
  } catch (error) {
    console.error('Erreur lors de la suppression des données de l\'utilisateur:', error);
    throw error;
  }
}; 
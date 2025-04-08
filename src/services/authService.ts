import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserRole } from '../types';
import { serializeFirestoreData } from '../utils/serialization';
import { store } from '../store';
import { login, logout as logoutAction } from '../store/slices/authSlice';
import { deleteUserAndRelatedData } from './userService';

// Configurer la persistance de l'authentification
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Erreur lors de la configuration de la persistance:", error);
  });

// Écouter les changements d'état d'authentification
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      // Récupérer les données utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // S'assurer que le rôle est en majuscules
        const normalizedUserData = {
          ...userData,
          role: userData.role.toUpperCase() as UserRole
        };
        // Mettre à jour le store Redux avec les données utilisateur
        store.dispatch(login.fulfilled(normalizedUserData as User, '', { email: '', password: '' }));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur:", error);
    }
  } else {
    // Déconnecter l'utilisateur dans le store Redux
    store.dispatch(logoutAction.fulfilled(undefined, ''));
  }
});

export const register = async (
  email: string,
  password: string,
  userData: { firstName: string; lastName: string; role: UserRole }
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user: User = {
      id: userCredential.user.uid,
      email,
      ...userData,
      isActive: true,
    };

    await setDoc(doc(db, 'users', user.id), user);
    return serializeFirestoreData(user as any) as User;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }

    const userData = userDoc.data() as User;
    if (!userData.isActive) {
      await signOut(auth);
      throw new Error('Ce compte a été désactivé');
    }

    return serializeFirestoreData(userData as any) as User;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe();
      if (!firebaseUser) {
        resolve(null);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          resolve(null);
          return;
        }

        const userData = userDoc.data() as User;
        if (!userData.isActive) {
          await signOut(auth);
          resolve(null);
          return;
        }

        resolve(serializeFirestoreData(userData as any) as User);
      } catch (error: any) {
        reject(error);
      }
    });
  });
};

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, userData);

    const updatedDoc = await getDoc(userRef);
    if (!updatedDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }

    return serializeFirestoreData(updatedDoc.data() as any) as User;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteAccount = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    // 1. Supprimer toutes les données associées
    await deleteUserAndRelatedData(user.uid);

    // 2. Supprimer le compte Firebase Auth
    await deleteUser(user);

    // 3. Déconnecter l'utilisateur dans le store Redux
    store.dispatch(logoutAction.fulfilled(undefined, ''));
  } catch (error: any) {
    console.error('Erreur lors de la suppression du compte:', error);
    throw new Error(error.message);
  }
}; 
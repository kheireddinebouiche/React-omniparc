import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  deleteUser,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  AuthError,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserRole, RegisterData } from '../types';
import { serializeFirestoreData } from '../utils/serialization';
import { deleteUserAndRelatedData } from './userService';
import { VerificationStatus } from '../types/enums';

const VALID_ROLES = ['CLIENT', 'PROFESSIONAL', 'BUSINESS', 'ADMIN'] as const;
const MIN_PASSWORD_LENGTH = 6;

// Configurer la persistance de l'authentification
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Erreur lors de la configuration de la persistance:", error);
  });

// Écouter les changements d'état d'authentification
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        if (!userData.isActive) {
          await signOut(auth);
          throw new Error('Ce compte a été désactivé');
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      await signOut(auth);
    }
  }
});

const handleAuthError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée.';
    case 'auth/invalid-email':
      return 'Adresse email invalide.';
    case 'auth/operation-not-allowed':
      return 'Opération non autorisée.';
    case 'auth/weak-password':
      return 'Le mot de passe est trop faible.';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé.';
    case 'auth/user-not-found':
      return 'Aucun utilisateur trouvé avec cette adresse email.';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Veuillez réessayer plus tard.';
    case 'auth/network-request-failed':
      return 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
    default:
      return `Erreur d'authentification: ${error.message}`;
  }
};

export const register = async (userData: RegisterData): Promise<User> => {
  try {
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName || !userData.role) {
      throw new Error('Tous les champs sont obligatoires');
    }

    if (userData.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
    }

    if (!VALID_ROLES.includes(userData.role)) {
      throw new Error('Rôle utilisateur invalide');
    }

    const { email, password, firstName, lastName, role } = userData;
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });

    const verificationStatus = role === 'CLIENT' ? VerificationStatus.APPROVED : VerificationStatus.PENDING;

    const userDoc: User = {
      id: user.uid,
      email,
      firstName,
      lastName,
      role,
      createdAt: serverTimestamp(),
      isActive: true,
      emailVerified: false,
      lastLogin: serverTimestamp(),
      verificationStatus: verificationStatus
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);
    
    try {
      await sendEmailVerification(user);
    } catch (emailError) {
      console.warn('Impossible d\'envoyer l\'email de vérification:', emailError);
    }
    
    return userDoc;
  } catch (error: any) {
    if (error.code) {
      throw new Error(handleAuthError(error));
    }
    throw new Error(`Erreur lors de l'inscription: ${error.message}`);
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    if (!email || !password) {
      throw new Error('Email et mot de passe requis');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error('Données utilisateur non trouvées');
    }

    const userData = userDoc.data() as User;
    
    if (!userData.isActive) {
      await signOut(auth);
      throw new Error('Ce compte a été désactivé');
    }

    if (!VALID_ROLES.includes(userData.role)) {
      await signOut(auth);
      throw new Error('Rôle utilisateur invalide');
    }

    await updateDoc(doc(db, 'users', userCredential.user.uid), {
      lastLogin: serverTimestamp(),
      emailVerified: userCredential.user.emailVerified
    });

    return {
      ...userData,
      role: userData.role.toUpperCase() as UserRole
    };
  } catch (error: any) {
    if (error.code) {
      throw new Error(handleAuthError(error));
    }
    throw new Error(`Erreur de connexion: ${error.message}`);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`Erreur lors de la déconnexion: ${error.message}`);
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    if (!email) {
      throw new Error('Email requis');
    }
    
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    if (error.code) {
      throw new Error(handleAuthError(error));
    }
    throw new Error(`Erreur lors de la réinitialisation du mot de passe: ${error.message}`);
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

        // S'assurer que le rôle est en majuscules
        const userWithUpperCaseRole = {
          ...serializeFirestoreData(userData as any),
          role: userData.role.toUpperCase() as UserRole
        };

        resolve(userWithUpperCaseRole as User);
      } catch (error: any) {
        reject(error);
      }
    });
  });
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
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
  } catch (error: any) {
    console.error('Erreur lors de la suppression du compte:', error);
    throw new Error(error.message);
  }
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole.toUpperCase()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    throw error;
  }
};

const authService = {
  register,
  loginUser,
  logoutUser,
  resetPassword,
  getCurrentUser,
  updateUserProfile,
  deleteAccount,
  updateUserRole
};

export default authService; 
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

async function initializeAdmin() {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const user = userCredential.user;

    // Créer le document administrateur dans Firestore
    const adminDoc = {
      id: user.uid,
      email: ADMIN_EMAIL,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      createdAt: new Date(),
      isActive: true
    };

    await setDoc(doc(db, 'users', user.uid), adminDoc);
    console.log('Administrateur créé avec succès!');
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
  }
}

// Exécuter la fonction
initializeAdmin(); 
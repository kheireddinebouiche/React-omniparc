import { collection, doc, getDocs, query, updateDoc, where, addDoc, getDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { VerificationDocument, VerificationHistory } from '../types';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const DOCUMENTS_COLLECTION = 'verificationDocuments';
const HISTORY_COLLECTION = 'verificationHistory';

type VerificationAction = 'UPLOAD' | 'VERIFY' | 'REJECT';
type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

const getDocumentType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'PDF';
    case 'jpg':
    case 'jpeg':
      return 'IMAGE';
    case 'png':
      return 'IMAGE';
    default:
      return 'OTHER';
  }
};

class VerificationService {
  private readonly documentsCollection = DOCUMENTS_COLLECTION;
  private readonly historyCollection = HISTORY_COLLECTION;

  async uploadVerificationDocument(userId: string, file: File, documentType: string): Promise<VerificationDocument> {
    try {
      // Upload du fichier dans Firebase Storage
      const storageRef = ref(storage, `verification-documents/${userId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Création de l'entrée dans Firestore
      const docData: Omit<VerificationDocument, 'id'> = {
        userId,
        name: file.name,
        type: documentType,
        url: downloadURL,
        status: 'PENDING',
        uploadDate: new Date().toISOString(),
        comments: undefined
      };

      const docRef = await addDoc(collection(db, this.documentsCollection), docData);
      const document = { ...docData, id: docRef.id };

      // Ajout d'une entrée dans l'historique
      const historyData: Omit<VerificationHistory, 'id'> = {
        userId,
        action: 'UPLOAD',
        status: 'PENDING',
        timestamp: new Date().toISOString(),
        comments: `Document ${file.name} téléchargé`
      };

      await addDoc(collection(db, this.historyCollection), historyData);

      return document;
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      throw new Error('Impossible de télécharger le document');
    }
  }

  async getVerificationDocuments(userId: string): Promise<VerificationDocument[]> {
    try {
      const q = query(
        collection(db, this.documentsCollection),
        where('userId', '==', userId),
        orderBy('uploadDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VerificationDocument));
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      throw new Error('Impossible de récupérer les documents');
    }
  }

  async getVerificationHistory(userId: string): Promise<VerificationHistory[]> {
    try {
      const q = query(
        collection(db, this.historyCollection),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VerificationHistory));
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw new Error('Impossible de récupérer l\'historique');
    }
  }

  private getDocumentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'jpg':
      case 'jpeg':
        return 'IMAGE';
      case 'png':
        return 'IMAGE';
      default:
        return 'AUTRE';
    }
  }

  async updateVerificationDocument(
    documentId: string,
    status: VerificationStatus,
    verifiedBy: string,
    comments?: string
  ): Promise<void> {
    try {
      // Mise à jour du document
      const docRef = doc(db, this.documentsCollection, documentId);
      await updateDoc(docRef, {
        status,
        verifiedAt: new Date().toISOString(),
        verifiedBy,
        comments: comments || undefined
      });

      // Récupération du document pour obtenir l'userId
      const docSnap = await getDocs(query(collection(db, this.documentsCollection), where('id', '==', documentId)));
      if (docSnap.empty) {
        throw new Error('Document non trouvé');
      }
      const document = docSnap.docs[0].data() as VerificationDocument;

      // Ajout d'une entrée dans l'historique
      const action: VerificationAction = status === 'APPROVED' ? 'VERIFY' : 'REJECT';
      const historyData: Omit<VerificationHistory, 'id'> = {
        userId: document.userId,
        action,
        status,
        timestamp: new Date().toISOString(),
        comments: comments || `Document ${status === 'APPROVED' ? 'approuvé' : 'rejeté'} par l'administrateur`
      };

      await addDoc(collection(db, this.historyCollection), historyData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du document:', error);
      throw new Error('Impossible de mettre à jour le document');
    }
  }

  async getHistory(userId: string): Promise<VerificationHistory[]> {
    return this.getVerificationHistory(userId);
  }
}

export const verificationService = new VerificationService();
export const { 
  uploadVerificationDocument,
  getVerificationDocuments,
  getVerificationHistory,
  getHistory,
  updateVerificationDocument 
} = verificationService; 
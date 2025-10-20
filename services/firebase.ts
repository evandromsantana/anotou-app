import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  enableMultiTabIndexedDbPersistence,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Habilitar persistência offline
export const enableOfflinePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    });
    console.log('Persistência offline habilitada');
  } catch (err) {
    console.error('Erro ao habilitar persistência offline:', err);
    if (err.code === 'failed-precondition') {
      console.warn('Múltiplas abas abertas, persistência pode não funcionar');
    } else if (err.code === 'unimplemented') {
      console.warn('Navegador não suporta persistência offline');
    }
  }
};

export default app;
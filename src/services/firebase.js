import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDFAye6VflYJNDcNdpqerfX67EZtgec_iA',
  authDomain: 'gym-rpg-c9b29.firebaseapp.com',
  projectId: 'gym-rpg-c9b29',
  storageBucket: 'gym-rpg-c9b29.firebasestorage.app',
  messagingSenderId: '1007300975001',
  appId: '1:1007300975001:web:169d5399bee48e37dfdb08',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Persistencia offline (IndexedDB): funciona sin internet y sincroniza al reconectar
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

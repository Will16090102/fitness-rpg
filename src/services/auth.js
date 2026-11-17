import { GoogleAuthProvider, linkWithPopup, onAuthStateChanged, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase.js';

const provider = new GoogleAuthProvider();

export const watchUser = (cb) => onAuthStateChanged(auth, cb);
export const loginAnonimo = () => signInAnonymously(auth);
export const logout = () => signOut(auth);

// Si ya entraste como anónimo, vincula tu cuenta de Google para conservar el progreso
export async function loginGoogle() {
  if (auth.currentUser && auth.currentUser.isAnonymous) {
    try { return await linkWithPopup(auth.currentUser, provider); }
    catch (e) { if (e.code !== 'auth/credential-already-in-use') throw e; }
  }
  return signInWithPopup(auth, provider);
}

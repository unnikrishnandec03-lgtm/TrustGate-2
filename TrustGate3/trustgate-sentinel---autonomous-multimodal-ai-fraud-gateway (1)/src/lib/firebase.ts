import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { HistoricalScan, TrustGatePayload } from '../types/forensic';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection verification test
export async function verifyFirestoreConnection(): Promise<boolean> {
  try {
    const testDoc = doc(db, '_connection_test_', 'ping');
    await getDocFromServer(testDoc);
    return true;
  } catch (err: any) {
    // If permission-denied or doc not found, it still proves the endpoint responded!
    if (err?.code === 'permission-denied' || err?.code === 'not-found') {
      return true;
    }
    console.warn('Firestore connection check notice:', err?.message || err);
    return false;
  }
}

// Auth Helpers
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // Sync user profile to Firestore
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(
        userRef,
        {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'Security Operator',
          photoURL: result.user.photoURL || '',
          role: 'OPERATOR',
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

// Firestore Persistence: Save Scan Audit Log
export async function persistScanRecord(
  scan: HistoricalScan,
  payload?: TrustGatePayload,
  user?: User | null
): Promise<string | null> {
  try {
    const scansCol = collection(db, 'scans');
    const docRef = await addDoc(scansCol, {
      ...scan,
      userId: user?.uid || 'anonymous_operator',
      userEmail: user?.email || 'operator@trustgate.internal',
      persistedAt: serverTimestamp(),
      fullPayload: payload || null,
    });
    return docRef.id;
  } catch (err) {
    console.warn('Scan persistence warning:', err);
    return null;
  }
}

// Firestore Persistence: Quarantine Entity
export async function persistQuarantineEntity(
  sha256: string,
  targetName: string,
  riskScore: number,
  vector: string,
  operatorEmail: string
): Promise<string | null> {
  try {
    const quarantineCol = collection(db, 'quarantine');
    const docRef = await addDoc(quarantineCol, {
      sha256,
      targetName,
      riskScore,
      vector,
      operatorEmail,
      status: 'ACTIVE_LOCK',
      quarantinedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('Quarantine persistence warning:', err);
    return null;
  }
}

// Real-time listener for Scan Audits
export function subscribeToScanAudits(callback: (scans: HistoricalScan[]) => void) {
  try {
    const q = query(collection(db, 'scans'), orderBy('persistedAt', 'desc'), limit(15));
    return onSnapshot(
      q,
      (snapshot) => {
        const records: HistoricalScan[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          records.push({
            id: data.id || d.id,
            timestamp: data.timestamp || new Date().toLocaleTimeString(),
            targetName: data.targetName,
            vector: data.vector,
            riskScore: data.riskScore,
            verdict: data.verdict,
            latencyMs: data.latencyMs,
            enforcement: data.enforcement,
          });
        });
        if (records.length > 0) {
          callback(records);
        }
      },
      (err) => {
        console.warn('Firestore subscription notice:', err.message);
      }
    );
  } catch (err) {
    console.warn('Unable to attach real-time scan subscription:', err);
    return () => {};
  }
}

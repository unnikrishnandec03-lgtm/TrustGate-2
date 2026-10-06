import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, signOutUser, verifyFirestoreConnection } from '../lib/firebase';

export type OperatorRole = 'ADMIN' | 'ANALYST' | 'OPERATOR';

export interface OperatorProfile {
  fullName: string;
  mobileNumber: string;
  email: string;
  role: OperatorRole;
  levelNumber: number; // 1 (Low), 2 (Medium), 3 (High)
  clearanceName: string;
}

export function useFirebaseAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<OperatorRole>('ADMIN');
  const [operatorProfile, setOperatorProfile] = useState<OperatorProfile>({
    fullName: 'Stan Hristov',
    mobileNumber: '+1 (555) 382-9014',
    email: 'stan.hristov@gmail.com',
    role: 'ADMIN',
    levelNumber: 3,
    clearanceName: 'Level 3: Enclave Director',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [connectedToFirestore, setConnectedToFirestore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check initial connection
    verifyFirestoreConnection().then((connected) => {
      setConnectedToFirestore(connected);
    });

    let profileUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Listen to live user profile from Firestore
        const userRef = doc(db, 'users', user.uid);
        profileUnsub = onSnapshot(
          userRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              if (data?.role) {
                setUserRole(data.role as OperatorRole);
              }
              if (data?.fullName || data?.phoneNumber) {
                setOperatorProfile((prev) => ({
                  ...prev,
                  fullName: data.fullName || prev.fullName,
                  mobileNumber: data.phoneNumber || prev.mobileNumber,
                  email: data.email || user.email || prev.email,
                  role: (data.role as OperatorRole) || prev.role,
                  levelNumber: data.role === 'ADMIN' ? 3 : data.role === 'ANALYST' ? 2 : 1,
                  clearanceName:
                    data.role === 'ADMIN'
                      ? 'Level 3: Enclave Director (High)'
                      : data.role === 'ANALYST'
                      ? 'Level 2: Forensic Officer (Medium)'
                      : 'Level 1: Investigator (Low)',
                }));
              }
            }
          },
          (err) => {
            console.warn('User profile listener notice:', err);
          }
        );
      } else {
        if (profileUnsub) {
          profileUnsub();
          profileUnsub = null;
        }
      }
    });

    return () => {
      unsubscribe();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // Custom Web Operator Login with Name, Mobile Number, and Gmail
  const handleOperatorLogin = async (
    fullName: string,
    mobileNumber: string,
    gmail: string,
    role: OperatorRole
  ) => {
    setError(null);
    const levelNumber = role === 'ADMIN' ? 3 : role === 'ANALYST' ? 2 : 1;
    const clearanceName =
      role === 'ADMIN'
        ? 'Level 3: Enclave Director (High)'
        : role === 'ANALYST'
        ? 'Level 2: Forensic Officer (Medium)'
        : 'Level 1: Investigator (Low)';

    const profile: OperatorProfile = {
      fullName: fullName.trim() || 'Stan Hristov',
      mobileNumber: mobileNumber.trim() || '+1 (555) 234-5678',
      email: gmail.trim() || 'stan.hristov@gmail.com',
      role,
      levelNumber,
      clearanceName,
    };

    setOperatorProfile(profile);
    setUserRole(role);

    // Create authenticated mock user session
    const mockUser: any = {
      uid: 'op-' + Math.floor(100000 + Math.random() * 900000),
      email: profile.email,
      displayName: profile.fullName,
      phoneNumber: profile.mobileNumber,
      photoURL: '',
      emailVerified: true,
    };

    setCurrentUser(mockUser);
    setLoading(false);

    // Persist to Firestore if connected
    if (connectedToFirestore) {
      try {
        const userRef = doc(db, 'users', mockUser.uid);
        await setDoc(
          userRef,
          {
            uid: mockUser.uid,
            fullName: profile.fullName,
            phoneNumber: profile.mobileNumber,
            email: profile.email,
            role,
            levelNumber,
            clearanceName,
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore operator profile persist notice:', err);
      }
    }

    return mockUser;
  };

  const handleSignInWithGoogle = async (desiredRole: OperatorRole = 'ADMIN') => {
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setUserRole(desiredRole);
        const levelNum = desiredRole === 'ADMIN' ? 3 : desiredRole === 'ANALYST' ? 2 : 1;
        setOperatorProfile((prev) => ({
          ...prev,
          fullName: user.displayName || prev.fullName,
          email: user.email || prev.email,
          role: desiredRole,
          levelNumber: levelNum,
          clearanceName:
            desiredRole === 'ADMIN'
              ? 'Level 3: Enclave Director (High)'
              : desiredRole === 'ANALYST'
              ? 'Level 2: Forensic Officer (Medium)'
              : 'Level 1: Investigator (Low)',
        }));

        if (connectedToFirestore) {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(
            userRef,
            {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Security Operator',
              photoURL: user.photoURL || '',
              role: desiredRole,
              levelNumber: levelNum,
              lastLoginAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }
      return user;
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed';
      setError(msg);
      throw err;
    }
  };

  const handleUpdateRole = async (newRole: OperatorRole) => {
    setUserRole(newRole);
    const levelNum = newRole === 'ADMIN' ? 3 : newRole === 'ANALYST' ? 2 : 1;
    setOperatorProfile((prev) => ({
      ...prev,
      role: newRole,
      levelNumber: levelNum,
      clearanceName:
        newRole === 'ADMIN'
          ? 'Level 3: Enclave Director (High)'
          : newRole === 'ANALYST'
          ? 'Level 2: Forensic Officer (Medium)'
          : 'Level 1: Investigator (Low)',
    }));

    if (currentUser && connectedToFirestore) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { role: newRole, levelNumber: levelNum, updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.warn('Role update notice:', err);
      }
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await signOutUser();
      setCurrentUser(null);
      setUserRole('ADMIN');
    } catch (err: any) {
      setError(err?.message || 'Sign out failed');
      setCurrentUser(null);
    }
  };

  return {
    currentUser,
    userRole,
    operatorProfile,
    loading,
    connectedToFirestore,
    error,
    loginWithOperatorDetails: handleOperatorLogin,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    updateRole: handleUpdateRole,
  };
}

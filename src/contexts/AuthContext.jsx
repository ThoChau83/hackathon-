import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  deleteUser,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile (role, store_name, etc.) from Firestore
  async function fetchUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Register with email/password
  async function register(email, password, storeName, phone, address) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // From here on the account already exists in Firebase Auth. If any of the
    // remaining steps fail we must undo it, otherwise the email is taken by an
    // account that has no profile and can never finish signing up.
    try {
      await updateProfile(cred.user, { displayName: storeName });

      // Create Firestore user document with role 'user'
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: email,
        role: 'user',
        store_name: storeName,
        phone: phone,
        address: address,
        created_at: serverTimestamp()
      });
    } catch (error) {
      // deleteUser needs a recent sign-in, which we have — the account was
      // created moments ago. If it still fails, sign out so we at least don't
      // leave a half-registered session running.
      try {
        await deleteUser(cred.user);
      } catch {
        await signOut(auth);
      }
      throw error;
    }

    const profile = await fetchUserProfile(cred.user.uid);
    return { user: cred.user, profile };
  }

  // Login with email/password
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchUserProfile(cred.user.uid);
    return { user: cred.user, profile };
  }

  // Login with Google
  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    // Check if user document exists; if not, create one
    const existingProfile = await fetchUserProfile(cred.user.uid);
    if (!existingProfile) {
      // Unlike email sign-up we never delete the account here — a Google
      // account may well predate this login. Signing out is enough to avoid a
      // session with no profile behind it.
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          email: cred.user.email,
          role: 'user',
          store_name: cred.user.displayName || '',
          phone: '',
          address: '',
          created_at: serverTimestamp()
        });
      } catch (error) {
        await signOut(auth);
        throw error;
      }
      await fetchUserProfile(cred.user.uid);
    }
    return cred.user;
  }

  // Logout
  async function logout() {
    await signOut(auth);
    setUserProfile(null);
  }

  // Check if current user is admin
  function isAdmin() {
    return userProfile?.role === 'admin';
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    isAdmin,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

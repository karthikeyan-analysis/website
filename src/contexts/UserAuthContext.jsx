import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { userService } from "../services/userService";

const UserAuthContext = createContext(null);

function mapAuthError(error) {
  switch (error.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled. Please try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/requires-recent-login":
      return "Please log out and log in again before changing your password.";
    default:
      return error.message || "An error occurred. Please try again.";
  }
}

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }
      // Always set the Firebase user immediately so auth-gated routes work
      setUser(firebaseUser);
      try {
        const profile = await userService.getOrCreateProfile(firebaseUser);
        setUserProfile(profile);
      } catch {
        // Profile fetch failed (e.g. Firestore offline) — user stays logged in
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: mapAuthError(error) };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(result.user, { displayName: name });
      await userService.getOrCreateProfile({ ...result.user, displayName: name });
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: mapAuthError(error) };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await userService.getOrCreateProfile(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: mapAuthError(error) };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: mapAuthError(error) };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      if (!auth.currentUser) throw new Error("Not logged in.");
      await updatePassword(auth.currentUser, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: mapAuthError(error) };
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const profile = await userService.getProfile(user.uid);
      setUserProfile(profile);
    } catch {
      // ignore
    }
  }, [user]);

  return (
    <UserAuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        resetPassword,
        changePassword,
        refreshProfile,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within UserAuthProvider");
  return ctx;
};

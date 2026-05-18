import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  loginAdmin,
  logoutAdmin,
  resolveAdminSession,
  signupAdmin,
  mapFirebaseAuthError,
} from "../services/adminAuthService";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem("adminToken");

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const session = await resolveAdminSession(user);
          setAdmin(session);
        } else {
          setAdmin(null);
        }
      } catch {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await loginAdmin(email, password);
      if (result.success) {
        setAdmin(result.admin);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: mapFirebaseAuthError(error),
      };
    }
  };

  const signup = async (payload) => {
    try {
      const result = await signupAdmin(payload);
      if (result.success) {
        setAdmin(result.admin);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: mapFirebaseAuthError(error),
      };
    }
  };

  const logout = async () => {
    await logoutAdmin();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, signup, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};

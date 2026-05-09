import { createContext, useContext, useEffect, useState } from "react";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const storedAdmin = localStorage.getItem("adminToken");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simple demo authentication - in production use actual backends
    if (email === "admin@karthikeyan.com" && password === "admin@123") {
      const adminData = {
        id: 1,
        email,
        name: "Admin",
        token: "admin_token_" + Date.now(),
      };
      localStorage.setItem("adminToken", JSON.stringify(adminData));
      setAdmin(adminData);
      return { success: true };
    }
    return {
      success: false,
      error: "Invalid email or password",
    };
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
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

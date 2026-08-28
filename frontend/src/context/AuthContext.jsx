import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  logoutUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("sentinelai_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        if (response.success && response.user) {
          setUser(response.user);

          localStorage.setItem(
            "sentinelai_user",
            JSON.stringify(response.user)
          );
        } else {
          logoutUser();
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        logoutUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (authData) => {
    if (!authData?.token || !authData?.user) {
      console.error("Invalid authentication response");
      return false;
    }

    localStorage.setItem(
      "sentinelai_token",
      authData.token
    );

    localStorage.setItem(
      "sentinelai_user",
      JSON.stringify(authData.user)
    );

    setUser(authData.user);

    return true;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
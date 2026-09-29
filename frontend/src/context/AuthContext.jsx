import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authApi } from "../lib/api";

const AuthContext = createContext(null);

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const token = localStorage.getItem("documind_token");
      const persistedUser = safeParse(localStorage.getItem("documind_user"));

      if (!token) {
        if (active) setIsLoading(false);
        return;
      }

      if (persistedUser && active) {
        setUser(persistedUser);
        setIsAuthenticated(true);
      }

      try {
        const response = await authApi.me();
        if (!active) return;
        const nextUser = response.user;
        localStorage.setItem("documind_user", JSON.stringify(nextUser));
        setUser(nextUser);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("documind_token");
        localStorage.removeItem("documind_user");
        if (active) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const handleStorageChange = (event) => {
      if (event.key !== "documind_token" && event.key !== "documind_user") {
        return;
      }

      const token = localStorage.getItem("documind_token");
      const nextUser = safeParse(localStorage.getItem("documind_user"));
      setUser(token && nextUser ? nextUser : null);
      setIsAuthenticated(Boolean(token && nextUser));
    };

    restoreSession();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      active = false;
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      const nextUser = response.user;
      localStorage.setItem("documind_token", response.token);
      localStorage.setItem("documind_user", JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthenticated(true);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(payload);
      if (response.token) {
        const nextUser = response.user;
        localStorage.setItem("documind_token", response.token);
        localStorage.setItem("documind_user", JSON.stringify(nextUser));
        setUser(nextUser);
        setIsAuthenticated(true);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (payload) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyEmail(payload);
      const nextUser = response.user;
      localStorage.setItem("documind_token", response.token);
      localStorage.setItem("documind_user", JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthenticated(true);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeOAuthLogin = useCallback(async (token) => {
    setIsLoading(true);
    try {
      localStorage.setItem("documind_token", token);
      const response = await authApi.me();
      const nextUser = response.user;
      localStorage.setItem("documind_user", JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthenticated(true);
      return nextUser;
    } catch (error) {
      localStorage.removeItem("documind_token");
      localStorage.removeItem("documind_user");
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("documind_token");
    localStorage.removeItem("documind_user");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((data) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...data };
      localStorage.setItem("documind_user", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        verifyEmail,
        completeOAuthLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must  be inside AuthProvider");
  return ctx;
};

/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import {
  AuthUser,
  RegisterData,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  refreshToken as authRefreshToken,
  getCurrentUser as authGetCurrentUser,
  fetchCurrentUser,
  hasRole as authHasRole,
  initializeAuth,
  isAuthenticated,
} from "@/services/authService";
import { logger } from "@/utils/logger";

interface AuthContextValue {
  user: AuthUser | null;
  roles: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getCurrentUser: () => AuthUser | null;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        initializeAuth();
        const storedUser = authGetCurrentUser();

        if (storedUser) {
          // Try to fetch fresh user data from backend
          const freshUser = await fetchCurrentUser();
          setUser(freshUser || storedUser);
        }
      } catch (error) {
        logger.error("Failed to initialize auth", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loggedInUser = await authLogin(email, password);
      setUser(loggedInUser);
      logger.info("User logged in successfully");
    } catch (error) {
      logger.error("Login failed", error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const registeredUser = await authRegister(userData);
      setUser(registeredUser);
      logger.info("User registered successfully");
    } catch (error) {
      logger.error("Registration failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
      logger.info("User logged out successfully");
    } catch (error) {
      logger.error("Logout failed", error);
      // Still clear user state even if backend call fails
      setUser(null);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const success = await authRefreshToken();
      if (success) {
        // Optionally fetch fresh user data after token refresh
        const freshUser = await fetchCurrentUser();
        if (freshUser) {
          setUser(freshUser);
        }
      } else {
        setUser(null);
      }
      return success;
    } catch (error) {
      logger.error("Token refresh failed", error);
      setUser(null);
      return false;
    }
  };

  const getCurrentUser = () => user;

  const hasRole = (role: string | string[]) => authHasRole(user, role);

  const userIsAuthenticated = user !== null && isAuthenticated();

  return (
    <AuthContext.Provider
      value={{
        user,
        roles: user?.roles ?? [],
        isLoading,
        isAuthenticated: userIsAuthenticated,
        login,
        register,
        logout,
        refreshToken,
        getCurrentUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

export { AuthContext };

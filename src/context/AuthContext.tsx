/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode } from "react";

import {
  AuthUser,
  login as authLogin,
  logout as authLogout,
  refreshToken as authRefreshToken,
  getCurrentUser as authGetCurrentUser,
  hasRole as authHasRole,
} from "@/services/authService";

interface AuthContextValue {
  user: AuthUser | null;
  roles: string[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => AuthUser | null;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(authGetCurrentUser());

  const login = async (username: string, password: string) => {
    const loggedIn = await authLogin(username, password);
    setUser(loggedIn);
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  const refreshToken = async () => {
    await authRefreshToken();
  };

  const getCurrentUser = () => user;

  const hasRole = (role: string | string[]) => authHasRole(user, role);

  return (
    <AuthContext.Provider
      value={{
        user,
        roles: user?.roles ?? [],
        login,
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

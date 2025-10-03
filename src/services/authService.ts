// src/services/authService.ts - Real backend authentication

import { apiClient } from "./apiClient";
import { logger } from "../utils/logger";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string; // computed from firstName + lastName
  role: string;
  roles: string[]; // for backward compatibility
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: "nexus_access_token",
  REFRESH_TOKEN: "nexus_refresh_token",
  USER: "nexus_auth_user",
};

// Token management
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  // Set the auth token in the API client
  apiClient.setAuthToken(accessToken);
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  window.localStorage.removeItem(STORAGE_KEYS.USER);
  // Clear the auth token from the API client
  apiClient.clearAuthToken();
}

function mapUserData(userData: LoginResponse["user"]): AuthUser {
  const fullName =
    [userData.firstName, userData.lastName].filter(Boolean).join(" ") ||
    userData.email;
  return {
    id: userData.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    name: fullName,
    role: userData.role,
    roles: [userData.role.toLowerCase()], // Convert to array for backward compatibility
  };
}

// Authentication functions
export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      data: LoginResponse;
    }>("/auth/login", {
      email,
      password,
    });

    if (!response.success || !response.data) {
      throw new Error("Login failed");
    }

    const { user, tokens } = response.data;

    // Store tokens
    setTokens(tokens.accessToken, tokens.refreshToken);

    // Map and store user data
    const authUser = mapUserData(user);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
    }

    logger?.info("User logged in successfully", {
      userId: authUser.id,
      email: authUser.email,
    });
    return authUser;
  } catch (error) {
    logger?.error("Login failed", error);
    throw error;
  }
}

export async function register(userData: RegisterData): Promise<AuthUser> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      data: LoginResponse;
    }>("/auth/register", userData);

    if (!response.success || !response.data) {
      throw new Error("Registration failed");
    }

    const { user, tokens } = response.data;

    // Store tokens
    setTokens(tokens.accessToken, tokens.refreshToken);

    // Map and store user data
    const authUser = mapUserData(user);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
    }

    logger?.info("User registered successfully", {
      userId: authUser.id,
      email: authUser.email,
    });
    return authUser;
  } catch (error) {
    logger?.error("Registration failed", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      // Notify backend about logout
      await apiClient.post("/auth/logout", { refreshToken });
    }
  } catch (error) {
    // Log error but don't throw - we want to clear local data regardless
    logger?.warn("Logout request failed, clearing local data anyway", error);
  } finally {
    clearTokens();
    logger?.info("User logged out");
  }
}

export async function refreshToken(): Promise<boolean> {
  try {
    const refreshTokenValue = getRefreshToken();

    if (!refreshTokenValue) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<{
      success: boolean;
      data: { tokens: LoginResponse["tokens"] };
    }>("/auth/refresh", {
      refreshToken: refreshTokenValue,
    });

    if (!response.success || !response.data) {
      throw new Error("Token refresh failed");
    }

    const { tokens } = response.data;
    setTokens(tokens.accessToken, tokens.refreshToken);

    logger?.debug("Tokens refreshed successfully");
    return true;
  } catch (error) {
    logger?.error("Token refresh failed", error);
    clearTokens();
    return false;
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch (error) {
    logger?.error("Failed to parse stored user data", error);
    clearTokens();
    return null;
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const token = getAccessToken();
    if (!token) return null;

    // Set token in API client if not already set
    apiClient.setAuthToken(token);

    const response = await apiClient.get<{
      success: boolean;
      data: { user: LoginResponse["user"] };
    }>("/auth/me");

    if (!response.success || !response.data) {
      return null;
    }

    const authUser = mapUserData(response.data.user);

    // Update stored user data
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
    }

    return authUser;
  } catch (error) {
    logger?.error("Failed to fetch current user", error);
    // If token is invalid, try to refresh
    const refreshSuccess = await refreshToken();
    if (refreshSuccess) {
      // Retry the request after refresh
      return fetchCurrentUser();
    }
    return null;
  }
}

export function hasRole(
  user: AuthUser | null,
  role: string | string[],
): boolean {
  if (!user) return false;
  const required = Array.isArray(role) ? role : [role];
  return required.some(
    (r) =>
      user.roles.includes(r.toLowerCase()) ||
      user.role.toLowerCase() === r.toLowerCase(),
  );
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null && getCurrentUser() !== null;
}

// Initialize auth on app start
export function initializeAuth(): void {
  const token = getAccessToken();
  if (token) {
    apiClient.setAuthToken(token);
  }
}

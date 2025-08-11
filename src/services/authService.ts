// src/services/authService.ts
// anchor: authService

export interface AuthUser {
  id: string;
  name: string;
  roles: string[];
}

const STORAGE_KEY = "nexus_auth_user";

export async function login(
  username: string,
  _password: string,
): Promise<AuthUser> {
  // Simple mock login implementation
  const user: AuthUser = {
    id: "1",
    name: username,
    roles: username === "admin" ? ["admin"] : ["user"],
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  return user;
}

export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export async function refreshToken(): Promise<void> {
  // Placeholder for token refresh logic
  return Promise.resolve();
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function hasRole(
  user: AuthUser | null,
  role: string | string[],
): boolean {
  if (!user) return false;
  const required = Array.isArray(role) ? role : [role];
  return required.some((r) => user.roles.includes(r));
}

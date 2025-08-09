const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    const data = (await res.json()) as T;
    return { data };
  } catch (error: any) {
    return { data: null as any, error: error.message };
  }
}

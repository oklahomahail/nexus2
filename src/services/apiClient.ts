export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  defaultHeaders?: Record<string, string>;
}

export interface IApiClient {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T>;
  put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T>;
  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T>;
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

class ApiClient implements IApiClient {
  private config: ApiClientConfig;
  private authToken: string | null = null;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      defaultHeaders: { "Content-Type": "application/json" },
      ...config,
    };
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  private getHeaders(
    customHeaders?: Record<string, string>,
  ): Record<string, string> {
    const headers = { ...this.config.defaultHeaders, ...customHeaders };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & { retries?: number } = {},
  ): Promise<T> {
    const { retries = this.config.retries, ...requestOptions } = options;
    const url = `${this.config.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
        headers: this.getHeaders(
          requestOptions.headers as Record<string, string>,
        ),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = response.statusText;
        let errorDetails: unknown = null;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errorDetails = errorData;
        } catch {
          // If JSON parsing fails, use text response
          try {
            errorMessage = await response.text();
          } catch {
            // Fallback to status text
          }
        }

        throw new ApiClientError(
          errorMessage,
          response.status,
          (errorDetails as any)?.code,
          errorDetails,
        );
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        // Don't retry client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Retry server errors (5xx) and network errors
        if (retries && retries > 0) {
          await this.sleep(this.config.retryDelay!);
          return this.makeRequest<T>(endpoint, {
            ...options,
            retries: retries - 1,
          });
        }
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiClientError("Request timeout", 408);
      }

      if (retries && retries > 0 && !(error instanceof ApiClientError)) {
        await this.sleep(this.config.retryDelay!);
        return this.makeRequest<T>(endpoint, {
          ...options,
          retries: retries - 1,
        });
      }

      throw error;
    }
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "GET",
      ...options,
    });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "DELETE",
      ...options,
    });
  }
}

// Default API client instance
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const apiClient = new ApiClient({
  baseUrl: API_BASE,
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
});

// Factory function for creating API clients with different configurations
export const createApiClient = (config: ApiClientConfig): IApiClient => {
  return new ApiClient(config);
};

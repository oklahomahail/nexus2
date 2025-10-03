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
  enableLogging?: boolean;
}

export interface RequestInterceptor {
  (config: {
    url: string;
    options: RequestInit;
  }):
    | { url: string; options: RequestInit }
    | Promise<{ url: string; options: RequestInit }>;
}

export interface ResponseInterceptor {
  (response: Response, data: unknown): unknown | Promise<unknown>;
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
  addRequestInterceptor(interceptor: RequestInterceptor): void;
  addResponseInterceptor(interceptor: ResponseInterceptor): void;
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
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      defaultHeaders: { "Content-Type": "application/json" },
      enableLogging: false,
      ...config,
    };
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    data?: unknown,
  ): void {
    if (this.config.enableLogging) {
      console[level](`[ApiClient] ${message}`, data);
    }
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
    let url = `${this.config.baseUrl}${endpoint}`;
    let finalOptions: RequestInit = {
      ...requestOptions,
      headers: this.getHeaders(
        requestOptions.headers as Record<string, string>,
      ),
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor({ url, options: finalOptions });
      url = result.url;
      finalOptions = result.options;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    this.log(
      "debug",
      `Making ${finalOptions.method || "GET"} request to ${url}`,
    );

    try {
      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal,
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

        this.log("error", `API error: ${errorMessage}`, {
          status: response.status,
          details: errorDetails,
        });
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

      const rawData = await response.json();

      // Handle different response patterns:
      // 1. Direct data responses (e.g., { clients: [...] })
      // 2. Wrapped responses (e.g., { success: true, data: { clients: [...] } })

      // Check if this looks like a wrapped response
      if (
        rawData &&
        typeof rawData === "object" &&
        "success" in rawData &&
        "data" in rawData
      ) {
        // Handle wrapped response format
        if (!rawData.success) {
          const errorMessage = rawData.message || "API request failed";
          throw new ApiClientError(
            errorMessage,
            response.status,
            rawData.code,
            rawData,
          );
        }
        return rawData.data as T;
      }

      // Apply response interceptors
      let processedData = rawData;
      for (const interceptor of this.responseInterceptors) {
        processedData = await interceptor(response, processedData);
      }

      this.log(
        "debug",
        `Request successful: ${response.status}`,
        processedData,
      );

      // Handle direct response format
      return processedData as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        // Don't retry client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          this.log("warn", `Client error (${error.status}): ${error.message}`);
          throw error;
        }

        // Retry server errors (5xx) and network errors
        if (retries && retries > 0) {
          this.log(
            "warn",
            `Retrying request (${retries} attempts left)`,
            error.message,
          );
          await this.sleep(this.config.retryDelay!);
          return this.makeRequest<T>(endpoint, {
            ...options,
            retries: retries - 1,
          });
        }
      }

      if (error instanceof Error && error.name === "AbortError") {
        this.log("error", "Request timeout");
        throw new ApiClientError("Request timeout", 408);
      }

      if (retries && retries > 0 && !(error instanceof ApiClientError)) {
        this.log(
          "warn",
          `Retrying request due to network error (${retries} attempts left)`,
          error,
        );
        await this.sleep(this.config.retryDelay!);
        return this.makeRequest<T>(endpoint, {
          ...options,
          retries: retries - 1,
        });
      }

      this.log("error", "Request failed", error);
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
  enableLogging: import.meta.env.DEV, // Enable logging in development
});

// Factory function for creating API clients with different configurations
export const createApiClient = (config: ApiClientConfig): IApiClient => {
  return new ApiClient(config);
};

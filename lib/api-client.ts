/**
 * Centralized API Client for Frontend-Backend Communication
 * Handles all HTTP requests with proper error handling, authentication, and logging
 */

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
}

interface ApiRequestConfig extends RequestInit {
  timeout?: number;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds

class APIClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = "/api/v1", timeout: number = DEFAULT_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Abort controller for request timeout
   */
  private createAbortController(timeout: number): AbortController {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  /**
   * Log API requests in development
   */
  private logRequest(method: string, endpoint: string, body?: any) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${method} ${endpoint}`, body || "");
    }
  }

  /**
   * Log API responses in development
   */
  private logResponse(method: string, endpoint: string, status: number, data: any) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ✓ ${method} ${endpoint} → ${status}`, data);
    }
  }

  /**
   * Log API errors in development
   */
  private logError(method: string, endpoint: string, error: any) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[API] ✗ ${method} ${endpoint}`, error);
    }
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const method = (config.method || "GET").toUpperCase();
    const url = `${this.baseUrl}${endpoint}`;

    this.logRequest(method, endpoint, config.body);

    const controller = this.createAbortController(config.timeout || this.timeout);

    try {
      const response = await fetch(url, {
        ...config,
        method,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        this.logError(method, endpoint, {
          status: response.status,
          message: data.message || "Request failed",
        });

        return {
          success: false,
          message: data.message || `HTTP ${response.status}`,
          error: data.error || data.message,
        };
      }

      this.logResponse(method, endpoint, response.status, data);
      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        this.logError(method, endpoint, "Request timeout");
        return {
          success: false,
          message: "Request timeout. Please try again.",
          error: "TIMEOUT",
        };
      }

      this.logError(method, endpoint, error);
      return {
        success: false,
        message: error.message || "Network error",
        error: error.message,
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Type-safe API endpoints
export const ApiEndpoints = {
  // User
  INIT_USER: "/init-user",
  SEND_MAIL: "/send-mail",

  // Departments
  DEPARTMENTS: "/departments",
  DEPARTMENTS_BY_NAME: (name: string) => `/departments/name?name=${encodeURIComponent(name)}`,

  // Employees
  EMPLOYEES: "/employees",

  // Tasks
  TASKS: "/tasks",
  TASK_DETAIL: (id: string) => `/tasks?id=${id}`,
  TASK_UPDATE: "/tasks/update",
  TASK_NOTIFY: "/tasks/notify",

  // Feedback
  FEEDBACK: "/feedback",
} as const;

export type { ApiResponse };

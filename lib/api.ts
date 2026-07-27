/**
 * API client for Stellar Wallet Backend
 * Uses native fetch API for HTTP requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

// LocalStorage key for the JWT access token.
const TOKEN_STORAGE_KEY = 'puddl3_access_token';

/** Read the stored JWT (browser only). */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

/** Persist or clear the JWT (browser only). */
export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Attach the JWT bearer token when present.
    const token = getStoredToken();
    const authHeaders: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // ngrok free tier interposes a browser warning page unless this is set.
        'ngrok-skip-browser-warning': 'true',
        ...authHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail ?? errorData.error;
        let message: string;
        if (Array.isArray(detail)) {
          // FastAPI 422 validation errors: [{loc, msg, type}, ...]
          message = detail
            .map((d: { loc?: unknown[]; msg?: string }) => {
              const field = Array.isArray(d.loc) ? String(d.loc[d.loc.length - 1]) : '';
              return field ? `${field}: ${d.msg}` : d.msg ?? 'Invalid value';
            })
            .join(' · ');
        } else if (typeof detail === 'string') {
          message = detail;
        } else {
          message = `HTTP error! status: ${response.status}`;
        }
        throw new Error(message);
      }

      // 204 No Content (and other empty bodies) have nothing to parse.
      if (response.status === 204) {
        return undefined as T;
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // -------------------------------------------------------------------- //
  // Auth
  // -------------------------------------------------------------------- //

  /**
   * Register a new company (employer + first admin employee + user).
   */
  async registerEmployer(
    request: import('@/lib/types').RegisterEmployerRequest
  ): Promise<import('@/lib/types').MeResponse> {
    return this.request<import('@/lib/types').MeResponse>(
      `${API_VERSION}/auth/register-employer`,
      { method: 'POST', body: JSON.stringify(request) }
    );
  }

  /**
   * Login with email + password. Returns a JWT access token.
   */
  async login(
    request: import('@/lib/types').LoginRequest
  ): Promise<import('@/lib/types').TokenResponse> {
    return this.request<import('@/lib/types').TokenResponse>(
      `${API_VERSION}/auth/login`,
      { method: 'POST', body: JSON.stringify(request) }
    );
  }

  /**
   * Get the current authenticated user, employee, employer and roles.
   */
  async getMe(): Promise<import('@/lib/types').MeResponse> {
    return this.request<import('@/lib/types').MeResponse>(`${API_VERSION}/auth/me`);
  }

  // -------------------------------------------------------------------- //
  // Employees
  // -------------------------------------------------------------------- //

  async listEmployees(): Promise<import('@/lib/types').Employee[]> {
    return this.request<import('@/lib/types').Employee[]>(`${API_VERSION}/employees`);
  }

  async getEmployee(id: number): Promise<import('@/lib/types').Employee> {
    return this.request<import('@/lib/types').Employee>(`${API_VERSION}/employees/${id}`);
  }

  async createEmployee(
    request: import('@/lib/types').EmployeeCreateRequest
  ): Promise<import('@/lib/types').Employee> {
    return this.request<import('@/lib/types').Employee>(`${API_VERSION}/employees`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateEmployee(
    id: number,
    request: import('@/lib/types').EmployeeUpdateRequest
  ): Promise<import('@/lib/types').Employee> {
    return this.request<import('@/lib/types').Employee>(`${API_VERSION}/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  async deleteEmployee(id: number): Promise<void> {
    return this.request<void>(`${API_VERSION}/employees/${id}`, { method: 'DELETE' });
  }

  // -------------------------------------------------------------------- //
  // Roles
  // -------------------------------------------------------------------- //

  async listRoles(): Promise<import('@/lib/types').Role[]> {
    return this.request<import('@/lib/types').Role[]>(`${API_VERSION}/roles`);
  }

  async listEmployeeRoles(employeeId: number): Promise<import('@/lib/types').Role[]> {
    return this.request<import('@/lib/types').Role[]>(
      `${API_VERSION}/employees/${employeeId}/roles`
    );
  }

  async assignRole(
    employeeId: number,
    roleId: number
  ): Promise<import('@/lib/types').Role[]> {
    return this.request<import('@/lib/types').Role[]>(
      `${API_VERSION}/employees/${employeeId}/roles`,
      { method: 'POST', body: JSON.stringify({ role_id: roleId }) }
    );
  }

  async removeRole(
    employeeId: number,
    roleId: number
  ): Promise<import('@/lib/types').Role[]> {
    return this.request<import('@/lib/types').Role[]>(
      `${API_VERSION}/employees/${employeeId}/roles/${roleId}`,
      { method: 'DELETE' }
    );
  }

  // -------------------------------------------------------------------- //
  // Employer-owned stored wallets
  // -------------------------------------------------------------------- //

  /** List wallets saved under the current user's employer. */
  async listStoredWallets(): Promise<import('@/lib/types').StoredWallet[]> {
    return this.request<import('@/lib/types').StoredWallet[]>(`${API_VERSION}/wallets`);
  }

  /** Read the on-chain USDC balance of the employer's primary wallet. */
  async getWalletBalance(): Promise<import('@/lib/types').WalletBalance> {
    return this.request<import('@/lib/types').WalletBalance>(
      `${API_VERSION}/wallets/balance`
    );
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    return this.request('/health');
  }

  // -------------------------------------------------------------------- //
  // Payroll
  // -------------------------------------------------------------------- //

  async listPayroll(): Promise<import('@/lib/types').PayrollEmployee[]> {
    return this.request<import('@/lib/types').PayrollEmployee[]>(`${API_VERSION}/payroll`);
  }

  async getPayrollPayments(
    employeeId: number
  ): Promise<import('@/lib/types').PayrollPayment[]> {
    return this.request<import('@/lib/types').PayrollPayment[]>(
      `${API_VERSION}/payroll/${employeeId}/payments`
    );
  }

  async startDrip(
    employeeId: number,
    intervalSeconds?: number
  ): Promise<import('@/lib/types').PayrollEmployee> {
    return this.request<import('@/lib/types').PayrollEmployee>(
      `${API_VERSION}/payroll/${employeeId}/start`,
      {
        method: 'POST',
        body: JSON.stringify(
          intervalSeconds ? { interval_seconds: intervalSeconds } : {}
        ),
      }
    );
  }

  async pauseDrip(
    employeeId: number
  ): Promise<import('@/lib/types').PayrollEmployee> {
    return this.request<import('@/lib/types').PayrollEmployee>(
      `${API_VERSION}/payroll/${employeeId}/pause`,
      { method: 'POST' }
    );
  }

  /**
   * Send one-time instant payment
   */
  async sendPayment(request: import('@/lib/types').OneTimePaymentRequest): Promise<import('@/lib/types').OneTimePaymentResponse> {
    return this.request<import('@/lib/types').OneTimePaymentResponse>(
      `${API_VERSION}/payment/send`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Start incremental payment job
   */
  async startPayment(request: import('@/lib/types').PaymentRequest): Promise<import('@/lib/types').PaymentJobResponse> {
    return this.request<import('@/lib/types').PaymentJobResponse>(
      `${API_VERSION}/payment/start`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Get payment job status
   */
  async getPaymentStatus(jobId: string): Promise<import('@/lib/types').PaymentJobStatus> {
    return this.request<import('@/lib/types').PaymentJobStatus>(
      `${API_VERSION}/payment/status/${jobId}`
    );
  }

  /**
   * Cancel payment job
   */
  async cancelPayment(jobId: string): Promise<{ success: boolean; message: string; job_id: string }> {
    return this.request<{ success: boolean; message: string; job_id: string }>(
      `${API_VERSION}/payment/cancel/${jobId}`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Get current network configuration
   */
  async getNetwork(): Promise<import('@/lib/types').NetworkResponse> {
    return this.request<import('@/lib/types').NetworkResponse>(
      `${API_VERSION}/settings/network`
    );
  }

  /**
   * Switch Stellar network
   */
  async setNetwork(request: import('@/lib/types').NetworkRequest): Promise<import('@/lib/types').NetworkResponse> {
    return this.request<import('@/lib/types').NetworkResponse>(
      `${API_VERSION}/settings/network`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;

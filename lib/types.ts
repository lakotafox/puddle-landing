/**
 * Shared TypeScript types and interfaces
 */

// Payment Types
// Source wallet is the logged-in user's company wallet (resolved server-side),
// so it is not part of the request.
export interface PaymentRequest {
  destination_address: string;
  asset_type: 'XLM' | 'USDC';
  total_amount: number;
  duration_value: number;
  duration_unit: 'minutes' | 'hours';
  increment_value: number;
  increment_unit: 'seconds' | 'minutes';
}

export interface PaymentSchedule {
  total_amount: number;
  num_payments: number;
  amount_per_payment: number;
  interval_seconds: number;
  total_duration_seconds: number;
}

export interface PaymentTransaction {
  payment_number: number;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  timestamp?: string;
  transaction_hash?: string;
  error?: string;
}

export interface PaymentJobStatus {
  job_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  schedule: PaymentSchedule;
  completed_payments: number;
  failed_payments: number;
  transactions: PaymentTransaction[];
  started_at?: string;
  completed_at?: string;
  error?: string;
}

export interface PaymentJobResponse {
  success: boolean;
  job_id: string;
  message: string;
  schedule: PaymentSchedule;
}

export type PaymentFormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'tracking'; jobId: string }
  | { status: 'success'; data: OneTimePaymentResponse }
  | { status: 'error'; error: string };

// One-time Payment Types
export interface OneTimePaymentRequest {
  destination_address: string;
  asset_type: 'XLM' | 'USDC';
  amount: number;
}

export interface OneTimePaymentResponse {
  success: boolean;
  message: string;
  transaction_hash: string;
  amount: number;
  asset_type: string;
}

// Network Settings Types
export interface NetworkResponse {
  network: string;
  horizon_url: string;
  usdc_issuer: string;
}

export interface NetworkRequest {
  network: string;
}

// ---------------------------------------------------------------------------
// Auth / Payroll Types
// ---------------------------------------------------------------------------
export type EmployeeStatus = 'active' | 'inactive' | 'terminated' | 'on_leave';
export type PayType = 'salary' | 'hourly';

export interface Role {
  id: number;
  name: string;
}

export interface Employer {
  id: number;
  company_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  employer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  hire_date: string | null;
  status: EmployeeStatus;
  roles: Role[];
  wallet_address: string | null;
  pay_type: PayType | null;
  pay_rate: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAccount {
  id: number;
  employee_id: number;
  email: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterEmployerRequest {
  company_name: string;
  company_email: string;
  company_phone?: string;
  company_address?: string;
  first_name: string;
  last_name: string;
  admin_email: string;
  admin_phone?: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface MeResponse {
  user: UserAccount;
  employee: Employee;
  employer: Employer;
  roles: string[];
}

export interface EmployeeCreateRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  hire_date?: string;
  status?: EmployeeStatus;
  password?: string;
  role_names?: string[];
  pay_type?: PayType;
  pay_rate?: number;
}

export interface EmployeeUpdateRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  hire_date?: string;
  status?: EmployeeStatus;
  pay_type?: PayType;
  pay_rate?: number;
}

// Payroll
export interface PayrollEmployee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  wallet_address: string | null;
  pay_type: PayType | null;
  pay_rate: string | null;
  annual_salary: string;
  hourly_rate: string;
  drip_active: boolean;
  drip_interval_seconds: number;
  drip_amount: string;
  drip_last_paid_at: string | null;
  total_paid: string;
  payment_count: number;
}

export interface PayrollPayment {
  id: number;
  amount: string;
  status: 'success' | 'failed';
  transaction_hash: string | null;
  error: string | null;
  created_at: string;
}

// Employer-owned stored Stellar wallets
export interface StoredWallet {
  id: number;
  employer_id: number;
  label: string | null;
  address: string;
  secret: string;
  created_at: string;
  updated_at: string;
}

export interface WalletBalance {
  address: string;
  usdc_balance: number;
  xlm_balance: number;
  has_trustline: boolean;
  usdc_issuer: string;
  network: string;
  label: string | null;
}

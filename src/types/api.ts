/**
 * TypeScript interfaces for API-related types
 * Supporting React integration for Swanage Traffic Alliance
 */

// SignUp Form API Types
export interface SubmitLeadRequest {
  first_name: string;
  last_name: string;
  email: string;
  postcode: string;
  comments: string;
}

export interface SubmitLeadResponse {
  success: boolean;
  submission_id?: string;
  error?: string;
  message?: string;
}

// Counter API Types
export interface CounterReadResponse {
  count: number;
  error?: string;
}

export interface CounterIncrementResponse {
  count: number;
  error?: string;
  incremented?: boolean;
}

export interface CounterApiProps {
  apiEndpoint: string;
  initialCount?: number;
}

// Generic API Hook Types
export interface UseApiCallOptions extends RequestInit {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseApiCallReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
  reset: () => void;
}

// HTTP Error Types
export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  response?: Response;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  status?: number;
}

// Request/Response Wrappers
export interface ApiRequest<T = any> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: T;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// Pagination Types (for future use)
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { UseApiCallReturn, UseApiCallOptions, ApiError } from '../types';

/**
 * Custom hook for making API calls with loading, error, and success states
 * Supports TypeScript generics for response typing
 */
export function useApiCall<T = any>(
  url: string,
  options: UseApiCallOptions = {}
): UseApiCallReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  // Reference to track if component is mounted
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    immediate = false,
    onSuccess,
    onError,
    ...requestOptions
  } = options;

  // Create API error with additional context
  const createApiError = useCallback((message: string, response?: Response): ApiError => {
    const error = new Error(message) as ApiError;
    if (response) {
      error.status = response.status;
      error.statusText = response.statusText;
      error.response = response;
    }
    return error;
  }, []);

  // Reset all states
  const reset = useCallback(() => {
    if (!isMountedRef.current) return;

    setData(null);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  // Perform the API call
  const performRequest = useCallback(async (requestUrl?: string, overrideOptions?: RequestInit) => {
    if (!isMountedRef.current) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const finalUrl = requestUrl || url;
    const finalOptions: RequestInit = {
      ...requestOptions,
      ...overrideOptions,
      signal: abortControllerRef.current.signal,
    };

    // Set default headers
    const headers = new Headers(finalOptions.headers);
    if (!headers.has('Content-Type') && finalOptions.method !== 'GET') {
      headers.set('Content-Type', 'application/json');
    }
    finalOptions.headers = headers;

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setIsError(false);

    try {
      const response = await fetch(finalUrl, finalOptions);

      if (!isMountedRef.current) return;

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        // Try to get error message from response body
        try {
          const errorBody = await response.json();
          if (errorBody.error) {
            errorMessage = errorBody.error;
          } else if (errorBody.message) {
            errorMessage = errorBody.message;
          }
        } catch {
          // If response body is not JSON, use default message
        }

        throw createApiError(errorMessage, response);
      }

      let responseData: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = (await response.text()) as any;
      }

      if (!isMountedRef.current) return;

      setData(responseData);
      setIsSuccess(true);
      
      if (onSuccess) {
        onSuccess(responseData);
      }

    } catch (err) {
      if (!isMountedRef.current) return;

      // Don't set error state if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const apiError = err instanceof Error ? err : createApiError('An unknown error occurred');
      
      setError(apiError);
      setIsError(true);
      
      if (onError) {
        onError(apiError);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [url, requestOptions, onSuccess, onError, createApiError]);

  // Public refetch function
  const refetch = useCallback(() => performRequest(), [performRequest]);

  // Effect for immediate requests
  useEffect(() => {
    if (immediate && url) {
      performRequest();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, performRequest, url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    refetch,
    reset,
  };
}

/**
 * Helper hook specifically for POST requests (useful for form submissions)
 */
export function usePostApi<TRequest = any, TResponse = any>(
  url: string,
  options: UseApiCallOptions = {}
) {
  const apiCall = useApiCall<TResponse>(url, {
    ...options,
    method: 'POST',
  });

  const postData = useCallback(async (data: TRequest) => {
    return apiCall.refetch();
  }, [apiCall]);

  return {
    ...apiCall,
    postData,
  };
}

/**
 * Helper hook for GET requests with caching support
 */
export function useGetApi<T = any>(
  url: string,
  options: UseApiCallOptions = {}
) {
  return useApiCall<T>(url, {
    ...options,
    method: 'GET',
    immediate: true,
  });
}

/**
 * Helper functions for common API patterns
 */
export const ApiHelpers = {
  /**
   * Create request options for JSON POST
   */
  jsonPost: (data: any): RequestInit => ({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }),

  /**
   * Create request options with cache busting
   */
  withCacheBust: (options: RequestInit = {}): RequestInit => ({
    ...options,
    headers: {
      ...options.headers,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  }),

  /**
   * Add timestamp to URL for cache busting
   */
  addTimestamp: (url: string): string => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  },

  /**
   * Check if error is a network error
   */
  isNetworkError: (error: Error): boolean => {
    return error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.name === 'TypeError';
  },

  /**
   * Check if error is an HTTP error
   */
  isHttpError: (error: Error): error is ApiError => {
    return 'status' in error;
  },
};
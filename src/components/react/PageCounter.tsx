import React, { useState, useEffect, useCallback } from "react";
import type { BaseComponentProps } from "../../types";

export interface PageCounterProps extends BaseComponentProps {
  initialCount?: number;
  apiEndpoint?: string;
  label?: string;
  incrementOnMount?: boolean;
  onCountUpdate?: (newCount: number) => void;
  onError?: (error: string) => void;
}

interface CounterResponse {
  success: boolean;
  count: number;
  error?: string;
}

export function PageCounter({
  initialCount = 0,
  apiEndpoint = "/api/counter",
  label = " SITE VIEWS",
  incrementOnMount = true,
  onCountUpdate,
  onError,
  className = "",
  ...props
}: PageCounterProps) {
  const [count, setCount] = useState<number>(initialCount);
  const [error, setError] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);

  // Format count with thousand separators
  const formatCount = useCallback((num: number): string => {
    return new Intl.NumberFormat("en-GB").format(num);
  }, []);

  // Fetch current count from server
  const fetchCount = useCallback(async (): Promise<number | null> => {
    try {
      const response = await fetch(
        `${apiEndpoint}?action=read&t=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data: CounterResponse = await response.json();
        return data.count || 0;
      } else {
        console.error("Failed to fetch counter:", response.status);
        return null;
      }
    } catch (err) {
      console.error("Error fetching counter:", err);
      return null;
    }
  }, [apiEndpoint]);

  // Increment counter on server
  const incrementCount = useCallback(async (): Promise<number | null> => {
    try {
      console.log("📡 Sending increment request...");

      const response = await fetch(
        `${apiEndpoint}?action=increment&t=${Date.now()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );

      if (response.ok) {
        const data: CounterResponse = await response.json();
        return data.count || null;
      } else {
        console.error("Failed to increment counter:", response.status);
        return null;
      }
    } catch (err) {
      console.error("Failed to increment counter:", err);
      return null;
    }
  }, [apiEndpoint]);

  // Update count with animation
  const updateCount = useCallback(
    (newCount: number) => {
      setCount(newCount);
      setIsUpdated(true);

      if (onCountUpdate) {
        onCountUpdate(newCount);
      }

      // Remove animation class after animation completes
      setTimeout(() => {
        setIsUpdated(false);
      }, 600);
    },
    [onCountUpdate]
  );

  // Handle errors
  const handleError = useCallback(
    (errorMessage: string) => {
      console.error("PageCounter error:", errorMessage);
      setError(true);

      if (onError) {
        onError(errorMessage);
      }
    },
    [onError]
  );

  // Effect to handle initial load and increment
  useEffect(() => {
    let mounted = true;

    const initializeCounter = async () => {
      // If we have an initial count, use it, otherwise fetch from server
      if (initialCount === 0) {
        const fetchedCount = await fetchCount();
        if (mounted) {
          if (fetchedCount !== null) {
            setCount(fetchedCount);
            setError(false);
          } else {
            handleError("Failed to fetch initial count");
          }
        }
      }

      // Increment counter if requested (simulates user visit)
      if (incrementOnMount && mounted) {
        const newCount = await incrementCount();
        if (newCount !== null) {
          updateCount(newCount);
          setError(false);
        } else if (error === false) {
          // Only show error if we weren't already in error state
          handleError("Failed to increment counter");
        }
      }
    };

    initializeCounter();

    return () => {
      mounted = false;
    };
  }, [
    initialCount,
    incrementOnMount,
    fetchCount,
    incrementCount,
    updateCount,
    handleError,
    error,
  ]);

  return (
    <div
      className={`counter-block ${className}`}
      data-api-url={apiEndpoint}
      {...props}
    >
      <div className="counter-content">
        <span
          className={`counter-number ${isUpdated ? "counter-updated" : ""}`}
          data-count={count}
        >
          {error ? "---" : formatCount(count)}
        </span>
        <span className="counter-label">{label}</span>
      </div>
      {error && (
        <span className="counter-error" aria-hidden="true">
          !
        </span>
      )}
    </div>
  );
}

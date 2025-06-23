import React, { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Create a timer to set the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay ?? 500);

    // Clean up the timer on component unmount or when the value changes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay ?? 500]);

  return debouncedValue;
}

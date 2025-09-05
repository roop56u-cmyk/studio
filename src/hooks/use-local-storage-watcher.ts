
"use client";

import { useEffect, useRef } from 'react';

const POLLING_INTERVAL = 3000; // Check for changes every 3 seconds

export function useLocalStorageWatcher<T>(key: string, setter: (value: T) => void) {
  const previousValueRef = useRef<string | null>(null);

  useEffect(() => {
    // Set the initial value
    try {
        const storedValue = localStorage.getItem(key);
        previousValueRef.current = storedValue;
    } catch(e) {
        console.error(`useLocalStorageWatcher: Failed to read initial value for key "${key}"`, e);
    }

    const intervalId = setInterval(() => {
      try {
        const currentValue = localStorage.getItem(key);
        if (currentValue !== previousValueRef.current) {
          if (currentValue === null) {
            // Handle item removal if needed, for now we assume it won't be null
            console.warn(`useLocalStorageWatcher: Watched key "${key}" was removed from localStorage.`);
          } else {
            const parsedValue = JSON.parse(currentValue);
            setter(parsedValue);
          }
          previousValueRef.current = currentValue;
        }
      } catch (error) {
        console.error(`useLocalStorageWatcher: Error polling key "${key}" from localStorage`, error);
      }
    }, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [key, setter]);
}

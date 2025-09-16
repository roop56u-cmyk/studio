
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
      let currentValue: string | null = null;
      try {
        currentValue = localStorage.getItem(key);
        if (currentValue !== previousValueRef.current) {
          if (currentValue === null) {
            console.warn(`useLocalStorageWatcher: Watched key "${key}" was removed from localStorage.`);
          } else {
            // Check if the value is likely a JSON object/array or a simple string.
            // Simple strings like timestamps should not be parsed.
            if (currentValue.startsWith('{') || currentValue.startsWith('[')) {
              const parsedValue = JSON.parse(currentValue);
              setter(parsedValue);
            } else {
              // It's likely a simple string, remove quotes if they exist and pass it on.
              // For "2025-09-16T..." it will be passed as is.
              // For ""a string"" it becomes "a string".
              // This is a bit of a workaround for inconsistent storage formats.
              if (currentValue.startsWith('"') && currentValue.endsWith('"')) {
                setter(JSON.parse(currentValue));
              } else {
                setter(currentValue as unknown as T);
              }
            }
          }
          previousValueRef.current = currentValue;
        }
      } catch (error) {
        // This catch is a fallback. The logic above should prevent most parsing errors.
        console.error(`useLocalStorageWatcher: Error processing key "${key}" from localStorage. Value was:`, currentValue, error);
      }
    }, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [key, setter]);
}

// src/hooks/useCountdown.ts
import { useState, useEffect } from 'react';

export const useCountdown = (initialCount = 0) => {
  const [countdown, setCountdown] = useState(initialCount);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const start = (seconds: number) => setCountdown(seconds);

  return { countdown, start };
};
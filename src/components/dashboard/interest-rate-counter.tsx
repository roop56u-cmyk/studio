"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp, Timer } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function InterestRateCounter() {
  const [rate, setRate] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    const RATE_KEY = "interestRate";
    const EXPIRATION_KEY = "rateExpiration";

    const getStoredData = () => {
      const storedRate = localStorage.getItem(RATE_KEY);
      const storedExpiration = localStorage.getItem(EXPIRATION_KEY);
      return { storedRate, storedExpiration };
    };

    const setStoredData = (newRate: string, newExpiration: number) => {
      localStorage.setItem(RATE_KEY, newRate);
      localStorage.setItem(EXPIRATION_KEY, newExpiration.toString());
    };

    const intervalId = setInterval(() => {
      const { storedRate, storedExpiration } = getStoredData();
      const now = new Date().getTime();
      let expiration = storedExpiration ? parseInt(storedExpiration, 10) : 0;

      if (!storedRate || now > expiration) {
        const newRate = (Math.random() * 3 + 0.5).toFixed(4);
        const newExpiration = now + 24 * 60 * 60 * 1000;
        setRate(newRate);
        setStoredData(newRate, newExpiration);
        expiration = newExpiration;
      } else if (rate === null) {
        setRate(storedRate);
      }

      const distance = expiration - now;

      if (distance < 0) {
        setCountdown("00:00:00");
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setCountdown(formattedCountdown);

    }, 1000);

    return () => clearInterval(intervalId);
  }, [rate]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
            24h Interest Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Based on platform activity</CardDescription>
      </CardHeader>
      <CardContent>
        {rate !== null ? (
            <div className="text-2xl font-bold">{rate}%</div>
        ) : (
            <Skeleton className="h-8 w-24" />
        )}
        <div className="flex items-center pt-2">
            <Timer className="mr-2 h-4 w-4 text-muted-foreground" />
            {countdown !== null ? (
                <p className="text-xs text-muted-foreground">
                    Next update in: {countdown}
                </p>
            ) : (
                 <Skeleton className="h-4 w-32" />
            )}
        </div>
      </CardContent>
    </Card>
  );
}

    
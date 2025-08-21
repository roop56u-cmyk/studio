"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function InterestRateCounter() {
  const [rate, setRate] = useState<string | null>(null);

  useEffect(() => {
    // Function to generate a new random rate
    const generateRate = () => {
      // Simulate a fluctuating interest rate, e.g., between 0.5% and 3.5%
      const newRate = (Math.random() * 3 + 0.5).toFixed(4);
      setRate(newRate);
    };

    // Set the initial rate
    generateRate();

    // Update the rate every 5 seconds
    const intervalId = setInterval(generateRate, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          24h Interest Rate
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {rate !== null ? (
            <div className="text-2xl font-bold">{rate}%</div>
        ) : (
            <Skeleton className="h-8 w-24" />
        )}
        <p className="text-xs text-muted-foreground">
          Based on platform activity
        </p>
      </CardContent>
    </Card>
  );
}

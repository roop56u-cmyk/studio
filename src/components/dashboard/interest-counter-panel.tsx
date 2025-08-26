

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Zap, Lock, Percent } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import type { CounterType } from "@/contexts/WalletContext";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

interface InterestCounterPanelProps {
  title: string;
  isLocked?: boolean;
  balance: number;
  counterType: CounterType;
  accentColor?: string;
}

const DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function InterestCounterPanel({
  title,
  isLocked = false,
  balance,
  counterType,
  accentColor = "bg-primary",
}: InterestCounterPanelProps) {
  const {
    currentRate,
    startCounter,
    claimAndRestartCounter,
    interestCounter,
    isLoading,
  } = useWallet();
  
  const counter = interestCounter; // Only using interest counter now
  const { isRunning, startTime } = counter;

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!isRunning || !startTime) {
      setTimeLeft(null);
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = DURATION_MS - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(intervalId);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, startTime]);

  const dailyRate = currentRate / 100; // This is now a daily rate
  const dailyEarningPotential = balance * dailyRate;
  
  const accruedInterest = (() => {
    if (!isRunning || !startTime || timeLeft === null) return 0;
    const elapsed = DURATION_MS - timeLeft;
    return (elapsed / DURATION_MS) * dailyEarningPotential;
  })();

  const formatTime = (ms: number | null) => {
    if (ms === null) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const handleStart = () => {
    startCounter(counterType);
  };

  const handleClaim = () => {
    claimAndRestartCounter(counterType);
  };

  if (isLocked) {
    return (
        <Card className="h-full relative overflow-hidden flex flex-col justify-between">
             <div className={cn("absolute top-0 left-0 h-1 w-full", accentColor)} />
            <CardHeader className="p-3">
                <div className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium">{title}</CardTitle>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center pt-0 p-3">
                <div className="text-lg font-bold">-.--%</div>
                <p className="text-xs text-muted-foreground pt-1">
                    Unlock by committing at least $100.
                </p>
            </CardContent>
        </Card>
    )
  }
  
  const isClaimable = timeLeft !== null && timeLeft <= 0;

  return (
    <Card className="relative overflow-hidden flex flex-col">
      <div className={cn("absolute top-0 left-0 h-1 w-full", accentColor)} />
      <CardHeader className="p-3">
        <div className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription className="text-xs">Current Daily Rate: {currentRate.toFixed(2)}%</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 flex-grow p-3">
        <div className="text-center bg-muted p-1 rounded-md">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
                <Timer className="h-3 w-3" />
                <span>Time Remaining</span>
            </div>
            <div className="text-base font-bold font-mono tracking-tight">
                {isRunning ? formatTime(timeLeft) : "24:00:00"}
            </div>
        </div>
        
        <div className="text-center">
            <p className="text-xs text-muted-foreground">Accrued Interest</p>
            <p className="text-sm font-semibold text-primary">
                {accruedInterest.toFixed(6)} USDT
            </p>
        </div>
      </CardContent>
       <CardFooter className="p-3">
          {!isRunning ? (
            <Button size="sm" onClick={handleStart} className="h-7 text-xs w-full" disabled={isLoading}>
                <Zap className="mr-1 h-4 w-4" /> Start Earning
            </Button>
            ) : (
            <Button
                size="sm"
                onClick={handleClaim}
                disabled={!isClaimable || isLoading}
                className="h-7 text-xs w-full"
            >
                {isClaimable ? "Claim & Finish" : "Earning..."}
            </Button>
            )}
       </CardFooter>
    </Card>
  );
}

    
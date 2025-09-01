
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
import { levels } from "./level-tiers";

interface InterestCounterPanelProps {
  title: string;
  isLocked?: boolean;
  balance: number;
  counterType: CounterType;
  accentColor?: string;
  gradientClass?: string;
}

const DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function InterestCounterPanel({
  title,
  isLocked = false,
  balance,
  counterType,
  accentColor = "bg-primary",
  gradientClass = "",
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

  const minBalanceForLevel1 = levels.find(l => l.level === 1)?.minAmount ?? 100;
  const canStart = !isLoading && balance >= minBalanceForLevel1 && !isRunning;

  if (isLocked) {
    return (
        <Card className={cn("h-full relative overflow-hidden flex flex-col justify-between text-white", gradientClass)}>
             <div className={cn("absolute top-0 left-0 h-1 w-full bg-gradient-to-r", accentColor)} />
            <CardHeader className="p-3">
                <div className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium">{title}</CardTitle>
                    <Lock className="h-3 w-3 text-white/80" />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center pt-0 p-3">
                <div className="text-lg font-bold">-.--%</div>
                <p className="text-xs text-white/80 pt-1">
                    Unlock by committing at least ${minBalanceForLevel1}.
                </p>
            </CardContent>
        </Card>
    )
  }
  
  const isClaimable = timeLeft !== null && timeLeft <= 0;

  return (
    <Card className={cn("relative overflow-hidden flex flex-col", gradientClass, gradientClass ? "text-white" : "")}>
      <div className={cn("absolute top-0 left-0 h-1 w-full bg-gradient-to-r", accentColor)} />
      <CardHeader className="p-3">
        <div className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Percent className={cn("h-4 w-4", gradientClass ? "text-white/80" : "text-muted-foreground")} />
        </div>
        <CardDescription className={cn("text-xs", gradientClass ? "text-white/80" : "")}>Current Daily Rate: {currentRate.toFixed(2)}%</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 flex-grow p-3">
        <div className={cn("text-center p-1 rounded-md", gradientClass ? "bg-black/10" : "bg-muted")}>
            <div className={cn("flex items-center justify-center gap-1.5 text-xs", gradientClass ? "text-white/80" : "text-muted-foreground")}>
                <Timer className="h-3 w-3" />
                <span>Time Remaining</span>
            </div>
            <div className="text-base font-bold font-mono tracking-tight">
                {isRunning ? formatTime(timeLeft) : "24:00:00"}
            </div>
        </div>
        
        <div className="text-center">
            <p className={cn("text-xs", gradientClass ? "text-white/80" : "text-muted-foreground")}>Accrued Interest</p>
            <p className="text-sm font-semibold text-primary">
                {accruedInterest.toFixed(6)} USDT
            </p>
        </div>
      </CardContent>
       <CardFooter className="p-3">
          {!isRunning ? (
            <Button size="sm" onClick={handleStart} className="h-7 text-xs w-full" disabled={!canStart}>
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

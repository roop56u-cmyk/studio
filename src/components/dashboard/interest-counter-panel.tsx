

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  gradientClass?: string;
}

const DURATION_MS_24H = 24 * 60 * 60 * 1000; // 24 hours

// Helper to parse duration string like "12h" or "10d" into hours
const parseDuration = (durationStr: string): number => {
    const value = parseInt(durationStr.slice(0, -1));
    const unit = durationStr.slice(-1).toLowerCase();
    if (isNaN(value)) return 0;
    if (unit === 'd') return value * 24;
    if (unit === 'h') return value;
    return 0;
};


export function InterestCounterPanel({
  title,
  isLocked = false,
  balance,
  counterType,
  gradientClass = "",
}: InterestCounterPanelProps) {
  const {
    currentRate,
    startCounter,
    claimAndRestartCounter,
    interestCounter,
    isLoading,
    interestEarningModel,
    fixedTermDurations,
  } = useWallet();
  
  const [isDurationDialogOpen, setIsDurationDialogOpen] = useState(false);
  const counter = interestCounter;
  const { isRunning, startTime, durationHours } = counter;

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const totalDuration = (durationHours || 24) * 60 * 60 * 1000;

  useEffect(() => {
    if (!isRunning || !startTime) {
      setTimeLeft(null);
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = totalDuration - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(intervalId);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, startTime, totalDuration]);

  const dailyRate = currentRate / 100;
  
  const accruedInterest = useMemo(() => {
    if (!isRunning || !startTime || timeLeft === null) return 0;
    const elapsed = totalDuration - timeLeft;
    const elapsedDays = elapsed / DURATION_MS_24H;
    return balance * dailyRate * elapsedDays;
  }, [isRunning, startTime, timeLeft, totalDuration, balance, dailyRate]);

  const formatTime = (ms: number | null) => {
    if (ms === null || ms < 0) return "00:00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(days).padStart(2, "0")}:${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleStartClick = () => {
    if (interestEarningModel === 'fixed') {
        setIsDurationDialogOpen(true);
    } else {
        startCounter(counterType); // Flexible mode
    }
  };

  const handleDurationSelect = (hours: number) => {
    startCounter(counterType, hours);
    setIsDurationDialogOpen(false);
  }

  const handleClaim = () => {
    claimAndRestartCounter(counterType);
  };

  const minBalanceForLevel1 = levels.find(l => l.level === 1)?.minAmount ?? 100;
  const canStart = !isLoading && balance >= minBalanceForLevel1 && !isRunning;

  if (isLocked) {
    return (
        <Card className={cn("h-full relative overflow-hidden flex flex-col justify-between", gradientClass, gradientClass && "text-white")}>
             <div className={cn("absolute top-0 left-0 h-1 w-full", gradientClass ? "bg-white/30" : "bg-primary")} />
            <CardHeader className="p-3">
                <div className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium">{title}</CardTitle>
                    <Lock className={cn("h-3 w-3", gradientClass ? "text-white/80" : "text-muted-foreground")} />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center pt-0 p-3">
                <div className="text-lg font-bold">-.--%</div>
                <p className={cn("text-xs pt-1", gradientClass ? "text-white/80" : "text-muted-foreground")}>
                    Unlock by committing at least ${minBalanceForLevel1}.
                </p>
            </CardContent>
        </Card>
    )
  }
  
  const isClaimable = timeLeft !== null && timeLeft <= 0;

  return (
    <>
    <Card className={cn("relative overflow-hidden flex flex-col", gradientClass, gradientClass && "text-white")}>
      <div className={cn("absolute top-0 left-0 h-1 w-full", gradientClass ? "bg-white/30" : "bg-primary")} />
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
                {isRunning ? formatTime(timeLeft) : formatTime(totalDuration)}
            </div>
        </div>
        
        <div className="text-center">
            <p className={cn("text-xs", gradientClass ? "text-white/80" : "text-muted-foreground")}>Accrued Interest</p>
            <p className={cn("text-sm font-semibold", gradientClass ? "text-white" : "text-primary")}>
                {accruedInterest.toFixed(6)} USDT
            </p>
        </div>
      </CardContent>
       <CardFooter className="p-3">
          {!isRunning ? (
            <Button size="sm" onClick={handleStartClick} className="h-7 text-xs w-full" disabled={!canStart}>
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

    <Dialog open={isDurationDialogOpen} onOpenChange={setIsDurationDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Select Lock-in Duration</DialogTitle>
                <DialogDescription>
                    Choose how long you want to lock your funds for to earn interest. Your funds will be locked for the entire period.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="grid grid-cols-2 gap-2 sm:justify-start">
                 {fixedTermDurations.split(',').map(dayStr => {
                     const durationHours = parseDuration(dayStr.trim());
                     if (durationHours <= 0) return null;
                     return (
                        <Button key={dayStr} onClick={() => handleDurationSelect(durationHours)}>
                           {dayStr.trim()}
                        </Button>
                     )
                 })}
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}

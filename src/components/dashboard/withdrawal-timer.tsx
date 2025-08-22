
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Timer } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

interface WithdrawalTimerProps {
  waitDays: number;
}

export function WithdrawalTimer({ waitDays }: WithdrawalTimerProps) {
  const { getInitialState } = useWallet();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const [restrictionStartDate, setRestrictionStartDate] = useState<string | null>(null);

  useEffect(() => {
    // We fetch the start date from localStorage.
    const startDate = getInitialState('restrictionStartDate', null);
    setRestrictionStartDate(startDate);
  }, [getInitialState]);


  useEffect(() => {
    if (!restrictionStartDate) {
      return;
    }

    const restrictionEndTime = new Date(restrictionStartDate).getTime() + (waitDays * 24 * 60 * 60 * 1000);

    const interval = setInterval(() => {
      const now = Date.now();
      const distance = restrictionEndTime - now;

      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [restrictionStartDate, waitDays]);

  const formatTime = (time: typeof timeLeft) => {
    if (!time) return "00:00:00:00";
    return `${String(time.days).padStart(2, "0")}:${String(
      time.hours
    ).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}:${String(
      time.seconds
    ).padStart(2, "0")}`;
  };

  return (
    <Card className="text-center border-0 shadow-none">
      <CardHeader className="p-0">
        <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
          <Timer className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {restrictionStartDate ? (
            <div>
                 <p className="text-sm text-muted-foreground">Time Remaining</p>
                <div className="text-3xl font-bold font-mono tracking-tighter mt-2">
                    {timeLeft ? formatTime(timeLeft) : "00:00:00:00"}
                </div>
                <p className="text-xs text-muted-foreground mt-2">DD:HH:MM:SS</p>
            </div>
        ) : (
            <p className="text-muted-foreground">Calculating remaining time...</p>
        )}
      </CardContent>
    </Card>
  );
}

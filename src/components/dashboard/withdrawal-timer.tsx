
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

interface WithdrawalTimerProps {
  firstDepositDate: string | null;
  waitDays: number;
}

export function WithdrawalTimer({ firstDepositDate, waitDays }: WithdrawalTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!firstDepositDate) {
      return;
    }

    const restrictionEndTime = new Date(firstDepositDate).getTime() + (waitDays * 24 * 60 * 60 * 1000);

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
  }, [firstDepositDate, waitDays]);

  const formatTime = (time: typeof timeLeft) => {
    if (!time) return "00:00:00:00";
    return `${String(time.days).padStart(2, "0")}:${String(
      time.hours
    ).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}:${String(
      time.seconds
    ).padStart(2, "0")}`;
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
          <Timer className="h-8 w-8" />
        </div>
        <CardTitle className="mt-4">Withdrawals Locked</CardTitle>
        <CardDescription>
          For security, withdrawals are enabled {waitDays} days after your first deposit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {firstDepositDate ? (
            <div>
                 <p className="text-sm text-muted-foreground">Time Remaining</p>
                <div className="text-3xl font-bold font-mono tracking-tighter mt-2">
                    {timeLeft ? formatTime(timeLeft) : "00:00:00:00"}
                </div>
                <p className="text-xs text-muted-foreground mt-2">DD:HH:MM:SS</p>
            </div>
        ) : (
            <p className="text-muted-foreground">Make your first deposit to start the countdown.</p>
        )}
      </CardContent>
    </Card>
  );
}

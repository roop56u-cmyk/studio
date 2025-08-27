
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Timer } from "lucide-react";

interface WithdrawalTimerProps {
  waitDays: number;
  startDate: string;
  endDate?: string | null;
}

export function WithdrawalTimer({ waitDays, startDate, endDate }: WithdrawalTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const restrictionEndTime = endDate 
        ? new Date(endDate).getTime()
        : new Date(startDate).getTime() + (waitDays * 24 * 60 * 60 * 1000);

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
  }, [startDate, waitDays, endDate]);

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
        <div>
             <p className="text-sm text-muted-foreground">Time Remaining</p>
            <div className="text-3xl font-bold font-mono tracking-tighter mt-2">
                {timeLeft ? formatTime(timeLeft) : "00:00:00:00"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">DD:HH:MM:SS</p>
        </div>
      </CardContent>
    </Card>
  );
}

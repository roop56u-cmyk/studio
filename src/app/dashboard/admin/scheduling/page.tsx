
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";

type TimeFormat = "12h" | "24h";

const ClockDisplay = ({
  timeZone,
  format,
  offset,
}: {
  timeZone: string;
  format: TimeFormat;
  offset: number;
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getFormattedTime = () => {
    const adjustedTime = new Date(time.getTime() + offset);
    return adjustedTime.toLocaleTimeString("en-US", {
      timeZone: timeZone,
      hour12: format === "12h",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getFormattedDate = () => {
     const adjustedTime = new Date(time.getTime() + offset);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timeZone,
    }).format(adjustedTime);
  };
  
  return (
    <div className="text-center bg-muted/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold">{timeZone}</h3>
        <p className="text-4xl font-mono font-bold tracking-tight my-2">{getFormattedTime()}</p>
        <p className="text-sm text-muted-foreground">{getFormattedDate()}</p>
    </div>
  );
};


export default function SchedulingPage() {
  const { toast } = useToast();
  const [format, setFormat] = useState<TimeFormat>("12h");
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchTime = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://worldtimeapi.org/api/ip');
      if (!response.ok) throw new Error("Failed to fetch time");
      const data = await response.json();
      const serverTime = new Date(data.utc_datetime).getTime();
      const localTime = Date.now();
      setOffset(serverTime - localTime);
      toast({ title: "Time Synced", description: "Clocks have been synced with internet time."});
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Sync Failed", description: "Could not sync time. Please try again."});
    } finally {
        setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTime();
  }, [])


  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scheduling &amp; Time</h1>
        <p className="text-muted-foreground">
          View platform time zones and manage settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Zone Clocks</CardTitle>
          <CardDescription>
            Live clocks for key platform time zones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
                <Switch 
                    id="time-format" 
                    checked={format === "12h"}
                    onCheckedChange={(checked) => setFormat(checked ? "12h" : "24h")}
                />
                <Label htmlFor="time-format">Use AM/PM Format</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClockDisplay timeZone="UTC" format={format} offset={offset} />
                <ClockDisplay timeZone="Asia/Kolkata" format={format} offset={offset} />
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={fetchTime} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4" />}
                Sync with Internet Time
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

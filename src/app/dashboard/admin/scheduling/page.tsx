
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
import { Loader2, RefreshCw, Clock, Globe, Settings, Save, Timer } from "lucide-react";
import { getInternetTime } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type TimeFormat = "12h" | "24h";

const ClockDisplay = ({
  timeZone,
  format,
  baseTime,
}: {
  timeZone: string;
  format: TimeFormat;
  baseTime: Date;
}) => {

  const getFormattedTime = () => {
    return baseTime.toLocaleTimeString("en-US", {
      timeZone: timeZone,
      hour12: format === "12h",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getFormattedDate = () => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timeZone,
    }).format(baseTime);
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
  const [liveTime, setLiveTime] = useState(new Date());

  const [timeSource, setTimeSource] = useState<'live' | 'manual'>('live');
  const [manualDateTime, setManualDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [taskResetTime, setTaskResetTime] = useState("09:30"); // Default to 9:30

  const fetchTime = async () => {
    setIsLoading(true);
    try {
      const data = await getInternetTime();
      if (data) {
        setLiveTime(new Date(data.utc_datetime));
        toast({ title: "Time Synced", description: "Clocks have been synced with internet time."});
      } else {
         toast({ variant: "destructive", title: "Sync Failed", description: "Could not sync time. Please try again."});
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Sync Failed", description: "Could not sync time. Please try again."});
    } finally {
        setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const savedTimeSource = localStorage.getItem('platform_time_source');
    if (savedTimeSource === 'manual') {
        const savedManualTime = localStorage.getItem('platform_manual_time');
        if (savedManualTime) {
            setManualDateTime(new Date(savedManualTime).toISOString().slice(0, 16));
        }
        setTimeSource('manual');
    }

    const savedTaskResetTime = localStorage.getItem('platform_task_reset_time');
    if (savedTaskResetTime) {
        setTaskResetTime(savedTaskResetTime);
    }


    fetchTime();
    const liveTimer = setInterval(() => {
        if(timeSource === 'live') {
            setLiveTime(prev => new Date(prev.getTime() + 1000));
        }
    }, 1000);
    return () => clearInterval(liveTimer);
  }, []);

  const handleSaveSettings = () => {
      localStorage.setItem('platform_time_source', timeSource);
      if (timeSource === 'manual') {
          localStorage.setItem('platform_manual_time', new Date(manualDateTime).toISOString());
      }
      localStorage.setItem('platform_task_reset_time', taskResetTime);
      toast({ title: "Time Settings Saved", description: `Platform is now using ${timeSource} time and task reset is at ${taskResetTime} IST.`});
  }

  const displayTime = timeSource === 'live' ? liveTime : new Date(manualDateTime);

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
            <CardTitle>Time Source</CardTitle>
            <CardDescription>Select the source for the platform's time.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={timeSource} onValueChange={(v) => setTimeSource(v as 'live' | 'manual')} className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <RadioGroupItem value="live" id="live" className="mt-1"/>
                    <Label htmlFor="live" className="flex-1 cursor-pointer">
                        <span className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4"/>Live Internet Time</span>
                        <p className="text-xs font-normal text-muted-foreground mt-1">Uses a reliable internet source for real-world time. Recommended for most cases.</p>
                        <Button onClick={fetchTime} disabled={isLoading} size="sm" className="mt-2">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Sync Now
                        </Button>
                    </Label>
                </div>
                 <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <RadioGroupItem value="manual" id="manual" className="mt-1"/>
                    <Label htmlFor="manual" className="flex-1 cursor-pointer">
                        <span className="font-semibold flex items-center gap-2"><Settings className="h-4 w-4"/>Manual Platform Time</span>
                        <p className="text-xs font-normal text-muted-foreground mt-1">Set a custom date and time for the entire platform. Use with caution.</p>
                        {timeSource === 'manual' && (
                             <div className="mt-2 space-y-2">
                                <Label htmlFor="manual-datetime">Custom Date & Time (UTC)</Label>
                                <Input 
                                    id="manual-datetime"
                                    type="datetime-local" 
                                    value={manualDateTime}
                                    onChange={(e) => setManualDateTime(e.target.value)}
                                />
                            </div>
                        )}
                    </Label>
                </div>
            </RadioGroup>
          </CardContent>
           <CardFooter>
                <Button onClick={handleSaveSettings}>
                    <Save className="mr-2 h-4 w-4" /> Save Time Settings
                </Button>
            </CardFooter>
      </Card>
      
        <Card>
            <CardHeader>
                <CardTitle>Daily Task Reset Time</CardTitle>
                <CardDescription>
                    Set the time of day when all user tasks are reset. (Time is in IST).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Timer className="h-6 w-6 text-muted-foreground" />
                    <div className="space-y-2">
                        <Label htmlFor="task-reset-time">Reset Time (IST)</Label>
                        <Input
                            id="task-reset-time"
                            type="time"
                            value={taskResetTime}
                            onChange={(e) => setTaskResetTime(e.target.value)}
                            className="w-48"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Zone Clocks</CardTitle>
          <CardDescription>
            Live clocks for key platform time zones. Currently showing <strong className="text-primary">{timeSource}</strong> time.
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
                <ClockDisplay timeZone="UTC" format={format} baseTime={displayTime} />
                <ClockDisplay timeZone="Asia/Kolkata" format={format} baseTime={displayTime} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

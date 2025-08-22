
"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Users, DollarSign, CheckSquare, CheckCircle, Lock, PlayCircle, Repeat, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export const levels = [
  {
    level: 1,
    minAmount: 100,
    rate: 1.8,
    referrals: null,
    dailyTasks: 15,
    monthlyWithdrawals: 1,
    minWithdrawal: 150,
  },
  {
    level: 2,
    minAmount: 500,
    rate: 2.8,
    referrals: 8,
    dailyTasks: 25,
    monthlyWithdrawals: 1,
    minWithdrawal: 500,
  },
  {
    level: 3,
    minAmount: 2000,
    rate: 3.8,
    referrals: 16,
    dailyTasks: 35,
    monthlyWithdrawals: 1,
    minWithdrawal: 1500,
  },
  {
    level: 4,
    minAmount: 6000,
    rate: 4.8,
    referrals: 36,
    dailyTasks: 45,
    monthlyWithdrawals: 1,
    minWithdrawal: 2500,
  },
  {
    level: 5,
    minAmount: 20000,
    rate: 5.8,
    referrals: 55,
    dailyTasks: 55,
    monthlyWithdrawals: 2,
    minWithdrawal: 3500,
  },
];

export type Level = typeof levels[0];

interface LevelTiersProps {
    currentBalance: number;
    onStartTasks: () => void;
    isTaskLocked: boolean;
}

export function LevelTiers({ currentBalance, onStartTasks, isTaskLocked }: LevelTiersProps) {
    
  const currentLevel = levels.slice().reverse().find(level => currentBalance >= level.minAmount)?.level ?? 0;

  return (
    <div className="w-full">
         <h2 className="text-2xl font-bold tracking-tight mb-4">Investment Levels</h2>
        <Carousel
            opts={{
                align: "start",
                loop: false,
            }}
            className="w-full"
        >
            <CarouselContent>
            {levels.map((level) => {
                const isUnlocked = currentBalance >= level.minAmount;
                const isCurrentLevel = level.level === currentLevel;
                return (
                <CarouselItem key={level.level} className="basis-full sm:basis-1/2 md:basis-1/3">
                    <div className="p-1 h-full">
                        <Card 
                            className={cn(
                                "h-full flex flex-col", 
                                isCurrentLevel && "border-primary ring-2 ring-primary"
                            )}
                        >
                            <div className="flex-grow">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            Level {level.level}
                                            {isUnlocked ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                                        </span>
                                        <span className="text-sm font-normal text-primary bg-primary/10 px-2 py-1 rounded-full">{level.rate}% Daily</span>
                                    </CardTitle>
                                    {isCurrentLevel && <CardDescription className="text-primary font-semibold">Current Level</CardDescription>}
                                    {!isCurrentLevel && <CardDescription>Unlock new earning potentials.</CardDescription>}
                                </CardHeader>
                                <CardContent className="flex-grow space-y-3">
                                    <div className="flex items-center">
                                        <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
                                        <div className="text-sm">
                                            <p className="font-semibold">${level.minAmount.toLocaleString()}</p>
                                            <p className="text-muted-foreground text-xs">Minimum Amount to Unlock</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckSquare className="h-5 w-5 mr-3 text-muted-foreground" />
                                        <div className="text-sm">
                                            <p className="font-semibold">{level.dailyTasks} Tasks / Day</p>
                                            <p className="text-muted-foreground text-xs">Daily Task Quota</p>
                                        </div>
                                    </div>
                                    {level.referrals !== null && (
                                        <div className="flex items-center">
                                            <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                                            <div className="text-sm">
                                                <p className="font-semibold">{level.referrals} Direct Referrals</p>
                                                <p className="text-muted-foreground text-xs">Required to Unlock</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <Repeat className="h-5 w-5 mr-3 text-muted-foreground" />
                                        <div className="text-sm">
                                            <p className="font-semibold">{level.monthlyWithdrawals}x per Month</p>
                                            <p className="text-muted-foreground text-xs">Withdrawal Limit</p>
                                        </div>
                                    </div>
                                     <div className="flex items-center">
                                        <Landmark className="h-5 w-5 mr-3 text-muted-foreground" />
                                        <div className="text-sm">
                                            <p className="font-semibold">${level.minWithdrawal.toLocaleString()}</p>
                                            <p className="text-muted-foreground text-xs">Minimum Withdrawal</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                             {isCurrentLevel && (
                                <CardFooter>
                                    <Button onClick={onStartTasks} disabled={isTaskLocked} className="w-full">
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        {isTaskLocked ? "Tasks Locked" : "Start Tasks"}
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </div>
                </CarouselItem>
                )
            })}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 transform" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 transform" />
        </Carousel>
    </div>
  );
}

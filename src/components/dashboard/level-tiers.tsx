
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
import { Users, DollarSign, CheckSquare, CheckCircle, Lock, PlayCircle, Repeat, Landmark, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export const levels = [
  {
    level: 0,
    minAmount: 0,
    rate: 0,
    referrals: null,
    dailyTasks: 0,
    monthlyWithdrawals: 0,
    minWithdrawal: 0,
    earningPerTask: 0,
  },
  {
    level: 1,
    minAmount: 100,
    rate: 1.8,
    referrals: null,
    dailyTasks: 15,
    monthlyWithdrawals: 1,
    minWithdrawal: 150,
    earningPerTask: 0.30,
  },
  {
    level: 2,
    minAmount: 500,
    rate: 2.8,
    referrals: 8,
    dailyTasks: 25,
    monthlyWithdrawals: 1,
    minWithdrawal: 500,
    earningPerTask: 0.50,
  },
  {
    level: 3,
    minAmount: 2000,
    rate: 3.8,
    referrals: 16,
    dailyTasks: 35,
    monthlyWithdrawals: 1,
    minWithdrawal: 1500,
    earningPerTask: 1.10,
  },
  {
    level: 4,
    minAmount: 6000,
    rate: 4.8,
    referrals: 36,
    dailyTasks: 45,
    monthlyWithdrawals: 1,
    minWithdrawal: 2500,
    earningPerTask: 2.50,
  },
  {
    level: 5,
    minAmount: 20000,
    rate: 5.8,
    referrals: 55,
    dailyTasks: 55,
    monthlyWithdrawals: 2,
    minWithdrawal: 3500,
    earningPerTask: 5.00,
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
            {levels.filter(l => l.level > 0).map((level) => {
                const isUnlocked = currentBalance >= level.minAmount;
                const isCurrentLevel = level.level === currentLevel;
                return (
                <CarouselItem key={level.level} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pb-4">
                    <div className="p-1 h-full">
                        <Card 
                            className={cn(
                                "h-full flex flex-col speech-bubble", 
                                isCurrentLevel && "is-current border-primary ring-2 ring-primary"
                            )}
                        >
                            <div className="flex-grow">
                                <CardHeader className="p-3">
                                    <CardTitle className="flex items-center justify-between text-base">
                                        <span className="flex items-center gap-1.5">
                                            Level {level.level}
                                            {isUnlocked ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                                        </span>
                                    </CardTitle>
                                    <CardDescription>
                                         {isCurrentLevel ? <span className="text-primary font-semibold">Current Level</span> : "Unlock new potentials"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-2 p-3">
                                    <div className="flex items-center text-xs">
                                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <p>Min. <strong className="font-semibold">${level.minAmount.toLocaleString()}</strong></p>
                                    </div>
                                    <div className="flex items-center text-xs">
                                        <CheckSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <p><strong className="font-semibold">{level.dailyTasks}</strong> Tasks / Day</p>
                                    </div>
                                    <div className="flex items-center text-xs">
                                        <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <p><strong className="font-semibold">{level.rate}%</strong> Daily Rate</p>
                                    </div>
                                </CardContent>
                            </div>
                             {isCurrentLevel && (
                                <CardFooter className="p-3">
                                    <Button onClick={onStartTasks} disabled={isTaskLocked} className="w-full" size="sm">
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

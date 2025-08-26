

"use client";

import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Users, DollarSign, CheckSquare, CheckCircle, Lock, PlayCircle, Repeat, Landmark, Percent, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { Progress } from "@/components/ui/progress";

export type Level = {
    level: number;
    name: string;
    minAmount: number;
    rate: number;
    referrals: number;
    dailyTasks: number;
    monthlyWithdrawals: number;
    minWithdrawal: number;
    earningPerTask: number;
    withdrawalFee: number;
};

export const levels: Level[] = [
  {
    level: 0,
    name: "Unranked",
    minAmount: 0,
    rate: 0,
    referrals: 0,
    dailyTasks: 0,
    monthlyWithdrawals: 0,
    minWithdrawal: 0,
    earningPerTask: 0,
    withdrawalFee: 0,
  },
  {
    level: 1,
    name: "Bronze",
    minAmount: 100,
    rate: 1.8,
    referrals: 0,
    dailyTasks: 15,
    monthlyWithdrawals: 1,
    minWithdrawal: 150,
    earningPerTask: 0.30,
    withdrawalFee: 5,
  },
  {
    level: 2,
    name: "Silver",
    minAmount: 500,
    rate: 2.8,
    referrals: 8,
    dailyTasks: 25,
    monthlyWithdrawals: 1,
    minWithdrawal: 500,
    earningPerTask: 0.50,
    withdrawalFee: 3,
  },
  {
    level: 3,
    name: "Gold",
    minAmount: 2000,
    rate: 3.8,
    referrals: 16,
    dailyTasks: 35,
    monthlyWithdrawals: 1,
    minWithdrawal: 1500,
    earningPerTask: 1.10,
    withdrawalFee: 1,
  },
  {
    level: 4,
    name: "Platinum",
    minAmount: 6000,
    rate: 4.8,
    referrals: 36,
    dailyTasks: 45,
    monthlyWithdrawals: 1,
    minWithdrawal: 2500,
    earningPerTask: 2.50,
    withdrawalFee: 1,
  },
  {
    level: 5,
    name: "Diamond",
    minAmount: 20000,
    rate: 5.8,
    referrals: 55,
    dailyTasks: 55,
    monthlyWithdrawals: 2,
    minWithdrawal: 3500,
    earningPerTask: 5.00,
    withdrawalFee: 1,
  },
];


interface LevelTiersProps {
    onStartTasks: () => void;
    isTaskLocked: boolean;
}

export function LevelTiers({ onStartTasks, isTaskLocked }: LevelTiersProps) {
    
  const { currentLevel, levelUnlockProgress } = useWallet();
  const [displayLevels, setDisplayLevels] = useState<Level[]>(levels.filter(l => l.level > 0));

  useEffect(() => {
    const storedLevels = localStorage.getItem("platform_levels");
    if (storedLevels) {
        const parsedLevels = JSON.parse(storedLevels);
        setDisplayLevels(parsedLevels);
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
         <h2 className="text-2xl font-bold tracking-tight mb-4">Investment Levels</h2>
        <Carousel
            opts={{
                align: "start",
                loop: false,
            }}
            className="w-full"
        >
            <CarouselContent className="-ml-2">
            {displayLevels.map((level) => {
                const { isUnlocked, isCurrentLevel, referralProgress = 0, currentReferrals = 0 } = levelUnlockProgress[level.level] || {};
                return (
                <CarouselItem key={level.level} className="basis-full pl-2 pb-4">
                    <div className="h-full">
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
                                            {level.name}
                                            {isUnlocked ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                                        </span>
                                    </CardTitle>
                                    <CardDescription>
                                         {isCurrentLevel ? <span className="text-primary font-semibold">Current Level</span> : `Level ${level.level}`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-2 p-3">
                                    <div className="flex items-center text-xs">
                                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <p>Min. <strong className="font-semibold">${level.minAmount.toLocaleString()}</strong></p>
                                    </div>
                                    
                                     <div className="space-y-2">
                                        <div className="flex items-center text-xs">
                                            <UserPlus className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <p>Min. <strong className="font-semibold">{level.referrals}</strong> Referrals</p>
                                        </div>
                                        {level.referrals > 0 && (
                                            <>
                                            <Progress value={referralProgress} className="h-1.5"/>
                                            <p className="text-xs text-muted-foreground text-right">{currentReferrals} / {level.referrals}</p>
                                            </>
                                        )}
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

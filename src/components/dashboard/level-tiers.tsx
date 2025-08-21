"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, DollarSign, Percent, TrendingUp } from "lucide-react";

const levels = [
  {
    level: 1,
    minAmount: 100,
    rate: 1.8,
    referrals: null,
  },
  {
    level: 2,
    minAmount: 500,
    rate: 2.8,
    referrals: null,
  },
  {
    level: 3,
    minAmount: 2000,
    rate: 3.8,
    referrals: 8,
  },
  {
    level: 4,
    minAmount: 6000,
    rate: 4.8,
    referrals: 15,
  },
  {
    level: 5,
    minAmount: 20000,
    rate: 5.8,
    referrals: 36,
  },
];

export function LevelTiers() {
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
            {levels.map((level) => (
                <CarouselItem key={level.level} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="p-1">
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Level {level.level}</span>
                                    <span className="text-sm font-normal text-primary bg-primary/10 px-2 py-1 rounded-full">{level.rate}% APY</span>
                                </CardTitle>
                                <CardDescription>Unlock new earning potentials.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <div className="flex items-center">
                                    <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
                                    <div className="text-sm">
                                        <p className="font-semibold">${level.minAmount.toLocaleString()}</p>
                                        <p className="text-muted-foreground text-xs">Minimum Amount to Unlock</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-3 text-muted-foreground" />
                                    <div className="text-sm">
                                        <p className="font-semibold">{level.rate}%</p>
                                        <p className="text-muted-foreground text-xs">Interest Rate</p>
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
                            </CardContent>
                        </Card>
                    </div>
                </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 transform" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 transform" />
        </Carousel>
    </div>
  );
}

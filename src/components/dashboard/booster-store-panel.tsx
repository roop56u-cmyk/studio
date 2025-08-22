
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
import { useToast } from "@/hooks/use-toast";
import { Flame, Star, Zap, Users, ShieldAlert, UserPlus } from "lucide-react";
import type { Booster } from "@/contexts/WalletContext";
import { useWallet } from "@/contexts/WalletContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "../ui/scroll-area";

const boosterIcons: { [key in Booster['type']]: React.ReactNode } = {
    TASK_EARNING: <Star className="h-6 w-6 text-yellow-500" />,
    TASK_QUOTA: <Zap className="h-6 w-6 text-green-500" />,
    INTEREST_RATE: <Zap className="h-6 w-6 text-blue-500" />,
    REFERRAL_COMMISSION: <Users className="h-6 w-6 text-purple-500" />,
    PURCHASE_REFERRAL: <UserPlus className="h-6 w-6 text-indigo-500" />,
};

const boosterValueFormatter = (type: Booster['type'], value: number) => {
    switch (type) {
        case "TASK_EARNING":
        case "INTEREST_RATE":
        case "REFERRAL_COMMISSION":
            return `+${value}%`;
        case "TASK_QUOTA":
            return `+${value} Tasks`;
        case "PURCHASE_REFERRAL":
             return `+${value} Referrals`;
    }
}

export function BoosterStorePanel() {
    const { toast } = useToast();
    const { purchaseBooster, mainBalance, activeBoosters } = useWallet();
    const [boosters, setBoosters] = useState<Booster[]>([]);
    
    useEffect(() => {
        const storedBoosters = localStorage.getItem("platform_boosters");
        if (storedBoosters) {
            setBoosters(JSON.parse(storedBoosters).filter((b: Booster) => b.enabled));
        }
    }, []);

    const isBoosterActive = (type: Booster['type']) => {
        if (type === 'PURCHASE_REFERRAL') return false; // This is a one-time purchase, not an active boost
        return activeBoosters.some(b => b.type === type);
    }

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="grid gap-4 pr-6">
            {boosters.length > 0 ? (
            boosters.map((booster) => (
                <Card key={booster.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {boosterIcons[booster.type]}
                                    {booster.name}
                                </CardTitle>
                                <CardDescription className="mt-2">{booster.description}</CardDescription>
                            </div>
                            <Badge variant="secondary">{boosterValueFormatter(booster.type, booster.value)}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">
                             <span className="font-semibold">Duration:</span> {booster.type === 'PURCHASE_REFERRAL' ? 'Instant' : `${booster.duration} hours`}
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <div className="text-lg font-bold text-primary">${booster.price.toFixed(2)}</div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={isBoosterActive(booster.type)}>
                                    {isBoosterActive(booster.type) ? "Already Active" : "Purchase"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to buy the "{booster.name}" booster for ${booster.price.toFixed(2)}? This amount will be deducted from your main wallet balance.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                {mainBalance < booster.price && (
                                    <div className="flex items-center gap-2 text-destructive border border-destructive/50 p-2 rounded-md">
                                        <ShieldAlert className="h-5 w-5"/>
                                        <p className="text-sm">You have insufficient funds in your main wallet.</p>
                                    </div>
                                )}
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        disabled={mainBalance < booster.price} 
                                        onClick={() => purchaseBooster(booster)}
                                    >
                                        Confirm Purchase
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            ))
            ) : (
            <p className="text-muted-foreground col-span-full text-center py-12">No boosters are available at the moment. Please check back later.</p>
            )}
        </div>
    </ScrollArea>
  );
}

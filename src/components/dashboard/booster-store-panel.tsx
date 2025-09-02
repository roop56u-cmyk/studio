
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { platformMessages } from "@/lib/platform-messages";
import { useAuth } from "@/contexts/AuthContext";

const boosterIcons: { [key in Booster['type']]: React.ReactNode } = {
    TASK_EARNING: <Star className="h-6 w-6 text-yellow-500" />,
    TASK_QUOTA: <Zap className="h-6 w-6 text-green-500" />,
    INTEREST_RATE: <Zap className="h-6 w-6 text-blue-500" />,
    REFERRAL_COMMISSION: <Users className="h-6 w-6 text-purple-500" />,
    PURCHASE_REFERRAL: <UserPlus className="h-6 w-6 text-indigo-500" />,
};

const getGlobalSetting = (key: string, defaultValue: any, isJson: boolean = false) => {
    if (typeof window === 'undefined') {
    return defaultValue;
    }
    try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        if (isJson) {
            return JSON.parse(storedValue);
        }
        return storedValue;
    }
    } catch (error) {
    console.error(`Failed to parse global setting ${key} from localStorage`, error);
    }
    return defaultValue;
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
    const { currentUser } = useAuth();
    const { 
        purchaseBooster, 
        mainBalance, 
        activeBoosters, 
        purchasedBoosterIds,
        isFundMovementLocked,
        tasksCompletedToday,
        interestCounter,
        currentLevel,
        setIsInactiveWarningOpen
    } = useWallet();
    const [boosters, setBoosters] = useState<Booster[]>([]);
     const [messages, setMessages] = useState<any>({});

     useEffect(() => {
        const storedMessages = getGlobalSetting("platform_custom_messages", {}, true);
        const defaults: any = {};
        Object.entries(platformMessages).forEach(([catKey, category]) => {
            defaults[catKey] = {};
            Object.entries(category.messages).forEach(([msgKey, msgItem]) => {
                defaults[catKey][msgKey] = msgItem.defaultValue;
            });
        });
        const mergedMessages = { ...defaults, ...storedMessages };
        setMessages(mergedMessages);
    }, []);
    
    useEffect(() => {
        const storedBoosters = localStorage.getItem("platform_boosters");
        if (storedBoosters) {
            const allBoosters: Booster[] = JSON.parse(storedBoosters);
            const availableBoosters = allBoosters.filter(b => b.enabled && (b.level === 0 || b.level <= currentLevel));
            setBoosters(availableBoosters);
        }
    }, [currentLevel]);

    const handlePurchase = (booster: Booster) => {
        if (currentUser?.status !== 'active') {
            setIsInactiveWarningOpen(true);
            return;
        }
        purchaseBooster(booster);
    }
    
    const isPurchaseLocked = interestCounter.isRunning || (tasksCompletedToday > 0);
    
    const getButtonState = (booster: Booster): { text: string; disabled: boolean, tooltip: string | null } => {
        if (currentUser?.status !== 'active') {
            return { text: "Purchase", disabled: true, tooltip: "Activate your account to purchase." };
        }
        if (isPurchaseLocked && booster.type !== 'PURCHASE_REFERRAL') {
             return { text: "Purchase", disabled: true, tooltip: "Complete daily activities before purchasing." };
        }
        if (purchasedBoosterIds.includes(booster.id)) {
            return { text: "Purchased", disabled: true, tooltip: "You have already purchased this item." };
        }
        return { text: "Purchase", disabled: false, tooltip: null };
    };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="grid gap-4 pr-6">
            {boosters.length > 0 ? (
            boosters.map((booster) => {
                const buttonState = getButtonState(booster);
                const purchaseButton = (
                     <Button 
                        disabled={buttonState.disabled} 
                        onClick={
                            currentUser?.status !== 'active' ? 
                            () => setIsInactiveWarningOpen(true) : 
                            undefined // This allows the AlertDialog trigger to work normally
                        }
                    >
                        {buttonState.text}
                    </Button>
                );

                const triggerButton = (
                    buttonState.tooltip ? (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span tabIndex={0}>{purchaseButton}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{buttonState.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : purchaseButton
                );

                return (
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
                             <span className="font-semibold">Level:</span> {booster.level === 0 ? 'All Levels' : `Level ${booster.level}+`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                             <span className="font-semibold">Duration:</span> {booster.type === 'PURCHASE_REFERRAL' ? 'Permanent' : `${booster.duration} hours`}
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <div className="text-lg font-bold text-primary">${booster.price.toFixed(2)}</div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                {triggerButton}
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{messages.boosters?.confirmPurchaseTitle}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {messages.boosters?.confirmPurchaseDescription
                                            ?.replace('[BoosterName]', booster.name)
                                            ?.replace('[BoosterPrice]', booster.price.toFixed(2))
                                        }
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                {mainBalance < booster.price && (
                                    <div className="flex items-center gap-2 text-destructive border border-destructive/50 p-2 rounded-md">
                                        <ShieldAlert className="h-5 w-5"/>
                                        <p className="text-sm">{messages.boosters?.insufficientFundsDescription}</p>
                                    </div>
                                )}
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        disabled={mainBalance < booster.price} 
                                        onClick={() => handlePurchase(booster)}
                                    >
                                        Confirm Purchase
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
                )
            })
            ) : (
            <p className="text-muted-foreground col-span-full text-center py-12">No boosters are available at the moment. Please check back later.</p>
            )}
        </div>
    </ScrollArea>
  );
}

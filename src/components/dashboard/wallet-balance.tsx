
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet2, ArrowLeftRight, ArrowRight } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WalletBalanceProps {
    title: string;
    description: string;
    balance: string;
    onMoveToMain?: (amount: number) => void;
    showMoveToOther?: boolean;
    gradientClass?: string;
}

export function WalletBalance({ title, description, balance = "0.00", onMoveToMain, showMoveToOther = false, gradientClass = "" }: WalletBalanceProps) {
  const [moveAmount, setMoveAmount] = useState("");
  const { toast } = useToast();
  const { handleMoveFunds, isFundMovementLocked } = useWallet();
  const [isInterestWarningOpen, setIsInterestWarningOpen] = useState(false);
  const [isTaskWarningOpen, setIsTaskWarningOpen] = useState(false);
  
  const canMove = parseFloat(balance) > 0;
  
  const isInterestLockActive = isFundMovementLocked('interest');
  const isTaskLockActive = isFundMovementLocked('task');

  const handleFundMovement = (destination: 'Task Rewards' | 'Interest Earnings' | 'Main Wallet', fromAccount?: 'Task Rewards' | 'Interest Earnings') => {
    
    const numericAmount = parseFloat(moveAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid positive amount to move." });
      return;
    }
    
    // Check interest lock
    if ((destination === 'Interest Earnings' || fromAccount === 'Interest Earnings') && isInterestLockActive) {
      setIsInterestWarningOpen(true);
      return;
    }
    
    // Check task lock
    if ((destination === 'Task Rewards' || fromAccount === 'Task Rewards') && isTaskLockActive) {
      setIsTaskWarningOpen(true);
      return;
    }

    if (destination === 'Main Wallet') {
       if (!onMoveToMain) return;
        
        if (numericAmount > parseFloat(balance)) {
          toast({ variant: "destructive", title: "Insufficient Funds", description: `You cannot move more than the available balance of $${balance}.` });
          return;
        }
        
        onMoveToMain(numericAmount);
        setMoveAmount("");
    } else {
        if (numericAmount > parseFloat(balance)) {
            toast({ variant: "destructive", title: "Insufficient Funds" });
            return;
        }

        handleMoveFunds(destination, numericAmount, fromAccount);
        setMoveAmount("");
    }
  };


  return (
    <>
    <Card className={cn("relative overflow-hidden flex flex-col", gradientClass, gradientClass && "text-white")}>
      <div className={cn("absolute top-0 left-0 h-1 w-full", gradientClass ? "bg-white/30" : "bg-primary")} />
      <CardHeader className="p-3">
        <div className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium">
            {title}
          </CardTitle>
          <Wallet2 className={cn("h-4 w-4", gradientClass ? "text-white/80" : "text-muted-foreground")} />
        </div>
      </CardHeader>
      <CardContent className="pt-0 p-3">
        <div className="text-2xl font-bold">${balance}</div>
        <p className={cn("text-xs leading-tight", gradientClass ? "text-white/80" : "text-muted-foreground")}>
          {description}
        </p>
         {title === 'Interest Earnings' && isInterestLockActive && (
            <p className="text-xs text-yellow-300 mt-1">Cannot move funds while timer is active.</p>
        )}
         {title === 'Task Rewards' && isTaskLockActive && (
            <p className="text-xs text-yellow-300 mt-1">Cannot move funds while tasks are in progress.</p>
        )}
      </CardContent>
       {(onMoveToMain || showMoveToOther) && (
        <CardFooter className="pt-2 flex-col items-start gap-1 mt-auto p-3">
          <div className="w-full flex flex-col items-start gap-1">
            <Input 
              type="number" 
              placeholder="Amount" 
              className="h-7 text-xs bg-white/20 text-white placeholder:text-white/60 border-white/30 focus:bg-white/30"
              value={moveAmount}
              onChange={(e) => setMoveAmount(e.target.value)}
              disabled={!canMove}
            />
            <div className="flex items-center gap-1 w-full">
            {onMoveToMain && (
                <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs flex-1 px-2 bg-white/10 hover:bg-white/20 border-white/20 text-white"
                onClick={() => handleFundMovement('Main Wallet', title === 'Task Rewards' ? 'Task Rewards' : 'Interest Earnings')}
                disabled={!canMove}
                >
                <ArrowLeftRight className="mr-1 h-3 w-3" />
                To Main
                </Button>
            )}
             {showMoveToOther && (
             <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs flex-1 px-2 bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={() => handleFundMovement(title === "Task Rewards" ? "Interest Earnings" : "Task Rewards", title === 'Task Rewards' ? 'Task Rewards' : 'Interest Earnings')}
              disabled={!canMove}
            >
              <ArrowRight className="mr-1 h-3 w-3" />
              To {title === "Task Rewards" ? "Interest" : "Tasks"}
            </Button>
           )}
           </div>
          </div>
        </CardFooter>
      )}
    </Card>
    <AlertDialog open={isInterestWarningOpen} onOpenChange={setIsInterestWarningOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Action Locked</AlertDialogTitle>
                <AlertDialogDescription>
                    You cannot move funds to or from the Interest Earnings wallet while the 24-hour interest timer is active. Please wait for the timer to complete.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsInterestWarningOpen(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
     <AlertDialog open={isTaskWarningOpen} onOpenChange={setIsTaskWarningOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Action Locked</AlertDialogTitle>
                <AlertDialogDescription>
                   You cannot move funds to or from the Task Rewards wallet while your daily tasks are in progress. Please complete all tasks for today to unlock fund movements for this wallet.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsTaskWarningOpen(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}



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

interface WalletBalanceProps {
    title: string;
    description: string;
    balance: string;
    onMoveToMain?: (amount: number) => void;
    showMoveToOther?: boolean;
    accentColor?: string;
}

export function WalletBalance({ title, description, balance = "0.00", onMoveToMain, showMoveToOther = false, accentColor = "bg-primary" }: WalletBalanceProps) {
  const [moveAmount, setMoveAmount] = useState("");
  const { toast } = useToast();
  const { handleMoveFunds } = useWallet();
  const canMove = parseFloat(balance) > 0;

  const handleMoveClick = () => {
    if (!onMoveToMain) return;

    const numericAmount = parseFloat(moveAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid positive amount to move.",
      });
      return;
    }
    
    if (numericAmount > parseFloat(balance)) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: `You cannot move more than the available balance of $${balance}.`,
      });
      return;
    }
    
    onMoveToMain(numericAmount);
    setMoveAmount("");
  };

  const handleMoveToOther = () => {
      const numericAmount = parseFloat(moveAmount);
       if (isNaN(numericAmount) || numericAmount <= 0) {
          toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount." });
          return;
        }

        if (numericAmount > parseFloat(balance)) {
            toast({ variant: "destructive", title: "Insufficient Funds" });
            return;
        }

        if (title === "Task Rewards") {
            handleMoveFunds("Interest Earnings", numericAmount, "Task Rewards");
        } else {
            handleMoveFunds("Task Rewards", numericAmount, "Interest Earnings");
        }
        setMoveAmount("");
  };

  return (
    <Card className="relative overflow-hidden flex flex-col">
      <div className={cn("absolute top-0 left-0 h-1 w-full", accentColor)} />
      <CardHeader>
        <div className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium">
            {title}
          </CardTitle>
          <Wallet2 className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl font-bold">${balance}</div>
        <p className="text-xs text-muted-foreground leading-tight">
          {description}
        </p>
      </CardContent>
       {(onMoveToMain || showMoveToOther) && (
        <CardFooter className="pt-2 flex-col items-start gap-2 mt-auto">
          <div className="w-full flex items-center gap-1">
            <Input 
              type="number" 
              placeholder="Amount" 
              className="h-8 text-xs"
              value={moveAmount}
              onChange={(e) => setMoveAmount(e.target.value)}
              disabled={!canMove}
            />
            {onMoveToMain && (
                <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs px-2"
                onClick={handleMoveClick}
                disabled={!canMove}
                >
                <ArrowLeftRight className="mr-1 h-3 w-3" />
                To Main
                </Button>
            )}
          </div>
           {showMoveToOther && (
             <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-full text-xs"
              onClick={handleMoveToOther}
              disabled={!canMove}
            >
              <ArrowRight className="mr-1 h-3 w-3" />
              Move to {title === "Task Rewards" ? "Interest" : "Tasks"}
            </Button>
           )}
        </CardFooter>
      )}
    </Card>
  );
}


